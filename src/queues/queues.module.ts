// Dependencies
import { Global, Module } from '@nestjs/common';

// Services
import { QueuesService } from './queues.service';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [QueuesService],
  exports: [QueuesService],
})
export class QueuesModule {}
