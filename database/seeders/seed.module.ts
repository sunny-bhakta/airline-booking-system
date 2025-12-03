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
import {
  User,
  UserProfile,
  PaymentMethod,
  TravelPreference,
  LoyaltyMembership,
} from '../../users/entities';
import {
  Baggage,
  InFlightService,
  TravelInsurance,
} from '../../ancillary/entities';
import {
  PaymentTransaction,
  Invoice,
  Receipt,
} from '../../payments/entities';

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
      User,
      UserProfile,
      PaymentMethod,
      TravelPreference,
      LoyaltyMembership,
      Baggage,
      InFlightService,
      TravelInsurance,
      PaymentTransaction,
      Invoice,
      Receipt,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeedModule {}

