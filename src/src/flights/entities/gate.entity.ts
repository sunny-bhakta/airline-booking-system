import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Terminal } from './terminal.entity';
import { Flight } from './flight.entity';

@Entity('gates')
@Index(['terminalId', 'number'], { unique: true })
export class Gate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  terminalId: string;

  @ManyToOne(() => Terminal, { eager: true })
  @JoinColumn({ name: 'terminalId' })
  terminal: Terminal;

  @Column({ length: 10 })
  number: string; // e.g., 'A12', 'B5', 'Gate 23'

  @Column({ type: 'text', nullable: true })
  description: string; // Additional information about the gate

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Flight, (flight) => flight.gate)
  flights: Flight[];
}

