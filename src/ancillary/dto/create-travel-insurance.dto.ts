import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InsuranceType } from '../entities/travel-insurance.entity';

export class CreateTravelInsuranceDto {
  @ApiProperty({ description: 'Booking UUID', example: 'f3cae1ab-ec9a-4cb5-b124-553cf37e22f7' })
  @IsUUID()
  bookingId: string;

  @ApiPropertyOptional({ description: 'Passenger UUID (optional - for passenger-specific insurance)' })
  @IsUUID()
  @IsOptional()
  passengerId?: string;

  @ApiProperty({ enum: InsuranceType, description: 'Type of insurance' })
  @IsEnum(InsuranceType)
  type: InsuranceType;

  @ApiPropertyOptional({ description: 'Policy name', example: 'Comprehensive Travel Protection' })
  @IsString()
  @IsOptional()
  policyName?: string;

  @ApiPropertyOptional({ description: 'Policy description and coverage details' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Maximum coverage amount', example: 10000.00 })
  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Insurance premium price', example: 75.00 })
  @IsNumber()
  @Min(0)
  premium: number;

  @ApiProperty({ description: 'Coverage start date (ISO 8601)', example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Coverage end date (ISO 8601)', example: '2024-01-20T18:00:00Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Insurance policy number' })
  @IsString()
  @IsOptional()
  policyNumber?: string;

  @ApiPropertyOptional({ description: 'Insurance provider name', example: 'TravelGuard' })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiPropertyOptional({ description: 'Policy terms and conditions' })
  @IsString()
  @IsOptional()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

