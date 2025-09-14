import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum GeoFenceType {
  RESTRICTED = 'restricted',
  HIGH_RISK = 'high_risk',
  SAFE_ZONE = 'safe_zone',
  EMERGENCY_ZONE = 'emergency_zone',
  CUSTOM = 'custom',
}

export enum GeoFenceShape {
  CIRCLE = 'circle',
  POLYGON = 'polygon',
  RECTANGLE = 'rectangle',
}

@Entity('geo_fences')
@Index(['type'])
@Index(['isActive'])
export class GeoFence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: GeoFenceType,
  })
  type: GeoFenceType;

  @Column({
    type: 'enum',
    enum: GeoFenceShape,
  })
  shape: GeoFenceShape;

  @Column({ type: 'json' })
  coordinates: {
    center?: {
      latitude: number;
      longitude: number;
    };
    radius?: number; // For circle
    points?: {
      latitude: number;
      longitude: number;
    }[]; // For polygon
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    }; // For rectangle
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  requiresNotification: boolean;

  @Column({ type: 'text', nullable: true })
  notificationMessage: string;

  @Column({ type: 'json', nullable: true })
  alertSettings: {
    immediateAlert: boolean;
    alertDelay: number; // seconds
    autoResponse: boolean;
    responseActions: string[];
  };

  @Column({ type: 'json', nullable: true })
  metadata: {
    region?: string;
    state?: string;
    district?: string;
    policeStation?: string;
    emergencyContacts?: string[];
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
