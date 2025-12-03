import { PartialType } from '@nestjs/swagger';
import { CreateBaggageDto } from './create-baggage.dto';

export class UpdateBaggageDto extends PartialType(CreateBaggageDto) {}

