// Dependencies
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// DTOs
import { CreateUserDto } from './create-user.dto';

export class FilterUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  limit?: number;
}
