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

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

@Entity('loyalty_memberships')
@Index(['userId', 'programName'], { unique: true })
export class LoyaltyMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.loyaltyMemberships)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 100 })
  programName: string; // e.g., "SkyMiles", "AAdvantage"

  @Column({ length: 50, unique: true })
  membershipNumber: string; // Frequent flyer number

  @Column({
    type: 'varchar',
    length: 50,
    default: LoyaltyTier.BRONZE,
  })
  tier: LoyaltyTier;

  @Column({ type: 'int', default: 0 })
  miles: number; // Total miles/points

  @Column({ type: 'int', default: 0 })
  points: number; // Alternative points system

  @Column({ type: 'date', nullable: true })
  tierExpiryDate: Date;

  @Column({ type: 'int', default: 0 })
  tierMilesRequired: number; // Miles needed for next tier

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  benefits: string; // JSON string of benefits

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

