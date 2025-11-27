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
} from '../../flights/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Airport,
      Aircraft,
      Route,
      Schedule,
      Flight,
      SeatConfiguration,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule {}

