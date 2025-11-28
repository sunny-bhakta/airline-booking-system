import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class SearchBookingsDto {
  @IsString()
  @IsOptional()
  pnr?: string;

  @IsString()
  @IsOptional()
  flightId?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsDateString()
  @IsOptional()
  bookingDateFrom?: string;

  @IsDateString()
  @IsOptional()
  bookingDateTo?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}

