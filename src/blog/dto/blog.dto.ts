// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileDto } from '../../files/dto/file.dto';

class AuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  name?: string;
}

export class BlogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  content?: string;

  @ApiProperty({ type: [String] })
  metaTags: string[];

  @ApiProperty()
  authorId: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  publishedAt?: string | Date;

  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @ApiProperty({ type: Date })
  createdAt: Date;

  @ApiProperty({ type: Date })
  updatedAt: Date;

  @ApiPropertyOptional({ type: FileDto })
  cover?: FileDto;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;
}
