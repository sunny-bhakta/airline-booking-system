import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { Fare, FareRule, TaxFee, PromotionalCode } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fare, FareRule, TaxFee, PromotionalCode]),
  ],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService], // Export for use in other modules (e.g., bookings)
})
export class PricingModule {}

