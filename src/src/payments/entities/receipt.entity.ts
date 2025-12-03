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
import { User } from '../../users/entities/user.entity';
import { PaymentTransaction } from './payment-transaction.entity';
import { Invoice } from './invoice.entity';

@Entity('receipts')
@Index(['bookingId'])
@Index(['userId', 'receiptDate'])
@Index(['receiptNumber'], { unique: true })
export class Receipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  receiptNumber: string; // Unique receipt number (e.g., RCP-2024-001234)

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

  @Column({ type: 'uuid', nullable: true })
  paymentTransactionId: string;

  @ManyToOne(() => PaymentTransaction, { nullable: true })
  @JoinColumn({ name: 'paymentTransactionId' })
  paymentTransaction: PaymentTransaction;

  @Column({ type: 'uuid', nullable: true })
  invoiceId: string;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice: Invoice;

  @Column({ type: 'datetime' })
  receiptDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ length: 100, nullable: true })
  paymentMethod: string; // Credit Card, PayPal, etc.

  @Column({ length: 50, nullable: true })
  paymentReference: string; // Transaction ID or reference

  // Amount breakdown
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fees: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'text', nullable: true })
  taxBreakdown: string; // JSON array of tax details

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  isEmailed: boolean; // Whether receipt was emailed to customer

  @Column({ type: 'datetime', nullable: true })
  emailedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

