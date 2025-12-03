import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Route } from './route.entity';
import { Terminal } from './terminal.entity';

export enum AirportType {
  DOMESTIC = 'domestic',
  INTERNATIONAL = 'international',
}

@Entity('airports')
export class Airport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 3 })
  iataCode: string; // e.g., 'JFK', 'LAX'

  @Column({ unique: true, length: 4, nullable: true })
  icaoCode: string; // e.g., 'KJFK', 'KLAX'

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ length: 50, nullable: true })
  timezone: string; // e.g., 'America/New_York'

  @Column({
    type: 'varchar',
    length: 20,
    default: AirportType.DOMESTIC,
  })
  type: AirportType;

  @OneToMany(() => Route, (route) => route.origin)
  originRoutes: Route[];

  @OneToMany(() => Route, (route) => route.destination)
  destinationRoutes: Route[];

  @OneToMany(() => Terminal, (terminal) => terminal.airport)
  terminals: Terminal[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

