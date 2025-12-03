import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { PaymentMethodType } from '../entities/payment-method.entity';

export class CreatePaymentMethodDto {
  @IsEnum(PaymentMethodType)
  type: PaymentMethodType;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  cardHolderName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastFourDigits?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  cardBrand?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  walletProvider?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  accountNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  bankName?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsString()
  @IsOptional()
  billingAddress?: string;
}

