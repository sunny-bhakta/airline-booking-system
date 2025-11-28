import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { TerminalsService } from './terminals.service';
import { TerminalsController } from './terminals.controller';
import { GatesService } from './gates.service';
import { GatesController } from './gates.controller';
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
    ]),
  ],
  controllers: [FlightsController, TerminalsController, GatesController],
  providers: [FlightsService, TerminalsService, GatesService],
  exports: [FlightsService, TerminalsService, GatesService],
})
export class FlightsModule {}

