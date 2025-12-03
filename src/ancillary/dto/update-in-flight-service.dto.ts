import { PartialType } from '@nestjs/swagger';
import { CreateInFlightServiceDto } from './create-in-flight-service.dto';

export class UpdateInFlightServiceDto extends PartialType(CreateInFlightServiceDto) {}

