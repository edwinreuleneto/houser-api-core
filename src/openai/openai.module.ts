// Dependencies
import { Module } from '@nestjs/common';

// Services
import { OpenaiService } from './openai.service';

@Module({
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
