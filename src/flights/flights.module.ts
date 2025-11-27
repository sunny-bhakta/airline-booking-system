import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import {
  Flight,
  Route,
  Airport,
  Schedule,
  Aircraft,
  SeatConfiguration,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Flight,
      Route,
      Airport,
      Schedule,
      Aircraft,
      SeatConfiguration,
    ]),
  ],
  controllers: [FlightsController],
  providers: [FlightsService],
  exports: [FlightsService],
})
export class FlightsModule {}

