import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightsModule } from './flights/flights.module';
import { SeedModule } from './database/seeders/seed.module';
import { Flight } from './flights/entities/flight.entity';
import { Route } from './flights/entities/route.entity';
import { Airport } from './flights/entities/airport.entity';
import { Schedule } from './flights/entities/schedule.entity';
import { Aircraft } from './flights/entities/aircraft.entity';
import { SeatConfiguration } from './flights/entities/seat-configuration.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'travel.db',
      entities: [
        Flight,
        Route,
        Airport,
        Schedule,
        Aircraft,
        SeatConfiguration,
      ],
      synchronize: true, // Set to false in production
      logging: true,
    }),
    FlightsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

