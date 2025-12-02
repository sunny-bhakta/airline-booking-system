import {
  IsString,
  IsOptional,
  IsDateString,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  gender?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  nationality?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  passportNumber?: string;

  @IsDateString()
  @IsOptional()
  passportExpiryDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  passportIssuingCountry?: string;

  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  emergencyContactPhone?: string;

  @IsString()
  @IsOptional()
  specialAssistance?: string;

  @IsString()
  @IsOptional()
  dietaryPreferences?: string;
}

