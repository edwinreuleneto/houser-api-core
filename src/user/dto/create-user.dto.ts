// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  firebaseUid?: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  fileId?: string;

  @ApiPropertyOptional()
  active?: boolean;

  @ApiPropertyOptional()
  externalActive?: boolean;

  @ApiPropertyOptional()
  phone?: string;
}
