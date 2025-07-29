// Dependencies
import { Global, Module } from '@nestjs/common';

// Services
import { MongoService } from './mongo.service';

@Global()
@Module({
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule {}
