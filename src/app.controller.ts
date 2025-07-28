import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// Decorators
import { Public } from './common/decorators/public.decorator';
import { AppService } from './app.service';

@ApiTags('Status')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Endpoint padrão de status' })
  getHello(): string {
    return this.appService.getHello();
  }
}
