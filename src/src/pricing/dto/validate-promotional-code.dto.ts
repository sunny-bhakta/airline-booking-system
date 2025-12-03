import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class ValidatePromotionalCodeDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseAmount?: number;

  @IsOptional()
  @IsString()
  fareClass?: string;

  @IsOptional()
  @IsString()
  userId?: string; // For checking first-time user and usage limits
}

