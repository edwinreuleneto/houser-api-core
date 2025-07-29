// Dependencies
import {
  Injectable,
  Logger,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ObjectId, WithId, Document, Collection } from 'mongodb';

// DTOs
import { FilterHouseEstimateDto } from './dto/filter-house-estimate.dto';

// Services
import { MongoService } from '../mongo/mongo.service';

export interface HouseEstimate extends Document {
  _id?: ObjectId;
  items?: unknown[];
}

@Injectable()
export class HouseEstimateService implements OnModuleInit {
  private readonly logger = new Logger(HouseEstimateService.name);
  private collection!: Collection<HouseEstimate>;

  constructor(private readonly mongoService: MongoService) {}

  async onModuleInit() {
    this.collection = this.mongoService.collection<HouseEstimate>('house_estimate');
  }

  async getAll(filter?: FilterHouseEstimateDto): Promise<{
    data: WithId<HouseEstimate>[];
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 10, id, items, ...where } = filter ?? {};
      if (id) {
        Object.assign(where, { _id: new ObjectId(id) });
      }

      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.collection
          .find(where)
          .sort({ orderID: -1 })
          .skip(skip)
          .limit(Number(limit))
          .toArray(),
        this.collection.countDocuments(where),
      ]);
      const totalPages = Math.ceil(total / Number(limit));
      return { data, page, totalPages };
    } catch (error) {
      this.logger.error('Failed to fetch house estimates', error);
      throw new InternalServerErrorException('Failed to fetch house estimates');
    }
  }

  async getById(id: string): Promise<WithId<HouseEstimate> | null> {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      this.logger.error('Failed to fetch house estimate', error);
      throw new InternalServerErrorException('Failed to fetch house estimate');
    }
  }

  async update(id: string, data: Partial<HouseEstimate>): Promise<boolean> {
    try {
      const result = await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data },
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.logger.error('Failed to update house estimate', error);
      throw new InternalServerErrorException('Failed to update house estimate');
    }
  }
}
