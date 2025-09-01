// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @ApiProperty({ description: 'Título do post' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Slug do post (kebab-case, único). Se omitido, será gerado do título.' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Descrição/conteúdo do post' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Conteúdo em HTML do post' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Meta tags do post', type: [String] })
  @IsOptional()
  @IsArray()
  metaTags?: string[];

  @ApiProperty({ description: 'ID do autor (User.id)' })
  @IsString()
  authorId: string;

  @ApiPropertyOptional({ description: 'Data de publicação (ISO)' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiPropertyOptional({ description: 'Status do post', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsOptional()
  @IsString()
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
