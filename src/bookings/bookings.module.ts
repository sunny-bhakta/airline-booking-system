import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import {
  Booking,
  Passenger,
  Ticket,
  SeatAssignment,
} from './entities';
import { Flight } from '../flights/entities/flight.entity';
import { PricingModule } from '../pricing/pricing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Passenger,
      Ticket,
      SeatAssignment,
      Flight,
    ]),
    PricingModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

