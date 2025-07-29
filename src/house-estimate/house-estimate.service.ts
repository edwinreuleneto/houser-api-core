// Dependencies
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ObjectId, WithId } from 'mongodb';

// Services
import { MongoService } from '../mongo/mongo.service';

export interface HouseEstimate extends Record<string, any> {
  _id?: ObjectId;
  items?: unknown[];
}

@Injectable()
export class HouseEstimateService {
  private readonly logger = new Logger(HouseEstimateService.name);
  private readonly collection;

  constructor(private readonly mongoService: MongoService) {
    this.collection = this.mongoService.collection<HouseEstimate>('house_estimate');
  }

  async getAll(): Promise<WithId<HouseEstimate>[]> {
    try {
      return await this.collection.find().toArray();
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
