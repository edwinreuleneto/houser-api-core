// Dependencies
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class FilterWaitingListDto {
  @ApiPropertyOptional({ description: 'Página atual', default: 1 })
  @IsOptional()
  @IsNumberString()
  page?: number;

  @ApiPropertyOptional({ description: 'Quantidade de itens por página', default: 10 })
  @IsOptional()
  @IsNumberString()
  limit?: number;
}
