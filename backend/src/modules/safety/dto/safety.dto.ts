import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { GeoFenceType, GeoFenceShape } from '../../../entities/geo-fence.entity';
import { AlertStatus } from '../../../entities/safety-alert.entity';

export class CreateGeoFenceDto {
  @ApiProperty({ example: 'Restricted Area - Forest' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'High-risk forest area with wildlife' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'restricted', enum: GeoFenceType })
  @IsEnum(GeoFenceType)
  type: GeoFenceType;

  @ApiProperty({ example: 'circle', enum: GeoFenceShape })
  @IsEnum(GeoFenceShape)
  shape: GeoFenceShape;

  @ApiProperty({
    example: {
      center: { latitude: 15.2993, longitude: 74.1240 },
      radius: 1000
    }
  })
  @IsObject()
  coordinates: {
    center?: { latitude: number; longitude: number };
    radius?: number;
    points?: { latitude: number; longitude: number }[];
    bounds?: { north: number; south: number; east: number; west: number };
  };

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  requiresNotification?: boolean;

  @ApiProperty({ example: 'You have entered a restricted area' })
  @IsOptional()
  @IsString()
  notificationMessage?: string;

  @ApiProperty({
    example: {
      immediateAlert: true,
      alertDelay: 0,
      autoResponse: false,
      responseActions: ['notify_police', 'notify_contacts']
    }
  })
  @IsOptional()
  @IsObject()
  alertSettings?: {
    immediateAlert: boolean;
    alertDelay: number;
    autoResponse: boolean;
    responseActions: string[];
  };

  @ApiProperty({
    example: {
      region: 'Goa',
      state: 'Goa',
      district: 'North Goa',
      policeStation: 'Panaji Police Station'
    }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateAlertStatusDto {
  @ApiProperty({ example: 'acknowledged', enum: AlertStatus })
  @IsEnum(AlertStatus)
  status: AlertStatus;

  @ApiProperty({ example: 'Alert has been acknowledged and is being investigated' })
  @IsOptional()
  @IsString()
  notes?: string;
}
