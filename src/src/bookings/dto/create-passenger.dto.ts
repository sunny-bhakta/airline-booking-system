import {
  IsString,
  IsDateString,
  IsOptional,
  IsEmail,
  Length,
} from 'class-validator';

export class CreatePassengerDto {
  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  gender?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  nationality?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  passportNumber?: string;

  @IsDateString()
  @IsOptional()
  passportExpiryDate?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  passportIssuingCountry?: string;

  @IsString()
  @IsOptional()
  specialAssistance?: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  frequentFlyerNumber?: string;
}

