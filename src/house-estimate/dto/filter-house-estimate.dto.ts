// Dependencies
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// DTOs
import { HouseEstimateDto } from './house-estimate.dto';

export class FilterHouseEstimateDto extends PartialType(HouseEstimateDto) {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  limit?: number;
}

