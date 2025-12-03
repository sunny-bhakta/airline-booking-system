import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AncillaryController } from './ancillary.controller';
import { AncillaryService } from './ancillary.service';
import { Baggage, InFlightService, TravelInsurance } from './entities';
import { Booking } from '../bookings/entities/booking.entity';
import { Passenger } from '../bookings/entities/passenger.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Baggage,
      InFlightService,
      TravelInsurance,
      Booking,
      Passenger,
    ]),
  ],
  controllers: [AncillaryController],
  providers: [AncillaryService],
  exports: [AncillaryService],
})
export class AncillaryModule {}

