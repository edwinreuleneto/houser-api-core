// Dependencies
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// DTOs
import { CreateBlogDto } from './create-blog.dto';

export class FilterBlogDto extends PartialType(CreateBlogDto) {
  @ApiPropertyOptional({ description: 'Página atual', default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: 'Quantidade por página', default: 10 })
  limit?: number;
}

