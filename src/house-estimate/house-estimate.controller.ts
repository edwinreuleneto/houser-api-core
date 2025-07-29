// Dependencies
import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';

// Services
import { HouseEstimateService } from './house-estimate.service';

// DTOs
import { HouseEstimateDto } from './dto/house-estimate.dto';
import { UpdateHouseEstimateDto } from './dto/update-house-estimate.dto';

@ApiTags('House Estimate')
@ApiBearerAuth()
@Controller('house_estimate')
export class HouseEstimateController {
  constructor(private readonly houseEstimateService: HouseEstimateService) {}

  @Get()
  @ApiOperation({ summary: 'Lista house estimates' })
  @ApiOkResponse({ type: [HouseEstimateDto] })
  async getAll(): Promise<HouseEstimateDto[]> {
    const estimates = await this.houseEstimateService.getAll();
    return estimates as unknown as HouseEstimateDto[];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha house estimate' })
  @ApiOkResponse({ type: HouseEstimateDto })
  async getById(@Param('id') id: string): Promise<HouseEstimateDto | null> {
    const estimate = await this.houseEstimateService.getById(id);
    return estimate as unknown as HouseEstimateDto;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza house estimate' })
  @ApiOkResponse({ type: Boolean })
  update(
    @Param('id') id: string,
    @Body() data: UpdateHouseEstimateDto,
  ) {
    return this.houseEstimateService.update(id, data);
  }
}
