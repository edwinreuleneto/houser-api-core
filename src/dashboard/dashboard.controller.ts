import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Resumo geral de conteúdo e social' })
  overview() {
    return this.dashboard.overview();
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Série temporal de criação/publicação' })
  timeseries(@Query('range') range = '30d', @Query('interval') interval: any = 'day') {
    return this.dashboard.timeseries(range, interval);
  }

  @Get('top-tags')
  @ApiOperation({ summary: 'Top metaTags por frequência' })
  topTags(@Query('limit') limit = '20') {
    return this.dashboard.topTags(Number(limit));
  }

  @Get('top-authors')
  @ApiOperation({ summary: 'Top autores por posts' })
  topAuthors(@Query('limit') limit = '10') {
    return this.dashboard.topAuthors(Number(limit));
  }
}

