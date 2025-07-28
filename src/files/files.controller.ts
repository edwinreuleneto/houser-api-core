// Dependencies
import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiConsumes,
} from '@nestjs/swagger';

// Services
import { FilesService } from './files.service';

// DTOs
import { SignedUrlDto } from './dto/signed-url.dto';
import { FileDto } from './dto/file.dto';

@ApiTags('Files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get(':id/url')
  @ApiOperation({ summary: 'Obtém URL assinada do arquivo' })
  @ApiOkResponse({ type: SignedUrlDto })
  async getSignedUrl(@Param('id') id: string): Promise<SignedUrlDto> {
    const url = await this.filesService.getSignedUrl(id);
    return { url };
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Faz upload e salva arquivo' })
  @ApiOkResponse({ type: FileDto })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ): Promise<FileDto> {
    const uploaded = await this.filesService.upload(file, folder);
    return uploaded as unknown as FileDto;
  }
}
