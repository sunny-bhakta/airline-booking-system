import {
  IsString,
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { FlightStatus } from '../entities/flight.entity';

export class CreateFlightDto {
  @IsString()
  flightNumber: string;

  @IsUUID()
  routeId: string;

  @IsUUID()
  scheduleId: string;

  @IsUUID()
  aircraftId: string;

  @IsDateString()
  departureDate: string;

  @IsEnum(FlightStatus)
  @IsOptional()
  status?: FlightStatus;

  @IsString()
  @IsOptional()
  gate?: string;

  @IsString()
  @IsOptional()
  terminal?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

