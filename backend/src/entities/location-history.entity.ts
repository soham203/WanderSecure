import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tourist } from './tourist.entity';

@Entity('location_history')
@Index(['touristId'])
@Index(['timestamp'])
@Index(['latitude', 'longitude'])
export class LocationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  touristId: string;

  @ManyToOne(() => Tourist, (tourist) => tourist.locationHistory)
  @JoinColumn({ name: 'touristId' })
  tourist: Tourist;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  accuracy: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  altitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  speed: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  heading: number;

  @Column({ type: 'json', nullable: true })
  metadata: {
    batteryLevel?: number;
    signalStrength?: number;
    networkType?: string;
    isCharging?: boolean;
    isMoving?: boolean;
    activityType?: string;
    [key: string]: any;
  };

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;
}
