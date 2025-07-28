// Dependencies
import { Module } from '@nestjs/common';

// Services
import { FilesService } from './files.service';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';
import { FilesController } from './files.controller';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
