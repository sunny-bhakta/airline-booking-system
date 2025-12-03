import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Flight } from './flight.entity';

@Entity('schedules')
@Index(['departureTime', 'arrivalTime'])
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'time' })
  departureTime: string; // e.g., '08:30:00'

  @Column({ type: 'time' })
  arrivalTime: string; // e.g., '11:45:00'

  @Column({ type: 'int' })
  duration: number; // in minutes

  @Column({ type: 'varchar', length: 10, nullable: true })
  daysOfWeek: string; // e.g., '1,2,3,4,5' for Mon-Fri (1=Monday, 7=Sunday)

  @Column({ type: 'date', nullable: true })
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Flight, (flight) => flight.schedule)
  flights: Flight[];
}

