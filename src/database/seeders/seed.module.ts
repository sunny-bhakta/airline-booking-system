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
import { Booking, Passenger } from '../../bookings/entities';

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
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule {}

