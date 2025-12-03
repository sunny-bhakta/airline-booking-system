import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { TerminalsService } from './terminals.service';
import { TerminalsController } from './terminals.controller';
import { GatesService } from './gates.service';
import { GatesController } from './gates.controller';
import { SearchAvailabilityService } from './services/search-availability.service';
import {
  Flight,
  Route,
  Airport,
  Schedule,
  Aircraft,
  SeatConfiguration,
  Terminal,
  Gate,
} from './entities';
import { Fare } from '../pricing/entities/fare.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Flight,
      Route,
      Airport,
      Schedule,
      Aircraft,
      SeatConfiguration,
      Terminal,
      Gate,
      Fare,
    ]),
  ],
  controllers: [FlightsController, TerminalsController, GatesController],
  providers: [FlightsService, TerminalsService, GatesService, SearchAvailabilityService],
  exports: [FlightsService, TerminalsService, GatesService, SearchAvailabilityService],
})
export class FlightsModule {}

