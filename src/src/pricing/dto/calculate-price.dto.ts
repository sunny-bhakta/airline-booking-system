import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, IsInt } from 'class-validator';
import { FareClass } from '../entities/fare.entity';

export class CalculatePriceDto {
  @IsUUID()
  flightId: string;

  @IsEnum(FareClass)
  fareClass: FareClass;

  @IsInt()
  @Min(1)
  passengerCount: number;

  @IsOptional()
  @IsString()
  promotionalCode?: string;

  @IsOptional()
  @IsString()
  currency?: string;
}

export class PriceCalculationResult {
  baseFare: number;
  dynamicPriceAdjustment: number;
  subtotal: number;
  taxes: number;
  fees: number;
  promotionalDiscount: number;
  totalAmount: number;
  currency: string;
  fareClass: FareClass;
  breakdown: {
    baseFare: number;
    dynamicPriceAdjustment: number;
    taxes: TaxFeeBreakdown[];
    fees: TaxFeeBreakdown[];
    promotionalDiscount?: {
      code: string;
      discount: number;
    };
  };
}

export interface TaxFeeBreakdown {
  type: string;
  name: string;
  amount: number;
}

