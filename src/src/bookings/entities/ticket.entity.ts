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
import { Booking } from './booking.entity';
import { Passenger } from './passenger.entity';

@Entity('tickets')
@Index(['ticketNumber'], { unique: true })
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 13, unique: true })
  ticketNumber: string; // IATA ticket number format (13 digits)

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.tickets)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'uuid' })
  passengerId: string;

  @ManyToOne(() => Passenger, { eager: true })
  @JoinColumn({ name: 'passengerId' })
  passenger: Passenger;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fare: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fees: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  fareClass: string; // Economy, Premium Economy, Business, First

  @Column({ type: 'datetime' })
  issuedDate: Date;

  @Column({ type: 'datetime', nullable: true })
  expiryDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

