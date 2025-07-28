// Dependencies
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { EventEmitter } from 'node:events';
import { Buffer } from 'buffer';
import { Readable } from 'stream';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  name: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3 = new S3Client({ region: process.env.AWS_REGION });
  private readonly bucket = process.env.S3_BUCKET_NAME as string;
  private readonly emitter = new EventEmitter();

  on(event: 'uploaded', listener: (result: UploadResult) => void) {
    this.emitter.on(event, listener);
  }

  async upload(file: Express.Multer.File, folder = ''): Promise<UploadResult> {
    try {
      const key = folder
        ? `${folder}/${Date.now()}-${file.originalname}`
        : `${Date.now()}-${file.originalname}`;
      await this.s3.send(
        new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: file.buffer }),
      );
      const url = `https://${this.bucket}.s3.amazonaws.com/${key}`;
      const result = {
        key,
        url,
        size: file.size,
        name: file.originalname,
      };
      this.emitter.emit('uploaded', result);
      return result;
    } catch (error) {
      this.logger.error('Failed to upload file', error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async uploadBase64(
    base64: string,
    filename: string,
    folder = '',
  ): Promise<UploadResult> {
    try {
      const buffer = Buffer.from(base64, 'base64');
      const file: Express.Multer.File = {
        buffer,
        fieldname: 'file',
        originalname: filename,
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        size: buffer.length,
        stream: Readable.from(buffer),
      } as any;
      return await this.upload(file, folder);
    } catch (error) {
      this.logger.error('Failed to upload base64 file', error.stack);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      this.logger.error('Failed to generate signed URL', error.stack);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }
}
