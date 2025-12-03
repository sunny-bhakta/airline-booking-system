import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InFlightServiceType, MealType } from '../entities/in-flight-service.entity';

export class CreateInFlightServiceDto {
  @ApiProperty({ description: 'Booking UUID', example: 'f3cae1ab-ec9a-4cb5-b124-553cf37e22f7' })
  @IsUUID()
  bookingId: string;

  @ApiPropertyOptional({ description: 'Passenger UUID (optional - for passenger-specific service)' })
  @IsUUID()
  @IsOptional()
  passengerId?: string;

  @ApiProperty({ enum: InFlightServiceType, description: 'Type of in-flight service' })
  @IsEnum(InFlightServiceType)
  type: InFlightServiceType;

  @ApiPropertyOptional({ enum: MealType, description: 'Meal type (for meal services)' })
  @IsEnum(MealType)
  @IsOptional()
  mealType?: MealType;

  @ApiPropertyOptional({ description: 'Service name', example: 'Wi-Fi 24hrs' })
  @IsString()
  @IsOptional()
  serviceName?: string;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price for this service', example: 15.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ description: 'Quantity (e.g., number of meals, hours of wifi)', example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Special requirements (dietary, preferences, etc.)' })
  @IsString()
  @IsOptional()
  specialRequirements?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

