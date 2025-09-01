// Dependencies
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { File as FileModel } from '@prisma/client';
import { Readable } from 'stream';

// Services
import { PrismaService } from '../prisma/prisma.service';
import { S3Service, UploadResult } from '../s3/s3.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async upload(file: Express.Multer.File, folder = ''): Promise<FileModel> {
    try {
      const uploaded = await this.s3Service.upload(file, folder);
      return await this.prisma.file.create({
        data: {
          name: uploaded.name,
          extension: file.originalname.split('.').pop() ?? '',
          baseUrl: uploaded.url.replace(uploaded.key, ''),
          folder,
          file: uploaded.key,
          url: uploaded.url,
          size: uploaded.size,
        },
      });
    } catch (error) {
      this.logger.error('Failed to upload file', error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadBase64(
    base64: string,
    filename: string,
    folder = '',
  ): Promise<FileModel> {
    try {
      const buffer = Buffer.from(base64, 'base64');
      const ext = (filename.split('.').pop() ?? 'jpg').toLowerCase();
      const mime =
        ext === 'svg'
          ? 'image/svg+xml'
          : ext === 'jpg' || ext === 'jpeg'
            ? 'image/jpeg'
            : ext === 'png'
              ? 'image/png'
              : 'application/octet-stream';
      const file: Express.Multer.File = {
        buffer,
        fieldname: 'file',
        originalname: filename,
        encoding: '7bit',
        mimetype: mime,
        size: buffer.length,
        stream: Readable.from(buffer),
      } as any;
      return await this.upload(file, folder);
    } catch (error) {
      this.logger.error('Failed to upload base64 file', error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getSignedUrl(id: string): Promise<string> {
    try {
      const file = await this.prisma.file.findUnique({ where: { id } });
      if (!file) throw new InternalServerErrorException('File not found');
      return await this.s3Service.getSignedUrl(file.file);
    } catch (error) {
      this.logger.error('Failed to get signed URL', error.stack);
      throw new InternalServerErrorException('Failed to get signed URL');
    }
  }
}
