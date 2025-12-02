import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { LoyaltyTier } from '../entities/loyalty-membership.entity';

export class CreateLoyaltyMembershipDto {
  @IsString()
  @MaxLength(100)
  programName: string;

  @IsString()
  @MaxLength(50)
  membershipNumber: string;

  @IsEnum(LoyaltyTier)
  @IsOptional()
  tier?: LoyaltyTier;

  @IsInt()
  @IsOptional()
  @Min(0)
  miles?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  points?: number;

  @IsDateString()
  @IsOptional()
  tierExpiryDate?: string;

  @IsInt()
  @IsOptional()
  @Min(0)
  tierMilesRequired?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  benefits?: string;
}

