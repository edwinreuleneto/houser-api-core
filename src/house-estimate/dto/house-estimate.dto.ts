// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HouseEstimateDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ type: [Object] })
  items?: unknown[];
}
