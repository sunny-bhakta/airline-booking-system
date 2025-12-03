import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Airport } from './airport.entity';
import { Flight } from './flight.entity';

@Entity('routes')
@Index(['originId', 'destinationId'], { unique: true })
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  originId: string;

  @ManyToOne(() => Airport, { eager: true })
  @JoinColumn({ name: 'originId' })
  origin: Airport;

  @Column({ type: 'uuid' })
  destinationId: string;

  @ManyToOne(() => Airport, { eager: true })
  @JoinColumn({ name: 'destinationId' })
  destination: Airport;

  @Column({ type: 'int', nullable: true })
  distance: number; // in kilometers

  @Column({ type: 'int', nullable: true })
  estimatedDuration: number; // in minutes

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Flight, (flight) => flight.route)
  flights: Flight[];
}

