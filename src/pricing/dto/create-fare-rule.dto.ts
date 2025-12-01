import { IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateFareRuleDto {
  @IsUUID()
  fareId: string;

  // Refundability
  @IsOptional()
  @IsBoolean()
  isRefundable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundDeadlineDays?: number;

  // Changeability
  @IsOptional()
  @IsBoolean()
  isChangeable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  changeFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  changeDeadlineDays?: number;

  // Restrictions
  @IsOptional()
  @IsBoolean()
  requiresAdvancePurchase?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  advancePurchaseDays?: number;

  @IsOptional()
  @IsBoolean()
  requiresMinimumStay?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumStayDays?: number;

  @IsOptional()
  @IsBoolean()
  requiresMaximumStay?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumStayDays?: number;

  @IsOptional()
  @IsBoolean()
  isNonRefundable?: boolean;

  @IsOptional()
  @IsBoolean()
  isNonChangeable?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsNameChange?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  nameChangeFee?: number;

  @IsOptional()
  @IsString()
  restrictions?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;
}

