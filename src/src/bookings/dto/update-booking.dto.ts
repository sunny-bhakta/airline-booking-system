import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';
import { BookingStatus } from '../entities/booking.entity';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @IsDateString()
  @IsOptional()
  confirmationDate?: string;

  @IsDateString()
  @IsOptional()
  cancellationDate?: string;

  @IsString()
  @IsOptional()
  cancellationReason?: string;
}

