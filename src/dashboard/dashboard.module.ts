import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MongoModule } from '../mongo/mongo.module';

@Module({
  imports: [PrismaModule, MongoModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
