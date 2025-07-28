// Dependencies
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  token: string;
}
