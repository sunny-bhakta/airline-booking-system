import { IsEnum, IsNumber, IsString, IsOptional, IsBoolean, IsUUID, Min } from 'class-validator';
import { TaxFeeType, TaxFeeCalculationType } from '../entities/tax-fee.entity';

export class CreateTaxFeeDto {
  @IsUUID()
  fareId: string;

  @IsEnum(TaxFeeType)
  type: TaxFeeType;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(TaxFeeCalculationType)
  calculationType?: TaxFeeCalculationType;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

