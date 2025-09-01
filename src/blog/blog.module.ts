// Dependencies
import { Module } from '@nestjs/common';

// Services
import { BlogService } from './blog.service';

// Controllers
import { BlogController } from './blog.controller';

// Modules
import { PrismaModule } from '../prisma/prisma.module';
import { FilesModule } from '../files/files.module';
import { AiModule } from '../ai/ai.module';
import { SocialPostModule } from '../social-post/social-post.module';

@Module({
  imports: [PrismaModule, FilesModule, AiModule, SocialPostModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
