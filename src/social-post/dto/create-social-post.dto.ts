// Dependencies
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateSocialPostDto {
  @ApiProperty({ description: 'Blog ID' })
  @IsString()
  blogId: string;

  @ApiProperty({ enum: ['LINKEDIN', 'INSTAGRAM'] as const })
  @IsEnum(['LINKEDIN', 'INSTAGRAM'] as any)
  platform: 'LINKEDIN' | 'INSTAGRAM';

  @ApiProperty({ description: 'Conteúdo do post' })
  @IsString()
  content: string;
}

export class CreateManyForBlogDto {
  @ApiProperty({ description: 'Blog ID' })
  @IsString()
  blogId: string;

  @ApiPropertyOptional({ description: 'Post Linkedin' })
  @IsOptional()
  @IsString()
  socialLinkedin?: string;

  @ApiPropertyOptional({ description: 'Post Instagram' })
  @IsOptional()
  @IsString()
  socialInstagram?: string;
}

