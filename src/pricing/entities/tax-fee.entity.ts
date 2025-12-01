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

export enum TaxFeeType {
  AIRPORT_TAX = 'Airport Tax',
  FUEL_SURCHARGE = 'Fuel Surcharge',
  SERVICE_FEE = 'Service Fee',
  SECURITY_FEE = 'Security Fee',
  PASSENGER_FACILITY_CHARGE = 'Passenger Facility Charge',
  CUSTOMS_FEE = 'Customs Fee',
  IMMIGRATION_FEE = 'Immigration Fee',
  OTHER = 'Other',
}

export enum TaxFeeCalculationType {
  FIXED = 'fixed', // Fixed amount
  PERCENTAGE = 'percentage', // Percentage of base fare
  PER_PASSENGER = 'per_passenger', // Fixed amount per passenger
}

@Entity('tax_fees')
@Index(['fareId'])
export class TaxFee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  fareId: string;

  @ManyToOne(() => Fare)
  @JoinColumn({ name: 'fareId' })
  fare: Fare;

  @Column({
    type: 'varchar',
    length: 50,
    enum: TaxFeeType,
  })
  type: TaxFeeType;

  @Column({ length: 100 })
  name: string; // e.g., "JFK Airport Tax", "Fuel Surcharge"

  @Column({
    type: 'varchar',
    length: 20,
    enum: TaxFeeCalculationType,
    default: TaxFeeCalculationType.FIXED,
  })
  calculationType: TaxFeeCalculationType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // Fixed amount or percentage value

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minAmount: number; // Minimum amount (for percentage calculations)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxAmount: number; // Maximum amount (for percentage calculations)

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

