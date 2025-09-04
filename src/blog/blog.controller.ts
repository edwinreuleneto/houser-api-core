// Dependencies
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

// Services
import { BlogService } from './blog.service';

// DTOs
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FilterBlogDto } from './dto/filter-blog.dto';
import { GenerateBlogDto } from './dto/generate-blog.dto';
import { GenerateBlogBatchDto } from './dto/generate-blog-batch.dto';
import { BlogDto } from './dto/blog.dto';

@ApiTags('Blog')
@ApiBearerAuth()
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Cria post do blog' })
  create(@UploadedFile() cover: Express.Multer.File, @Body() dto: CreateBlogDto) {
    return this.blogService.create(dto, cover);
  }

  @Get()
  @ApiOperation({ summary: 'Lista posts do blog' })
  findAll(@Query() filter: FilterBlogDto) {
    return this.blogService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do post do blog' })
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @Post('ai')
  @ApiOperation({ summary: 'Gera e cria um post completo com IA' })
  @ApiOkResponse({ type: BlogDto })
  createWithAi(@Body() dto: GenerateBlogDto) {
    return this.blogService.generateWithAi(dto);
  }

  @Post('ai/batch')
  @ApiOperation({ summary: 'Gera e cria múltiplos posts com IA (lista de temas)' })
  @ApiOkResponse({ type: [BlogDto] })
  createManyWithAi(@Body() dto: GenerateBlogBatchDto) {
    return this.blogService.generateManyWithAi(dto);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cover'))
  @ApiOperation({ summary: 'Atualiza post do blog' })
  update(
    @Param('id') id: string,
    @UploadedFile() cover: Express.Multer.File,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, dto, cover);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove post do blog' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  @Post(':id/access')
  @ApiOperation({ summary: 'Incrementa contadores de acesso (view/read) por ID' })
  addAccessById(
    @Param('id') id: string,
    @Body('type') type: 'view' | 'read' = 'view',
  ) {
    return this.blogService.addAccessById(id, type);
  }

  @Post('slug/:slug/access')
  @ApiOperation({ summary: 'Incrementa contadores de acesso (view/read) por slug' })
  addAccessBySlug(
    @Param('slug') slug: string,
    @Body('type') type: 'view' | 'read' = 'view',
  ) {
    return this.blogService.addAccessBySlug(slug, type);
  }
}
