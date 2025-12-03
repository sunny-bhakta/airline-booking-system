import {
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';

export class RefundPaymentDto {
  @IsUUID()
  paymentTransactionId: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number; // If not provided, full refund

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

