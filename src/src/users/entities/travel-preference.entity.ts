import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum SeatPreference {
  WINDOW = 'window',
  AISLE = 'aisle',
  MIDDLE = 'middle',
  EXIT_ROW = 'exit_row',
  NO_PREFERENCE = 'no_preference',
}

export enum MealPreference {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  HALAL = 'halal',
  KOSHER = 'kosher',
  GLUTEN_FREE = 'gluten_free',
  NO_PREFERENCE = 'no_preference',
}

@Entity('travel_preferences')
export class TravelPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.travelPreferences)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  seatPreference: SeatPreference;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  mealPreference: MealPreference;

  @Column({ type: 'boolean', default: false })
  prefersWindowSeat: boolean;

  @Column({ type: 'boolean', default: false })
  prefersAisleSeat: boolean;

  @Column({ type: 'boolean', default: false })
  prefersExitRow: boolean;

  @Column({ type: 'boolean', default: false })
  needsSpecialAssistance: boolean;

  @Column({ type: 'text', nullable: true })
  specialAssistanceDetails: string;

  @Column({ type: 'boolean', default: false })
  prefersPriorityBoarding: boolean;

  @Column({ type: 'boolean', default: false })
  prefersLoungeAccess: boolean;

  @Column({ type: 'text', nullable: true })
  preferredAirline: string;

  @Column({ type: 'text', nullable: true })
  preferredAirports: string; // Comma-separated list

  @Column({ type: 'text', nullable: true })
  travelClassPreference: string; // Economy, Business, First

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

