import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateGateDto {
  @IsUUID()
  terminalId: string;

  @IsString()
  number: string; // e.g., 'A12', 'B5', 'Gate 23'

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

