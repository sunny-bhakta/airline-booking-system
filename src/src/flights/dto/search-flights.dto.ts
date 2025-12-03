import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { FlightStatus } from '../entities/flight.entity';

export class SearchFlightsDto {
  @IsString()
  origin: string; // IATA code

  @IsString()
  destination: string; // IATA code

  @IsDateString()
  departureDate: string;

  @IsDateString()
  @IsOptional()
  returnDate?: string; // For round-trip

  @IsInt()
  @Min(1)
  @IsOptional()
  passengers?: number = 1;

  @IsEnum(FlightStatus)
  @IsOptional()
  status?: FlightStatus;

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}

