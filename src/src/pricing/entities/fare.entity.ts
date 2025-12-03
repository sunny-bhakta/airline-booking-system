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
import { Flight } from '../../flights/entities/flight.entity';
import { FareRule } from './fare-rule.entity';

export enum FareClass {
  ECONOMY = 'Economy',
  PREMIUM_ECONOMY = 'Premium Economy',
  BUSINESS = 'Business',
  FIRST = 'First',
}

@Entity('fares')
@Index(['flightId', 'fareClass'], { unique: true })
@Index(['routeId', 'fareClass'])
export class Fare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  flightId: string;

  @ManyToOne(() => Flight, { eager: true })
  @JoinColumn({ name: 'flightId' })
  flight: Flight;

  @Column({ type: 'uuid', nullable: true })
  routeId: string; // For route-based pricing (when not flight-specific)

  @Column({
    type: 'varchar',
    length: 20,
    enum: FareClass,
  })
  fareClass: FareClass;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  baseFare: number; // Core ticket price

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  dynamicPriceAdjustment: number; // Price adjustment based on demand/availability

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalFare: number; // baseFare + dynamicPriceAdjustment

  @Column({ type: 'int', default: 0 })
  availableSeats: number; // Seats available at this fare class

  @Column({ type: 'int', default: 0 })
  bookedSeats: number; // Seats booked at this fare class

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  validFrom: Date;

  @Column({ type: 'datetime', nullable: true })
  validTo: Date;

  @OneToMany(() => FareRule, (fareRule) => fareRule.fare, { cascade: true })
  fareRules: FareRule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

