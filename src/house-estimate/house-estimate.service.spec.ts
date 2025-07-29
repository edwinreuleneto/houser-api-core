import { Test, TestingModule } from '@nestjs/testing';
import { HouseEstimateService } from './house-estimate.service';
import { MongoService } from '../mongo/mongo.service';

describe('HouseEstimateService', () => {
  let service: HouseEstimateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HouseEstimateService, MongoService],
    }).compile();

    service = module.get<HouseEstimateService>(HouseEstimateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
