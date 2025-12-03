import { IsEnum, IsNumber, IsString, IsOptional, IsBoolean, IsDateString, IsUUID, Min } from 'class-validator';
import { FareClass } from '../entities/fare.entity';

export class CreateFareDto {
  @IsUUID()
  flightId: string;

  @IsOptional()
  @IsUUID()
  routeId?: string;

  @IsEnum(FareClass)
  fareClass: FareClass;

  @IsNumber()
  @Min(0)
  baseFare: number;

  @IsOptional()
  @IsNumber()
  dynamicPriceAdjustment?: number;

  @IsNumber()
  @Min(0)
  totalFare: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  availableSeats?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validTo?: string;
}

