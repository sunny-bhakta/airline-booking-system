import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  Length,
} from 'class-validator';
import { AirportType } from '../entities/airport.entity';

export class CreateAirportDto {
  @IsString()
  @Length(3, 3)
  iataCode: string;

  @IsString()
  @Length(4, 4)
  @IsOptional()
  icaoCode?: string;

  @IsString()
  name: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsEnum(AirportType)
  @IsOptional()
  type?: AirportType;
}

