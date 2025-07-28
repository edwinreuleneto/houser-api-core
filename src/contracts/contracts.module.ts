// Dependencies
import { Module } from '@nestjs/common';

// Modules
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../files/files.module';
import { OpenaiModule } from '../openai/openai.module';

// Services
import { ContractsService } from './contracts.service';

// Controller
import { ContractsController } from './contracts.controller';

@Module({
  imports: [PrismaModule, FilesModule, OpenaiModule],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
