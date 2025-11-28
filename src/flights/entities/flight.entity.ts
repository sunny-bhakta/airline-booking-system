import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Route } from './route.entity';
import { Schedule } from './schedule.entity';
import { Aircraft } from './aircraft.entity';
import { Gate } from './gate.entity';

export enum FlightStatus {
  SCHEDULED = 'scheduled',
  DELAYED = 'delayed',
  BOARDING = 'boarding',
  DEPARTED = 'departed',
  ARRIVED = 'arrived',
  CANCELLED = 'cancelled',
}

@Entity('flights')
@Index(['flightNumber', 'departureDate'], { unique: true })
@Index(['routeId', 'departureDate'])
export class Flight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  flightNumber: string; // e.g., 'AA123'

  // Explanation:
  // In a typical TypeORM entity setup where a relation is mapped (here, ManyToOne to Route),
  // there are two related fields:
  // 1. The foreign key column ('routeId') is stored as a UUID pointing to the Route entity.
  // 2. The actual relation object ('route') allows you to directly access the Route entity
  //    in your code, with eager loading if specified.
  //
  // The @Column({ type: 'uuid' }) routeId: string; 
  // defines the database column for the foreign key.
  //
  // The @ManyToOne() and @JoinColumn({ name: 'routeId' }) 
  // establish the relationship with the Route entity and map the 'routeId' column as the join column.
  // This means both the direct ID value and the actual object are accessible in the Flight entity.

  @Column({ type: 'uuid' })
  routeId: string;

  @ManyToOne(() => Route, { eager: true })
  @JoinColumn({ name: 'routeId' })
  route: Route;

  @Column({ type: 'uuid' })
  scheduleId: string;

  @ManyToOne(() => Schedule, { eager: true })
  @JoinColumn({ name: 'scheduleId' })
  schedule: Schedule;

  @Column({ type: 'uuid' })
  aircraftId: string;

  @ManyToOne(() => Aircraft, { eager: true })
  @JoinColumn({ name: 'aircraftId' })
  aircraft: Aircraft;

  @Column({ type: 'date' })
  departureDate: Date;

  @Column({ type: 'datetime' })
  scheduledDepartureTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualDepartureTime: Date;

  @Column({ type: 'datetime' })
  scheduledArrivalTime: Date;

  @Column({ type: 'datetime', nullable: true })
  actualArrivalTime: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: FlightStatus.SCHEDULED,
  })
  status: FlightStatus;

  @Column({ type: 'uuid', nullable: true })
  gateId: string;

  @ManyToOne(() => Gate, { eager: true, nullable: true })
  @JoinColumn({ name: 'gateId' })
  gate: Gate;

  @Column({ type: 'int', default: 0 })
  availableSeats: number;

  @Column({ type: 'int', default: 0 })
  bookedSeats: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

