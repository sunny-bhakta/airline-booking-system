import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaggageType, SpecialBaggageCategory } from '../entities/baggage.entity';

export class CreateBaggageDto {
  @ApiProperty({ description: 'Booking UUID', example: 'f3cae1ab-ec9a-4cb5-b124-553cf37e22f7' })
  @IsUUID()
  bookingId: string;

  @ApiPropertyOptional({ description: 'Passenger UUID (optional - for passenger-specific baggage)' })
  @IsUUID()
  @IsOptional()
  passengerId?: string;

  @ApiProperty({ enum: BaggageType, description: 'Type of baggage' })
  @IsEnum(BaggageType)
  type: BaggageType;

  @ApiPropertyOptional({ enum: SpecialBaggageCategory, description: 'Special baggage category' })
  @IsEnum(SpecialBaggageCategory)
  @IsOptional()
  specialCategory?: SpecialBaggageCategory;

  @ApiProperty({ description: 'Weight in kg', example: 23.5 })
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiPropertyOptional({ description: 'Length in cm', example: 158 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  length?: number;

  @ApiPropertyOptional({ description: 'Width in cm', example: 55 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({ description: 'Height in cm', example: 40 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @ApiProperty({ description: 'Number of pieces', example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Price for this baggage item', example: 50.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Description of special baggage' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

