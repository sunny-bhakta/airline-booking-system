import { PartialType } from '@nestjs/swagger';
import { CreateTravelInsuranceDto } from './create-travel-insurance.dto';

export class UpdateTravelInsuranceDto extends PartialType(CreateTravelInsuranceDto) {}

