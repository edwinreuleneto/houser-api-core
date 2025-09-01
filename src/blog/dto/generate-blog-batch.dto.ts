// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator';

export class GenerateBlogBatchDto {
  @ApiProperty({ type: [String], description: 'Lista de temas/assuntos para geração' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  prompts: string[];

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

