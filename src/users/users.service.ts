import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import {
  User,
  UserRole,
  UserStatus,
  UserProfile,
  PaymentMethod,
  TravelPreference,
  LoyaltyMembership,
} from './entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreateTravelPreferenceDto } from './dto/create-travel-preference.dto';
import { CreateLoyaltyMembershipDto } from './dto/create-loyalty-membership.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private userProfileRepository: Repository<UserProfile>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(TravelPreference)
    private travelPreferenceRepository: Repository<TravelPreference>,
    @InjectRepository(LoyaltyMembership)
    private loyaltyMembershipRepository: Repository<LoyaltyMembership>,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Verify password
   */
  private verifyPassword(password: string, hashedPassword: string): boolean {
    const hash = this.hashPassword(password);
    return hash === hashedPassword;
  }

  /**
   * Generate a session token
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if username already exists (if provided)
    if (registerDto.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: registerDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    // Create user
    const user = this.userRepository.create({
      username: registerDto.username,
      email: registerDto.email,
      password: this.hashPassword(registerDto.password),
      role: UserRole.REGISTERED_USER,
      status: UserStatus.PENDING_VERIFICATION,
      isEmailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);

    // Create user profile if firstName or lastName provided
    if (registerDto.firstName || registerDto.lastName) {
      const profile = this.userProfileRepository.create({
        userId: savedUser.id,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
      await this.userProfileRepository.save(profile);
    }

    return await this.findOne(savedUser.id);
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<{ user: User; token: string }> {
    if (!loginDto.email && !loginDto.username) {
      throw new BadRequestException('Email or username is required');
    }

    const user = await this.userRepository.findOne({
      where: loginDto.email
        ? { email: loginDto.email }
        : { username: loginDto.username },
      relations: ['profile', 'paymentMethods', 'travelPreferences', 'loyaltyMemberships'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!this.verifyPassword(loginDto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Generate session token
    const token = this.generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    user.sessionToken = token;
    user.sessionExpiresAt = expiresAt;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Remove sensitive data
    const userResponse = { ...user };
    delete userResponse.password;
    delete userResponse.twoFactorSecret;

    return {
      user: userResponse,
      token,
    };
  }

  /**
   * Create a new user (admin function)
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if username already exists (if provided)
    if (createUserDto.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: this.hashPassword(createUserDto.password),
      role: createUserDto.role || UserRole.CUSTOMER,
      status: createUserDto.status || UserStatus.PENDING_VERIFICATION,
    });

    return await this.userRepository.save(user);
  }

  /**
   * Find all users
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['profile', 'paymentMethods', 'travelPreferences', 'loyaltyMemberships'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find user by ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile', 'paymentMethods', 'travelPreferences', 'loyaltyMemberships'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'paymentMethods', 'travelPreferences', 'loyaltyMemberships'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  /**
   * Search users with filters
   */
  async search(searchUsersDto: SearchUsersDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      email,
      username,
      role,
      status,
      page = 1,
      limit = 10,
    } = searchUsersDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.paymentMethods', 'paymentMethods')
      .leftJoinAndSelect('user.travelPreferences', 'travelPreferences')
      .leftJoinAndSelect('user.loyaltyMemberships', 'loyaltyMemberships');

    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', {
        email: `%${email}%`,
      });
    }

    if (username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');

    const total = await queryBuilder.getCount();

    const users = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { users, total, page, limit };
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is being changed and already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }
    }

    // Check if username is being changed and already exists
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUsername = await this.userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUsername) {
        throw new ConflictException('Username already taken');
      }
    }

    // Hash password if being updated
    if (updateUserDto.password) {
      updateUserDto.password = this.hashPassword(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  /**
   * Delete user
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    createUserProfileDto: CreateUserProfileDto,
  ): Promise<UserProfile> {
    const user = await this.findOne(userId);

    let profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      profile = this.userProfileRepository.create({
        userId,
        ...createUserProfileDto,
        dateOfBirth: createUserProfileDto.dateOfBirth
          ? new Date(createUserProfileDto.dateOfBirth)
          : null,
        passportExpiryDate: createUserProfileDto.passportExpiryDate
          ? new Date(createUserProfileDto.passportExpiryDate)
          : null,
      });
    } else {
      Object.assign(profile, {
        ...createUserProfileDto,
        dateOfBirth: createUserProfileDto.dateOfBirth
          ? new Date(createUserProfileDto.dateOfBirth)
          : null,
        passportExpiryDate: createUserProfileDto.passportExpiryDate
          ? new Date(createUserProfileDto.passportExpiryDate)
          : null,
      });
    }

    return await this.userProfileRepository.save(profile);
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(
    userId: string,
    createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    await this.findOne(userId); // Verify user exists

    // If this is set as default, unset other default payment methods
    if (createPaymentMethodDto.isDefault) {
      await this.paymentMethodRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const paymentMethod = this.paymentMethodRepository.create({
      userId,
      ...createPaymentMethodDto,
      expiryDate: createPaymentMethodDto.expiryDate
        ? new Date(createPaymentMethodDto.expiryDate)
        : null,
    });

    return await this.paymentMethodRepository.save(paymentMethod);
  }

  /**
   * Get payment methods for a user
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    await this.findOne(userId); // Verify user exists

    return await this.paymentMethodRepository.find({
      where: { userId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Remove payment method
   */
  async removePaymentMethod(
    userId: string,
    paymentMethodId: string,
  ): Promise<void> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: paymentMethodId, userId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    await this.paymentMethodRepository.remove(paymentMethod);
  }

  /**
   * Update travel preferences
   */
  async updateTravelPreferences(
    userId: string,
    createTravelPreferenceDto: CreateTravelPreferenceDto,
  ): Promise<TravelPreference> {
    await this.findOne(userId); // Verify user exists

    let preference = await this.travelPreferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      preference = this.travelPreferenceRepository.create({
        userId,
        ...createTravelPreferenceDto,
      });
    } else {
      Object.assign(preference, createTravelPreferenceDto);
    }

    return await this.travelPreferenceRepository.save(preference);
  }

  /**
   * Get travel preferences
   */
  async getTravelPreferences(userId: string): Promise<TravelPreference> {
    await this.findOne(userId); // Verify user exists

    const preference = await this.travelPreferenceRepository.findOne({
      where: { userId },
    });

    if (!preference) {
      throw new NotFoundException('Travel preferences not found');
    }

    return preference;
  }

  /**
   * Add loyalty membership
   */
  async addLoyaltyMembership(
    userId: string,
    createLoyaltyMembershipDto: CreateLoyaltyMembershipDto,
  ): Promise<LoyaltyMembership> {
    await this.findOne(userId); // Verify user exists

    // Check if membership number already exists
    const existing = await this.loyaltyMembershipRepository.findOne({
      where: { membershipNumber: createLoyaltyMembershipDto.membershipNumber },
    });

    if (existing) {
      throw new ConflictException('Membership number already exists');
    }

    const membership = this.loyaltyMembershipRepository.create({
      userId,
      ...createLoyaltyMembershipDto,
      tierExpiryDate: createLoyaltyMembershipDto.tierExpiryDate
        ? new Date(createLoyaltyMembershipDto.tierExpiryDate)
        : null,
    });

    return await this.loyaltyMembershipRepository.save(membership);
  }

  /**
   * Get loyalty memberships for a user
   */
  async getLoyaltyMemberships(userId: string): Promise<LoyaltyMembership[]> {
    await this.findOne(userId); // Verify user exists

    return await this.loyaltyMembershipRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Remove loyalty membership
   */
  async removeLoyaltyMembership(
    userId: string,
    membershipId: string,
  ): Promise<void> {
    const membership = await this.loyaltyMembershipRepository.findOne({
      where: { id: membershipId, userId },
    });

    if (!membership) {
      throw new NotFoundException('Loyalty membership not found');
    }

    await this.loyaltyMembershipRepository.remove(membership);
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string): Promise<User> {
    const user = await this.findOne(userId);

    user.isEmailVerified = true;
    if (user.status === UserStatus.PENDING_VERIFICATION) {
      user.status = UserStatus.ACTIVE;
    }

    return await this.userRepository.save(user);
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: UserStatus): Promise<User> {
    const user = await this.findOne(userId);
    user.status = status;
    return await this.userRepository.save(user);
  }

  /**
   * Get user bookings
   */
  async getUserBookings(userId: string): Promise<any[]> {
    const user = await this.findOne(userId);
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.bookings', 'bookings')
      .leftJoinAndSelect('bookings.flight', 'flight')
      .leftJoinAndSelect('flight.route', 'route')
      .leftJoinAndSelect('route.origin', 'origin')
      .leftJoinAndSelect('route.destination', 'destination')
      .leftJoinAndSelect('bookings.passengers', 'passengers')
      .leftJoinAndSelect('bookings.tickets', 'tickets')
      .where('user.id = :userId', { userId })
      .orderBy('bookings.bookingDate', 'DESC')
      .getOne()
      .then((user) => user?.bookings || []);
  }
}

