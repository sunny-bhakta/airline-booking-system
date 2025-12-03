import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { CreateTravelPreferenceDto } from './dto/create-travel-preference.dto';
import { CreateLoyaltyMembershipDto } from './dto/create-loyalty-membership.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { UserStatus } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'Default Registration',
        value: {
          username: 'johndoe',
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Login with Email',
        value: {
          email: 'john.doe@example.com',
          password: 'SecurePass123!',
        },
      },
      username: {
        summary: 'Login with Username',
        value: {
          username: 'johndoe',
          password: 'SecurePass123!',
        },
      },
    },
  })
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user (Admin)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users with filters' })
  @ApiResponse({ status: 200, description: 'Search results with pagination' })
  @ApiQuery({ name: 'email', required: false, description: 'Email address' })
  @ApiQuery({ name: 'username', required: false, description: 'Username' })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['customer', 'guest', 'registered_user', 'admin', 'airline_staff', 'travel_agent'],
    description: 'User role',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    description: 'User status',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  search(@Query() searchUsersDto: SearchUsersDto) {
    return this.usersService.search(searchUsersDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get user bookings' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserBookings(@Param('id') id: string) {
    return this.usersService.getUserBookings(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: UpdateUserDto })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(UserStatus),
        },
      },
    },
  })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
  ) {
    return this.usersService.updateStatus(id, status);
  }

  @Post(':id/verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  verifyEmail(@Param('id') id: string) {
    return this.usersService.verifyEmail(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // User Profile endpoints
  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: CreateUserProfileDto })
  updateProfile(
    @Param('id') id: string,
    @Body() createUserProfileDto: CreateUserProfileDto,
  ) {
    return this.usersService.updateProfile(id, createUserProfileDto);
  }

  // Payment Methods endpoints
  @Post(':id/payment-methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add payment method' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 201, description: 'Payment method added successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: CreatePaymentMethodDto })
  addPaymentMethod(
    @Param('id') id: string,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    return this.usersService.addPaymentMethod(id, createPaymentMethodDto);
  }

  @Get(':id/payment-methods')
  @ApiOperation({ summary: 'Get user payment methods' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'List of payment methods' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getPaymentMethods(@Param('id') id: string) {
    return this.usersService.getPaymentMethods(id);
  }

  @Delete(':id/payment-methods/:paymentMethodId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove payment method' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiParam({ name: 'paymentMethodId', description: 'Payment method UUID' })
  @ApiResponse({ status: 204, description: 'Payment method removed' })
  @ApiResponse({ status: 404, description: 'Payment method not found' })
  removePaymentMethod(
    @Param('id') id: string,
    @Param('paymentMethodId') paymentMethodId: string,
  ) {
    return this.usersService.removePaymentMethod(id, paymentMethodId);
  }

  // Travel Preferences endpoints
  @Patch(':id/travel-preferences')
  @ApiOperation({ summary: 'Update travel preferences' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Travel preferences updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: CreateTravelPreferenceDto })
  updateTravelPreferences(
    @Param('id') id: string,
    @Body() createTravelPreferenceDto: CreateTravelPreferenceDto,
  ) {
    return this.usersService.updateTravelPreferences(id, createTravelPreferenceDto);
  }

  @Get(':id/travel-preferences')
  @ApiOperation({ summary: 'Get user travel preferences' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'Travel preferences' })
  @ApiResponse({ status: 404, description: 'User or preferences not found' })
  getTravelPreferences(@Param('id') id: string) {
    return this.usersService.getTravelPreferences(id);
  }

  // Loyalty Memberships endpoints
  @Post(':id/loyalty-memberships')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add loyalty membership' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 201, description: 'Loyalty membership added successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Membership number already exists' })
  @ApiBody({ type: CreateLoyaltyMembershipDto })
  addLoyaltyMembership(
    @Param('id') id: string,
    @Body() createLoyaltyMembershipDto: CreateLoyaltyMembershipDto,
  ) {
    return this.usersService.addLoyaltyMembership(id, createLoyaltyMembershipDto);
  }

  @Get(':id/loyalty-memberships')
  @ApiOperation({ summary: 'Get user loyalty memberships' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'List of loyalty memberships' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getLoyaltyMemberships(@Param('id') id: string) {
    return this.usersService.getLoyaltyMemberships(id);
  }

  @Delete(':id/loyalty-memberships/:membershipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove loyalty membership' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiParam({ name: 'membershipId', description: 'Loyalty membership UUID' })
  @ApiResponse({ status: 204, description: 'Loyalty membership removed' })
  @ApiResponse({ status: 404, description: 'Loyalty membership not found' })
  removeLoyaltyMembership(
    @Param('id') id: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.usersService.removeLoyaltyMembership(id, membershipId);
  }
}

