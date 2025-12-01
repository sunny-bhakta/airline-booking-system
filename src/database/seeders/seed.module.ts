import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import {
  Airport,
  Aircraft,
  Route,
  Schedule,
  Flight,
  SeatConfiguration,
  Terminal,
  Gate,
} from '../../flights/entities';
import { Booking, Passenger, Ticket, SeatAssignment } from '../../bookings/entities';
import { Fare, FareRule, TaxFee, PromotionalCode } from '../../pricing/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Airport,
      Aircraft,
      Route,
      Schedule,
      Flight,
      SeatConfiguration,
      Terminal,
      Gate,
      Booking,
      Passenger,
      Ticket,
      SeatAssignment,
      Fare,
      FareRule,
      TaxFee,
      PromotionalCode,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule {}

