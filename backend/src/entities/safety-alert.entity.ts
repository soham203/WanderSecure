import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tourist } from './tourist.entity';

export enum AlertType {
  PANIC_BUTTON = 'panic_button',
  GEO_FENCE_VIOLATION = 'geo_fence_violation',
  ANOMALY_DETECTED = 'anomaly_detected',
  MISSING_PERSON = 'missing_person',
  HEALTH_EMERGENCY = 'health_emergency',
  ROUTE_DEVIATION = 'route_deviation',
  PROLONGED_INACTIVITY = 'prolonged_inactivity',
  LOCATION_DROPOFF = 'location_dropoff',
}

export enum AlertStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  FALSE_ALARM = 'false_alarm',
}

export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('safety_alerts')
@Index(['touristId'])
@Index(['alertType'])
@Index(['status'])
@Index(['createdAt'])
export class SafetyAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  touristId: string;

  @ManyToOne(() => Tourist, (tourist) => tourist.safetyAlerts)
  @JoinColumn({ name: 'touristId' })
  tourist: Tourist;

  @Column({
    type: 'enum',
    enum: AlertType,
  })
  alertType: AlertType;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.PENDING,
  })
  status: AlertStatus;

  @Column({
    type: 'enum',
    enum: AlertPriority,
    default: AlertPriority.MEDIUM,
  })
  priority: AlertPriority;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'json', nullable: true })
  metadata: {
    accuracy?: number;
    altitude?: number;
    speed?: number;
    heading?: number;
    batteryLevel?: number;
    signalStrength?: number;
    [key: string]: any;
  };

  @Column({ type: 'json', nullable: true })
  aiAnalysis: {
    confidence: number;
    riskScore: number;
    patterns: string[];
    recommendations: string[];
  };

  @Column({ type: 'json', nullable: true })
  responseActions: {
    policeNotified: boolean;
    emergencyContactsNotified: boolean;
    efirGenerated: boolean;
    responseTime: number;
    assignedOfficer?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'text', nullable: true })
  resolutionNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
