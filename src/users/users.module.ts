import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {
  User,
  UserProfile,
  PaymentMethod,
  TravelPreference,
  LoyaltyMembership,
} from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      PaymentMethod,
      TravelPreference,
      LoyaltyMembership,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

