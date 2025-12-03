import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { SeatPreference, MealPreference } from '../entities/travel-preference.entity';

export class CreateTravelPreferenceDto {
  @IsEnum(SeatPreference)
  @IsOptional()
  seatPreference?: SeatPreference;

  @IsEnum(MealPreference)
  @IsOptional()
  mealPreference?: MealPreference;

  @IsBoolean()
  @IsOptional()
  prefersWindowSeat?: boolean;

  @IsBoolean()
  @IsOptional()
  prefersAisleSeat?: boolean;

  @IsBoolean()
  @IsOptional()
  prefersExitRow?: boolean;

  @IsBoolean()
  @IsOptional()
  needsSpecialAssistance?: boolean;

  @IsString()
  @IsOptional()
  specialAssistanceDetails?: string;

  @IsBoolean()
  @IsOptional()
  prefersPriorityBoarding?: boolean;

  @IsBoolean()
  @IsOptional()
  prefersLoungeAccess?: boolean;

  @IsString()
  @IsOptional()
  preferredAirline?: string;

  @IsString()
  @IsOptional()
  preferredAirports?: string;

  @IsString()
  @IsOptional()
  travelClassPreference?: string;
}

