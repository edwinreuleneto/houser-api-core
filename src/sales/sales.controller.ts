// Dependencies
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

// Services
import { SalesService } from './sales.service';

// DTOs
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { FilterSaleDto } from './dto/filter-sale.dto';

@ApiTags('Sales')
@ApiBearerAuth()
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Cria venda de imóvel' })
  create(
    @UploadedFile() photo: Express.Multer.File,
    @Body() createSaleDto: CreateSaleDto,
  ) {
    return this.salesService.create(createSaleDto, photo);
  }

  @Get()
  @ApiOperation({ summary: 'Lista vendas' })
  findAll(@Query() filter: FilterSaleDto) {
    return this.salesService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da venda' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Atualiza venda' })
  update(
    @Param('id') id: string,
    @UploadedFile() photo: Express.Multer.File,
    @Body() updateSaleDto: UpdateSaleDto,
  ) {
    return this.salesService.update(id, updateSaleDto, photo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove venda' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
