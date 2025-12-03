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

export enum BaggageType {
  CABIN = 'cabin',
  CHECKED = 'checked',
  EXCESS = 'excess',
  SPECIAL = 'special',
}

export enum SpecialBaggageCategory {
  SPORTS_EQUIPMENT = 'sports_equipment',
  PETS = 'pets',
  FRAGILE = 'fragile',
  MUSICAL_INSTRUMENT = 'musical_instrument',
  WHEELCHAIR = 'wheelchair',
  MEDICAL_EQUIPMENT = 'medical_equipment',
  OTHER = 'other',
}

@Entity('baggage')
@Index(['bookingId'])
@Index(['passengerId'])
export class Baggage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.baggageItems, {
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
    length: 20,
  })
  type: BaggageType; // cabin, checked, excess, special

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  specialCategory: SpecialBaggageCategory; // For special baggage

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number; // Weight in kg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  length: number; // Length in cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  width: number; // Width in cm

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number; // Height in cm

  @Column({ type: 'int', default: 1 })
  quantity: number; // Number of pieces

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Price for this baggage item

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string; // Description of special baggage

  @Column({ type: 'text', nullable: true })
  notes: string; // Additional notes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

