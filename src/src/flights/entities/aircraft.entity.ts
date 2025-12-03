import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { SeatConfiguration } from './seat-configuration.entity';
import { Flight } from './flight.entity';

@Entity('aircrafts')
export class Aircraft {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  registrationNumber: string; // e.g., 'N12345'

  @Column()
  model: string; // e.g., 'Boeing 737-800'

  @Column()
  manufacturer: string; // e.g., 'Boeing'

  @Column({ type: 'int' })
  yearOfManufacture: number;

  @Column({ type: 'uuid' })
  seatConfigurationId: string;

  @ManyToOne(() => SeatConfiguration, { eager: true })
  @JoinColumn({ name: 'seatConfigurationId' })
  seatConfiguration: SeatConfiguration;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // The following line establishes a one-to-many relationship between Aircraft and Flight.
  // This means one Aircraft entity can be associated with multiple Flight entities.
  // The 'flights' array will contain all flights that are assigned to this specific aircraft.
  // The "flight.aircraft" part refers to the property in the Flight entity that links back to Aircraft.
  @OneToMany(() => Flight, (flight) => flight.aircraft)
  flights: Flight[];
}

