import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateTerminalDto {
  @IsUUID()
  airportId: string;

  @IsString()
  name: string; // e.g., 'Terminal 1', 'Terminal A', 'International Terminal'

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

