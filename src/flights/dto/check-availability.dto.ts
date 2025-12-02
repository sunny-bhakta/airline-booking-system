import {
  IsString,
  IsUUID,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { FareClass } from '../../pricing/entities/fare.entity';

export class CheckAvailabilityDto {
  @IsUUID()
  flightId: string;

  @IsInt()
  @Min(1)
  passengers: number;

  @IsEnum(FareClass)
  @IsOptional()
  fareClass?: FareClass;
}

export class AvailabilityResult {
  flightId: string;
  isAvailable: boolean;
  availableSeats: number;
  requestedSeats: number;
  fareClass?: FareClass;
  canOverbook: boolean;
  waitlistAvailable: boolean;
  message?: string;
}

