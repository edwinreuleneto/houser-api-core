// Dependencies
import { Module } from '@nestjs/common';

// Modules
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../files/files.module';

// Services
import { SalesService } from './sales.service';

// Controller
import { SalesController } from './sales.controller';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
