// Dependencies
import { Module } from '@nestjs/common';

// Services
import { PrismaModule } from '../prisma/prisma.module';

// Local
import { WaitingListService } from './waiting-list.service';
import { WaitingListController } from './waiting-list.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WaitingListController],
  providers: [WaitingListService],
})
export class WaitingListModule {}
