// Dependencies
import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  extension: string;

  @ApiProperty()
  baseUrl: string;

  @ApiProperty()
  folder: string;

  @ApiProperty()
  file: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
