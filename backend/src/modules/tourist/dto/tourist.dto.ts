import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsEnum, IsBoolean, IsObject } from 'class-validator';
import { SafetyScore } from '../../../entities/tourist.entity';

export class UpdateLocationDto {
  @ApiProperty({ example: 15.2993 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 74.1240 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: 'Panaji, Goa, India' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 10.5 })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiProperty({ example: 100.0 })
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiProperty({ example: 5.2 })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiProperty({ example: 45.0 })
  @IsOptional()
  @IsNumber()
  heading?: number;

  @ApiProperty({ example: { batteryLevel: 85, signalStrength: -70 } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdatePreferencesDto {
  @ApiProperty({ example: 'hi' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;

  @ApiProperty({ example: true })
  @IsOptional()
  @IsBoolean()
  sharingLocation?: boolean;
}

export class UpdateSafetyScoreDto {
  @ApiProperty({ example: 'high', enum: SafetyScore })
  @IsEnum(SafetyScore)
  safetyScore: SafetyScore;
}
