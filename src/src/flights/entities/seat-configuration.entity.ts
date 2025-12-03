import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Aircraft } from './aircraft.entity';

export enum SeatClass {
  ECONOMY = 'economy',
  PREMIUM_ECONOMY = 'premium_economy',
  BUSINESS = 'business',
  FIRST = 'first',
}

@Entity('seat_configurations')
export class SeatConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'Boeing 737-800 Standard'

  @Column({ type: 'json' })
  layout: {
    rows: number;
    seatsPerRow: number;
    classes: Array<{
      class: SeatClass;
      startRow: number;
      endRow: number;
      seatsPerRow: number;
      seatMap: string[]; // e.g., ['A', 'B', 'C', 'D', 'E', 'F']
    }>;
  };

  @Column({ type: 'int' })
  totalSeats: number;

  @Column({ type: 'json' })
  seatCountByClass: Record<SeatClass, number>;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Aircraft, (aircraft) => aircraft.seatConfiguration)
  aircrafts: Aircraft[];
}

