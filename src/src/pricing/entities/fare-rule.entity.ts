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
import { Fare } from './fare.entity';

@Entity('fare_rules')
@Index(['fareId'])
export class FareRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  fareId: string;

  @ManyToOne(() => Fare, (fare) => fare.fareRules)
  @JoinColumn({ name: 'fareId' })
  fare: Fare;

  // Refundability
  @Column({ type: 'boolean', default: false })
  isRefundable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  refundFee: number; // Fee charged for refund

  @Column({ type: 'int', nullable: true })
  refundDeadlineDays: number; // Days before departure for full refund

  // Changeability
  @Column({ type: 'boolean', default: false })
  isChangeable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  changeFee: number; // Fee charged for changes

  @Column({ type: 'int', nullable: true })
  changeDeadlineDays: number; // Days before departure for free changes

  // Restrictions
  @Column({ type: 'boolean', default: false })
  requiresAdvancePurchase: boolean;

  @Column({ type: 'int', nullable: true })
  advancePurchaseDays: number; // Minimum days in advance

  @Column({ type: 'boolean', default: false })
  requiresMinimumStay: boolean;

  @Column({ type: 'int', nullable: true })
  minimumStayDays: number;

  @Column({ type: 'boolean', default: false })
  requiresMaximumStay: boolean;

  @Column({ type: 'int', nullable: true })
  maximumStayDays: number;

  @Column({ type: 'boolean', default: false })
  isNonRefundable: boolean; // Explicitly non-refundable

  @Column({ type: 'boolean', default: false })
  isNonChangeable: boolean; // Explicitly non-changeable

  @Column({ type: 'boolean', default: false })
  allowsNameChange: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  nameChangeFee: number;

  @Column({ type: 'text', nullable: true })
  restrictions: string; // Additional restrictions in text format

  @Column({ type: 'text', nullable: true })
  termsAndConditions: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

