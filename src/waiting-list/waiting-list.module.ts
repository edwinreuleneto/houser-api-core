// Dependencies
import { Module } from '@nestjs/common';

// Services
import { WaitingListService } from './waiting-list.service';

// Controllers
import { WaitingListController } from './waiting-list.controller';

@Module({
  controllers: [WaitingListController],
  providers: [WaitingListService],
})
export class WaitingListModule {}
