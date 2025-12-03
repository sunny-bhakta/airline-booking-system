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
import { PaymentMethod } from '../../users/entities/payment-method.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentType {
  BOOKING_PAYMENT = 'booking_payment',
  REFUND = 'refund',
  PARTIAL_REFUND = 'partial_refund',
  INSTALLMENT = 'installment',
}

@Entity('payment_transactions')
@Index(['bookingId', 'status'])
@Index(['userId', 'createdAt'])
@Index(['transactionId'], { unique: true })
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  transactionId: string; // External transaction ID from payment gateway

  @Column({ type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, { eager: true })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'uuid', nullable: true })
  userId: string; // Optional - for guest payments

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  paymentMethodId: string; // Reference to saved payment method

  @ManyToOne(() => PaymentMethod, { nullable: true })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'varchar',
    length: 50,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: PaymentType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number; // Total amount refunded

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentGateway: string; // Stripe, PayPal, Razorpay, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  gatewayTransactionId: string; // Transaction ID from payment gateway

  @Column({ type: 'text', nullable: true })
  gatewayResponse: string; // JSON response from payment gateway

  @Column({ type: 'text', nullable: true })
  failureReason: string; // Reason for payment failure

  @Column({ type: 'datetime', nullable: true })
  processedAt: Date; // When payment was processed

  @Column({ type: 'datetime', nullable: true })
  refundedAt: Date; // When refund was processed

  @Column({ type: 'text', nullable: true })
  refundReason: string; // Reason for refund

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  paymentMethodType: string; // credit_card, digital_wallet, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  cardLastFour: string; // Last 4 digits of card if applicable

  @Column({ type: 'varchar', length: 50, nullable: true })
  cardBrand: string; // Visa, Mastercard, etc.

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

