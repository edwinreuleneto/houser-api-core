// Dependencies
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// DTOs
import { CreateSaleDto } from './create-sale.dto';

export class FilterSaleDto extends PartialType(CreateSaleDto) {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  limit?: number;
}
