import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { Invoice } from './entities/invoice.entity';
import { Receipt } from './entities/receipt.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { PaymentMethod } from '../users/entities/payment-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentTransaction,
      Invoice,
      Receipt,
      Booking,
      User,
      PaymentMethod,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

