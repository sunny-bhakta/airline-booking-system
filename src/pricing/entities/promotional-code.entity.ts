import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PromotionalCodeType {
  PERCENTAGE = 'percentage', // Percentage discount
  FIXED_AMOUNT = 'fixed_amount', // Fixed amount discount
  FREE_SERVICE = 'free_service', // Free ancillary service
}

export enum PromotionalCodeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  USED_UP = 'used_up',
}

@Entity('promotional_codes')
@Index(['code'], { unique: true })
export class PromotionalCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string; // e.g., "SUMMER2024", "WELCOME10"

  @Column({ length: 200 })
  name: string; // Display name

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: PromotionalCodeType,
  })
  type: PromotionalCodeType;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountValue: number; // Percentage (0-100) or fixed amount

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number; // Maximum discount for percentage types

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPurchaseAmount: number; // Minimum purchase to use code

  @Column({
    type: 'varchar',
    length: 20,
    enum: PromotionalCodeStatus,
    default: PromotionalCodeStatus.ACTIVE,
  })
  status: PromotionalCodeStatus;

  @Column({ type: 'datetime' })
  validFrom: Date;

  @Column({ type: 'datetime' })
  validTo: Date;

  @Column({ type: 'int', nullable: true })
  maxUses: number; // Maximum number of times code can be used

  @Column({ type: 'int', default: 0 })
  currentUses: number; // Current number of times used

  @Column({ type: 'int', nullable: true })
  maxUsesPerUser: number; // Maximum uses per user

  @Column({ type: 'varchar', length: 20, nullable: true })
  applicableFareClass: string; // Specific fare class (null = all classes)

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: false })
  isFirstTimeUserOnly: boolean; // Only for first-time users

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

