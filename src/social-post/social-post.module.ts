import { Module } from '@nestjs/common';
import { SocialPostService } from './social-post.service';
import { SocialPostController } from './social-post.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SocialPostController],
  providers: [SocialPostService],
  exports: [SocialPostService],
})
export class SocialPostModule {}

