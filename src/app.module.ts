import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FlightsModule } from './flights/flights.module';
import { BookingsModule } from './bookings/bookings.module';
import { PricingModule } from './pricing/pricing.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './database/seeders/seed.module';
import { Flight } from './flights/entities/flight.entity';
import { Route } from './flights/entities/route.entity';
import { Airport } from './flights/entities/airport.entity';
import { Schedule } from './flights/entities/schedule.entity';
import { Aircraft } from './flights/entities/aircraft.entity';
import { SeatConfiguration } from './flights/entities/seat-configuration.entity';
import { Booking, Passenger, Ticket, SeatAssignment } from './bookings/entities';
import { Gate, Terminal } from './flights/entities';
import { Fare, FareRule, TaxFee, PromotionalCode } from './pricing/entities';
import {
  User,
  UserProfile,
  PaymentMethod,
  TravelPreference,
  LoyaltyMembership,
} from './users/entities';

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
        Booking,
        Passenger,
        Ticket,
        SeatAssignment,
        Terminal,
        Gate,
        Fare,
        FareRule,
        TaxFee,
        PromotionalCode,
        User,
        UserProfile,
        PaymentMethod,
        TravelPreference,
        LoyaltyMembership,
      ],
      synchronize: true, // Set to false in production
      logging: true,
    }),
    FlightsModule,
    BookingsModule,
    PricingModule,
    UsersModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

