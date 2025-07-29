// Dependencies
import { Module } from '@nestjs/common';

// Services
import { HouseEstimateService } from './house-estimate.service';
import { MongoModule } from '../mongo/mongo.module';
import { HouseEstimateController } from './house-estimate.controller';

@Module({
  imports: [MongoModule],
  controllers: [HouseEstimateController],
  providers: [HouseEstimateService],
  exports: [HouseEstimateService],
})
export class HouseEstimateModule {}
