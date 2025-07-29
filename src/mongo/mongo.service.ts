// Dependencies
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { MongoClient, Db, Collection, Document } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongoService.name);
  private client: MongoClient;
  private db: Db;

  async onModuleInit() {
    const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
    const dbName = process.env.MONGO_DB ?? 'test';
    try {
      this.client = new MongoClient(uri);
      await this.client.connect();
      this.db = this.client.db(dbName);
      this.logger.log('Connected to MongoDB');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.client.close();
    } catch (error) {
      this.logger.error('Failed to close MongoDB connection', error);
      throw error;
    }
  }

  collection<T extends Document = Document>(name: string): Collection<T> {
    return this.db.collection<T>(name);
  }
}
