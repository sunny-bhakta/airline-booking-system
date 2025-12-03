import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

@Entity('passengers')
export class Passenger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 20, nullable: true })
  gender: string; // 'male', 'female', 'other'

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ length: 50, nullable: true })
  nationality: string;

  @Column({ length: 50, nullable: true })
  passportNumber: string;

  @Column({ type: 'date', nullable: true })
  passportExpiryDate: Date;

  @Column({ length: 100, nullable: true })
  passportIssuingCountry: string;

  @Column({ type: 'text', nullable: true })
  specialAssistance: string; // Special needs or assistance requirements

  @Column({ length: 50, nullable: true })
  frequentFlyerNumber: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.passengers)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

