import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethodType } from '../../users/entities/payment-method.entity';

export class PaymentCardDto {
  @IsString()
  @MaxLength(100)
  cardNumber: string;

  @IsString()
  @MaxLength(50)
  cardHolderName: string;

  @IsString()
  @MaxLength(10)
  expiryMonth: string; // MM

  @IsString()
  @MaxLength(10)
  expiryYear: string; // YYYY

  @IsString()
  @MaxLength(10)
  cvv: string;
}

export class ProcessPaymentDto {
  @IsUUID()
  bookingId: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsUUID()
  @IsOptional()
  paymentMethodId?: string; // Use saved payment method

  @IsEnum(PaymentMethodType)
  paymentMethodType: PaymentMethodType;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  // Card details (if not using saved payment method)
  @ValidateNested()
  @Type(() => PaymentCardDto)
  @IsOptional()
  cardDetails?: PaymentCardDto;

  // Digital wallet details
  @IsString()
  @IsOptional()
  @MaxLength(100)
  walletProvider?: string; // PayPal, Apple Pay, Google Pay

  @IsString()
  @IsOptional()
  @MaxLength(100)
  walletToken?: string;

  // Bank transfer / UPI / Net Banking
  @IsString()
  @IsOptional()
  @MaxLength(100)
  accountNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  bankName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  upiId?: string;

  // Billing information
  @IsString()
  @IsOptional()
  @MaxLength(200)
  billingName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  billingEmail?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  billingPhone?: string;

  @IsString()
  @IsOptional()
  billingAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  billingCity?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  billingState?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  billingPostalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  billingCountry?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentGateway?: string; // Stripe, PayPal, Razorpay, etc.
}

