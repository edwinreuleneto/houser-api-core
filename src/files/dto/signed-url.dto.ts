// Dependencies
import { ApiProperty } from '@nestjs/swagger';

export class SignedUrlDto {
  @ApiProperty()
  url: string;
}
