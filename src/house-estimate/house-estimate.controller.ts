// Dependencies
import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

// Services
import { HouseEstimateService, HouseEstimate } from './house-estimate.service';

@ApiTags('House Estimate')
@ApiBearerAuth()
@Controller('house_estimate')
export class HouseEstimateController {
  constructor(private readonly houseEstimateService: HouseEstimateService) {}

  @Get()
  @ApiOperation({ summary: 'Lista house estimates' })
  getAll() {
    return this.houseEstimateService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha house estimate' })
  getById(@Param('id') id: string) {
    return this.houseEstimateService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza house estimate' })
  update(
    @Param('id') id: string,
    @Body() data: Partial<HouseEstimate>,
  ) {
    return this.houseEstimateService.update(id, data);
  }
}
