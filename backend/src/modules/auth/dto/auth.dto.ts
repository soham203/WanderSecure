import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+919876543210' })
  @IsPhoneNumber('IN')
  phoneNumber: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Indian' })
  @IsString()
  nationality: string;

  @ApiProperty({ example: '123456789012' })
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiProperty({ example: 'A1234567' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiProperty({
    example: [
      {
        name: 'Jane Doe',
        phone: '+919876543211',
        relationship: 'Spouse'
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmergencyContactDto)
  emergencyContacts: EmergencyContactDto[];

  @ApiProperty({
    example: {
      destination: 'Goa',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      accommodation: 'Hotel Paradise',
      activities: ['Beach', 'Water Sports', 'Sightseeing']
    }
  })
  @IsOptional()
  tripItinerary?: TripItineraryDto;
}

export class EmergencyContactDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '+919876543211' })
  @IsPhoneNumber('IN')
  phone: string;

  @ApiProperty({ example: 'Spouse' })
  @IsString()
  relationship: string;
}

export class TripItineraryDto {
  @ApiProperty({ example: 'Goa' })
  @IsString()
  destination: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-01-07' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Hotel Paradise' })
  @IsString()
  accommodation: string;

  @ApiProperty({ example: ['Beach', 'Water Sports', 'Sightseeing'] })
  @IsArray()
  @IsString({ each: true })
  activities: string[];
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}
