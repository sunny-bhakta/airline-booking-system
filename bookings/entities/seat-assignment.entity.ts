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

@Entity('seat_assignments')
@Index(['bookingId', 'seatNumber'], { unique: true })
export class SeatAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.seatAssignments)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'uuid' })
  passengerId: string;

  @ManyToOne(() => Passenger, { eager: true })
  @JoinColumn({ name: 'passengerId' })
  passenger: Passenger;

  @Column({ length: 10 })
  seatNumber: string; // e.g., '12A', '1B', '25F'

  @Column({ length: 20, nullable: true })
  seatType: string; // 'window', 'aisle', 'middle', 'exit-row'

  @Column({ length: 20, nullable: true })
  seatClass: string; // 'economy', 'premium-economy', 'business', 'first'

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  seatPrice: number; // Additional cost for premium seats

  @Column({ type: 'boolean', default: false })
  isPreferred: boolean; // User's preferred seat selection

  @Column({ type: 'datetime', nullable: true })
  assignedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

