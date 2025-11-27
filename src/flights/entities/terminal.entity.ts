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
import { Gate } from './gate.entity';

@Entity('terminals')
@Index(['airportId', 'name'], { unique: true })
export class Terminal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  airportId: string;

  @ManyToOne(() => Airport, { eager: true })
  @JoinColumn({ name: 'airportId' })
  airport: Airport;

  @Column({ length: 50 })
  name: string; // e.g., 'Terminal 1', 'Terminal A', 'International Terminal'

  @Column({ type: 'text', nullable: true })
  description: string; // Additional information about the terminal

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Gate, (gate) => gate.terminal)
  gates: Gate[];
}

