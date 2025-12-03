import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class CreateInvoiceDto {
  @IsUUID()
  bookingId: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @IsNumber()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxes?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  fees?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

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
  taxBreakdown?: string; // JSON string

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  termsAndConditions?: string;
}

