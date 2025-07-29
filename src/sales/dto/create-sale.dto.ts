// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  lat: number;

  @ApiProperty()
  long: number;

  @ApiProperty()
  responsibleName: string;

  @ApiPropertyOptional()
  phone?: string;
}
