import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Length,
} from 'class-validator';

export class CreateSeatAssignmentDto {
  @IsUUID()
  passengerId: string;

  @IsString()
  @Length(1, 10)
  seatNumber: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  seatType?: string;

  @IsString()
  @IsOptional()
  @Length(1, 20)
  seatClass?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  seatPrice?: number;

  @IsBoolean()
  @IsOptional()
  isPreferred?: boolean;
}

