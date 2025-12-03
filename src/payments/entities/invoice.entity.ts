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
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentTransaction } from './payment-transaction.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

@Entity('invoices')
@Index(['bookingId'])
@Index(['userId', 'invoiceDate'])
@Index(['invoiceNumber'], { unique: true })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  invoiceNumber: string; // Unique invoice number (e.g., INV-2024-001234)

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, { eager: true })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'varchar',
    length: 50,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ type: 'datetime' })
  invoiceDate: Date;

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  paidDate: Date;

  // Amount breakdown
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number; // Base fare

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxes: number; // Total taxes

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fees: number; // Total fees

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number; // Discount amount

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number; // Total amount due

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  // Billing information
  @Column({ length: 200, nullable: true })
  billingName: string;

  @Column({ length: 255, nullable: true })
  billingEmail: string;

  @Column({ length: 50, nullable: true })
  billingPhone: string;

  @Column({ type: 'text', nullable: true })
  billingAddress: string;

  @Column({ length: 100, nullable: true })
  billingCity: string;

  @Column({ length: 50, nullable: true })
  billingState: string;

  @Column({ length: 20, nullable: true })
  billingPostalCode: string;

  @Column({ length: 100, nullable: true })
  billingCountry: string;

  // Tax breakdown (JSON string)
  @Column({ type: 'text', nullable: true })
  taxBreakdown: string; // JSON array of tax details

  // Payment transactions linked to this invoice (via booking)
  // Note: Transactions are linked via bookingId, not directly to invoice

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

