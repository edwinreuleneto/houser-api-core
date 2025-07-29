// Dependencies
import { PartialType } from '@nestjs/swagger';

// DTOs
import { HouseEstimateDto } from './house-estimate.dto';

export class UpdateHouseEstimateDto extends PartialType(HouseEstimateDto) {}
