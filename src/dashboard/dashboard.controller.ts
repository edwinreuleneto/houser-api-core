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
  timeseries(
    @Query('range') range = '30d',
    @Query('interval') interval: any = 'day',
  ) {
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

  @Get('estimates/timeseries')
  @ApiOperation({ summary: 'Série temporal de solicitações de orçamento' })
  estimateTimeseries(
    @Query('range') range = '30d',
    @Query('interval') interval: any = 'day',
  ) {
    return this.dashboard.estimateTimeseries(range, interval);
  }

  @Get('reads')
  @ApiOperation({ summary: 'Quantidade total de leituras (blogs)' })
  totalReads() {
    return this.dashboard.totalReads();
  }

  @Get('reads/timeseries')
  @ApiOperation({ summary: 'Série temporal de leituras (reads) de blogs' })
  readsTimeseries(
    @Query('range') range = '30d',
    @Query('interval') interval: any = 'day',
  ) {
    return this.dashboard.readsTimeseries(range, interval);
  }

  @Get('top-read')
  @ApiOperation({ summary: 'Top 10 posts mais lidos' })
  topRead(
    @Query('limit') limit = '10',
    @Query('range') range?: string,
  ) {
    return this.dashboard.topRead(Number(limit), range);
  }

  @Get('access/last-30')
  @ApiOperation({ summary: 'Quantidade de acessos (views e reads) nos últimos 30 dias' })
  accessLast30() {
    return this.dashboard.accessLast30();
  }
}
