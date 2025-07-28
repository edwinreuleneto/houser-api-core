import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    try {
      return 'Hello World!';
    } catch (error) {
      this.logger.error('Failed to get hello message', error.stack);
      throw error;
    }
  }
}
