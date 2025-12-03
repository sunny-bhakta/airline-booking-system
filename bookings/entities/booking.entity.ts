import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Flight } from '../../flights/entities/flight.entity';
import { User } from '../../users/entities/user.entity';
import { Passenger } from './passenger.entity';
import { Ticket } from './ticket.entity';
import { SeatAssignment } from './seat-assignment.entity';
import { Baggage } from '../../ancillary/entities/baggage.entity';
import { InFlightService } from '../../ancillary/entities/in-flight-service.entity';
import { TravelInsurance } from '../../ancillary/entities/travel-insurance.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  CHECKED_IN = 'checked-in',
}

@Entity('bookings')
@Index(['pnr'], { unique: true })
@Index(['flightId', 'status'])
@Index(['userId', 'bookingDate'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 6, unique: true })
  pnr: string; // Passenger Name Record - unique booking reference (e.g., 'ABC123')

  @Column({ type: 'uuid' })
  flightId: string;

  @ManyToOne(() => Flight, { eager: true })
  @JoinColumn({ name: 'flightId' })
  flight: Flight;

  @Column({ type: 'uuid', nullable: true })
  userId: string; // Optional - allows guest bookings

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'varchar',
    length: 20,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency: string; // e.g., 'USD', 'EUR'

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'datetime', nullable: true })
  bookingDate: Date;

  @Column({ type: 'datetime', nullable: true })
  confirmationDate: Date;

  @Column({ type: 'datetime', nullable: true })
  cancellationDate: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @OneToMany(() => Passenger, (passenger) => passenger.booking, {
    cascade: true,
  })
  passengers: Passenger[];

  @OneToMany(() => Ticket, (ticket) => ticket.booking, { cascade: true })
  tickets: Ticket[];

  @OneToMany(() => SeatAssignment, (seatAssignment) => seatAssignment.booking, {
    cascade: true,
  })
  seatAssignments: SeatAssignment[];

  @OneToMany(() => Baggage, (baggage) => baggage.booking, {
    cascade: true,
  })
  baggageItems: Baggage[];

  @OneToMany(() => InFlightService, (service) => service.booking, {
    cascade: true,
  })
  inFlightServices: InFlightService[];

  @OneToMany(() => TravelInsurance, (insurance) => insurance.booking, {
    cascade: true,
  })
  travelInsurance: TravelInsurance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

