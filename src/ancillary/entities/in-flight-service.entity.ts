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

export enum InFlightServiceType {
  MEAL = 'meal',
  ENTERTAINMENT = 'entertainment',
  WIFI = 'wifi',
  PRIORITY_BOARDING = 'priority_boarding',
  LOUNGE_ACCESS = 'lounge_access',
  EXTRA_LEGROOM = 'extra_legroom',
  OTHER = 'other',
}

export enum MealType {
  STANDARD = 'standard',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  HALAL = 'halal',
  KOSHER = 'kosher',
  GLUTEN_FREE = 'gluten_free',
  DIABETIC = 'diabetic',
  CHILD = 'child',
  INFANT = 'infant',
  OTHER = 'other',
}

@Entity('in_flight_services')
@Index(['bookingId'])
@Index(['passengerId'])
export class InFlightService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.inFlightServices, {
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
  type: InFlightServiceType; // meal, entertainment, wifi, etc.

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  mealType: MealType; // For meal services

  @Column({ type: 'varchar', length: 200, nullable: true })
  serviceName: string; // Name of the service (e.g., "Wi-Fi 24hrs", "Premium Meal")

  @Column({ type: 'text', nullable: true })
  description: string; // Service description

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number; // Price for this service

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'int', default: 1 })
  quantity: number; // Number of units (e.g., number of meals, hours of wifi)

  @Column({ type: 'text', nullable: true })
  specialRequirements: string; // Special dietary requirements, preferences, etc.

  @Column({ type: 'text', nullable: true })
  notes: string; // Additional notes

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

