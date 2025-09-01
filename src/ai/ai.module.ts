// Dependencies
import { Module } from '@nestjs/common';

// Services
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}

