// Dependencies
import { Module } from '@nestjs/common';

// Services
import { BlogService } from './blog.service';

// Controllers
import { BlogController } from './blog.controller';
import { MongoModule } from '../mongo/mongo.module';
import { QueuesModule } from '../queues/queues.module';
import { AiBlogQueue } from '../queues/workers/ai-blog.queue';

// Modules
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../files/files.module';
import { AiModule } from '../ai/ai.module';
import { SocialPostModule } from '../social-post/social-post.module';

@Module({
  imports: [PrismaModule, FilesModule, AiModule, SocialPostModule, MongoModule, QueuesModule],
  controllers: [BlogController],
  providers: [BlogService, AiBlogQueue],
})
export class BlogModule {}
