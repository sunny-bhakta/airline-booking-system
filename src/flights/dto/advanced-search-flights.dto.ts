import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FlightStatus } from '../entities/flight.entity';
import { FareClass } from '../../pricing/entities/fare.entity';

export enum TripType {
  ONE_WAY = 'one-way',
  ROUND_TRIP = 'round-trip',
  MULTI_CITY = 'multi-city',
}

export enum StopsFilter {
  NON_STOP = 'non-stop',
  ONE_STOP = '1-stop',
  TWO_PLUS_STOPS = '2+ stops',
  ANY = 'any',
}

export class MultiCitySegment {
  @IsString()
  origin: string; // IATA code

  @IsString()
  destination: string; // IATA code

  @IsDateString()
  departureDate: string;
}

export class AdvancedSearchFlightsDto {
  // Basic search parameters
  @IsString()
  origin: string; // IATA code

  @IsString()
  destination: string; // IATA code

  @IsDateString()
  @IsOptional()
  departureDate?: string; // Single date

  @IsDateString()
  @IsOptional()
  departureDateFrom?: string; // For flexible dates

  @IsDateString()
  @IsOptional()
  departureDateTo?: string; // For flexible dates

  @IsDateString()
  @IsOptional()
  returnDate?: string; // For round-trip

  @IsDateString()
  @IsOptional()
  returnDateFrom?: string; // For flexible return dates

  @IsDateString()
  @IsOptional()
  returnDateTo?: string; // For flexible return dates

  @IsEnum(TripType)
  @IsOptional()
  tripType?: TripType = TripType.ONE_WAY;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MultiCitySegment)
  @IsOptional()
  multiCitySegments?: MultiCitySegment[]; // For multi-city trips

  @IsInt()
  @Min(1)
  @IsOptional()
  passengers?: number = 1;

  // Search filters
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number; // Minimum price filter

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPrice?: number; // Maximum price filter

  @IsString()
  @IsOptional()
  departureTimeFrom?: string; // e.g., '06:00'

  @IsString()
  @IsOptional()
  departureTimeTo?: string; // e.g., '18:00'

  @IsString()
  @IsOptional()
  arrivalTimeFrom?: string; // e.g., '10:00'

  @IsString()
  @IsOptional()
  arrivalTimeTo?: string; // e.g., '22:00'

  @IsEnum(StopsFilter)
  @IsOptional()
  stops?: StopsFilter = StopsFilter.ANY;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxDuration?: number; // Maximum flight duration in minutes

  @IsString()
  @IsOptional()
  aircraftModel?: string; // Filter by aircraft model

  @IsString()
  @IsOptional()
  aircraftManufacturer?: string; // Filter by aircraft manufacturer

  @IsEnum(FareClass)
  @IsOptional()
  fareClass?: FareClass; // Filter by fare class

  @IsEnum(FlightStatus)
  @IsOptional()
  status?: FlightStatus;

  @IsBoolean()
  @IsOptional()
  includeNearbyAirports?: boolean = false; // Include nearby airports

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  nearbyAirportsRadius?: number = 50; // Radius in kilometers for nearby airports

  // Pagination
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  // Sorting
  @IsString()
  @IsOptional()
  sortBy?: 'price' | 'duration' | 'departureTime' | 'arrivalTime' = 'departureTime';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

