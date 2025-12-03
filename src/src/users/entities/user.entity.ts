import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { PaymentMethod } from './payment-method.entity';
import { TravelPreference } from './travel-preference.entity';
import { LoyaltyMembership } from './loyalty-membership.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  GUEST = 'guest',
  REGISTERED_USER = 'registered_user',
  ADMIN = 'admin',
  AIRLINE_STAFF = 'airline_staff',
  TRAVEL_AGENT = 'travel_agent',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['username'], { unique: true, where: '"username" IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true, nullable: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string; // Hashed password

  @Column({
    type: 'varchar',
    length: 50,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    length: 50,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ length: 255, nullable: true })
  twoFactorSecret: string;

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  lastLoginIp: string;

  @Column({ type: 'text', nullable: true })
  sessionToken: string;

  @Column({ type: 'datetime', nullable: true })
  sessionExpiresAt: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: UserProfile;

  @OneToMany(() => PaymentMethod, (paymentMethod) => paymentMethod.user, {
    cascade: true,
  })
  paymentMethods: PaymentMethod[];

  @OneToMany(() => TravelPreference, (preference) => preference.user, {
    cascade: true,
  })
  travelPreferences: TravelPreference[];

  @OneToMany(() => LoyaltyMembership, (membership) => membership.user, {
    cascade: true,
  })
  loyaltyMemberships: LoyaltyMembership[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

