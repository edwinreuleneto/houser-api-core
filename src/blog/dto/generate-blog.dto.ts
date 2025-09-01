// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GenerateBlogDto {
  @ApiProperty({ description: 'Tema/assunto do post (texto livre)' })
  @IsString()
  prompt: string;

  @ApiProperty({ description: 'Autor (User.id)' })
  @IsString()
  authorId: string;

  @ApiPropertyOptional({ description: 'Status inicial (DRAFT, PUBLISHED, ARCHIVED)' })
  @IsOptional()
  @IsString()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  @ApiPropertyOptional({ description: 'Data de publicação (ISO)' })
  @IsOptional()
  @IsString()
  publishedAt?: string;
}
