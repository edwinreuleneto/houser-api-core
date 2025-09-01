// Dependencies
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

// Services
import { WaitingListService } from './waiting-list.service';

// Modules
import { PrismaModule } from '../prisma/prisma.module';

// Controllers
import { WaitingListController } from './waiting-list.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WaitingListController],
  providers: [WaitingListService],
})
export class WaitingListModule {}
