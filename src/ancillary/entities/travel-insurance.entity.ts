import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Passenger } from '../../bookings/entities/passenger.entity';

export enum InsuranceType {
  TRIP_CANCELLATION = 'trip_cancellation',
  MEDICAL = 'medical',
  BAGGAGE = 'baggage',
  FLIGHT_DELAY = 'flight_delay',
  COMPREHENSIVE = 'comprehensive',
}

export enum InsuranceStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  CLAIMED = 'claimed',
}

@Entity('travel_insurance')
@Index(['bookingId'])
@Index(['passengerId'])
export class TravelInsurance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.travelInsurance, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'uuid', nullable: true })
  passengerId: string; // Optional - can be booking-level or passenger-specific

  @ManyToOne(() => Passenger, { nullable: true })
  @JoinColumn({ name: 'passengerId' })
  passenger: Passenger;

  @Column({
    type: 'varchar',
    length: 30,
  })
  type: InsuranceType; // trip_cancellation, medical, baggage, etc.

  @Column({ type: 'varchar', length: 200, nullable: true })
  policyName: string; // Name of the insurance policy

  @Column({ type: 'text', nullable: true })
  description: string; // Policy description and coverage details

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  coverageAmount: number; // Maximum coverage amount

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  premium: number; // Insurance premium price

  @Column({
    type: 'varchar',
    length: 20,
    default: InsuranceStatus.ACTIVE,
  })
  status: InsuranceStatus; // active, expired, cancelled, claimed

  @Column({ type: 'datetime' })
  startDate: Date; // Coverage start date

  @Column({ type: 'datetime' })
  endDate: Date; // Coverage end date

  @Column({ type: 'varchar', length: 100, nullable: true })
  policyNumber: string; // Insurance policy number

  @Column({ type: 'varchar', length: 200, nullable: true })
  provider: string; // Insurance provider name

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string; // Policy terms and conditions

  @Column({ type: 'text', nullable: true })
  notes: string; // Additional notes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

