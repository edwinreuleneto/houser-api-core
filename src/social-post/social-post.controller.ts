import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SocialPostService } from './social-post.service';
import { CreateSocialPostDto, CreateManyForBlogDto } from './dto/create-social-post.dto';
import { UpdateSocialPostDto } from './dto/update-social-post.dto';

@ApiTags('Social Posts')
@ApiBearerAuth()
@Controller('social-posts')
export class SocialPostController {
  constructor(private readonly socialPostService: SocialPostService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um post social' })
  create(@Body() dto: CreateSocialPostDto) {
    return this.socialPostService.create(dto);
  }

  @Post('blog')
  @ApiOperation({ summary: 'Cria posts sociais para um blog (LinkedIn/Instagram) se fornecidos' })
  createForBlog(@Body() dto: CreateManyForBlogDto) {
    return this.socialPostService.createManyForBlog(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista posts sociais' })
  list(@Query('blogId') blogId?: string, @Query('platform') platform?: 'LINKEDIN' | 'INSTAGRAM') {
    return this.socialPostService.findAll(blogId, platform);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do post social' })
  findOne(@Param('id') id: string) {
    return this.socialPostService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um post social' })
  update(@Param('id') id: string, @Body() dto: UpdateSocialPostDto) {
    return this.socialPostService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um post social' })
  remove(@Param('id') id: string) {
    return this.socialPostService.remove(id);
  }
}

