import { IsEnum, IsNumber, IsString, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';
import { PromotionalCodeType } from '../entities/promotional-code.entity';

export class CreatePromotionalCodeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PromotionalCodeType)
  type: PromotionalCodeType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validTo: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxUses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxUsesPerUser?: number;

  @IsOptional()
  @IsString()
  applicableFareClass?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isFirstTimeUserOnly?: boolean;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;
}

