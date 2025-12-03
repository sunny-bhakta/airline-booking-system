import { PartialType } from '@nestjs/mapped-types';
import { CreateFlightDto } from './create-flight.dto';
import {
  IsEnum,
  IsOptional,
  IsDateString,
  IsString,
  IsInt,
  IsUUID,
} from 'class-validator';
import { FlightStatus } from '../entities/flight.entity';

export class UpdateFlightDto extends PartialType(CreateFlightDto) {
  @IsEnum(FlightStatus)
  @IsOptional()
  status?: FlightStatus;

  @IsDateString()
  @IsOptional()
  actualDepartureTime?: string;

  @IsDateString()
  @IsOptional()
  actualArrivalTime?: string;

  @IsUUID()
  @IsOptional()
  gateId?: string;

  @IsInt()
  @IsOptional()
  availableSeats?: number;

  @IsInt()
  @IsOptional()
  bookedSeats?: number;
}

