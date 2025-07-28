// Dependencies
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

// Services
import { ContractsService } from './contracts.service';

// DTOs
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria contrato' })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Post('file')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Cria contrato enviando arquivo' })
  createFromFile(@UploadedFile() file: Express.Multer.File) {
    return this.contractsService.createFromFile(file);
  }

  @Get()
  @ApiOperation({ summary: 'Lista contratos' })
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes do contrato' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }
}
