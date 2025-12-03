import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  NET_BANKING = 'net_banking',
}

@Entity('payment_methods')
@Index(['userId', 'isDefault'])
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.paymentMethods)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'varchar',
    length: 50,
  })
  type: PaymentMethodType;

  @Column({ length: 100, nullable: true })
  cardHolderName: string;

  @Column({ length: 50, nullable: true })
  lastFourDigits: string; // Last 4 digits of card

  @Column({ length: 50, nullable: true })
  cardBrand: string; // Visa, Mastercard, etc.

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ length: 100, nullable: true })
  walletProvider: string; // PayPal, Apple Pay, Google Pay, etc.

  @Column({ length: 100, nullable: true })
  accountNumber: string; // For bank transfer, UPI, etc.

  @Column({ length: 50, nullable: true })
  bankName: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  billingAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

