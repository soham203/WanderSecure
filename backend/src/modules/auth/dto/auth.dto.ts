import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsPhoneNumber, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

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
      { name: 'Jane Doe', phone: '+919876543211', relationship: 'Spouse' }
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
  @ValidateNested()
  @Type(() => TripItineraryDto)
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

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;

  @ApiProperty({ example: 3600 })
  expires_in: number;

  @ApiProperty({ example: 'Bearer' })
  token_type: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refresh_token: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'oldpassword123' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'newpassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset_token_here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newpassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
