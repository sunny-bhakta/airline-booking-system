import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 100, nullable: true })
  firstName: string;

  @Column({ length: 100, nullable: true })
  lastName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ length: 20, nullable: true })
  gender: string; // 'male', 'female', 'other'

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ length: 100, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ length: 20, nullable: true })
  postalCode: string;

  @Column({ length: 50, nullable: true })
  nationality: string;

  @Column({ length: 50, nullable: true })
  passportNumber: string;

  @Column({ type: 'date', nullable: true })
  passportExpiryDate: Date;

  @Column({ length: 100, nullable: true })
  passportIssuingCountry: string;

  @Column({ type: 'text', nullable: true })
  emergencyContactName: string;

  @Column({ length: 20, nullable: true })
  emergencyContactPhone: string;

  @Column({ type: 'text', nullable: true })
  specialAssistance: string; // Special needs or assistance requirements

  @Column({ type: 'text', nullable: true })
  dietaryPreferences: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

