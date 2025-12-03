import { IsUUID, IsInt, IsOptional, Min } from 'class-validator';

export class CreateRouteDto {
  @IsUUID()
  originId: string;

  @IsUUID()
  destinationId: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  distance?: number; // in kilometers

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedDuration?: number; // in minutes
}

