import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { SafetyAlert } from './safety-alert.entity';
import { LocationHistory } from './location-history.entity';

export enum TouristStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MISSING = 'missing',
  EMERGENCY = 'emergency',
  SUSPENDED = 'suspended',
}

export enum SafetyScore {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('tourists')
@Index(['digitalId'], { unique: true })
@Index(['phoneNumber'])
@Index(['email'])
export class Tourist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  digitalId: string; // Blockchain-generated ID

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  aadhaarNumber: string;

  @Column({ nullable: true })
  passportNumber: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column()
  nationality: string;

  @Column({ type: 'json' })
  emergencyContacts: {
    name: string;
    phone: string;
    relationship: string;
  }[];

  @Column({ type: 'json', nullable: true })
  tripItinerary: {
    destination: string;
    startDate: Date;
    endDate: Date;
    accommodation: string;
    activities: string[];
  };

  @Column({
    type: 'enum',
    enum: TouristStatus,
    default: TouristStatus.ACTIVE,
  })
  status: TouristStatus;

  @Column({
    type: 'enum',
    enum: SafetyScore,
    default: SafetyScore.MEDIUM,
  })
  safetyScore: SafetyScore;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  lastKnownLatitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  lastKnownLongitude: number;

  @Column({ type: 'timestamp', nullable: true })
  lastLocationUpdate: Date;

  @Column({ type: 'boolean', default: false })
  isTrackingEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  isPanicMode: boolean;

  @Column({ type: 'timestamp', nullable: true })
  panicActivatedAt: Date;

  @Column({ type: 'json', nullable: true })
  preferences: {
    language: string;
    notifications: boolean;
    sharingLocation: boolean;
  };

  @Column({ type: 'json', nullable: true })
  deviceInfo: {
    deviceId: string;
    platform: string;
    appVersion: string;
    lastSeen: Date;
  };

  @OneToMany(() => SafetyAlert, (alert) => alert.tourist)
  safetyAlerts: SafetyAlert[];

  @OneToMany(() => LocationHistory, (location) => location.tourist)
  locationHistory: LocationHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
