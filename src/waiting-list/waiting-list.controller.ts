// Dependencies
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// Services
import { WaitingListService } from './waiting-list.service';

// DTOs
import { CreateWaitingListDto } from './dto/create-waiting-list.dto';
import { UpdateWaitingListDto } from './dto/update-waiting-list.dto';
import { FilterWaitingListDto } from './dto/filter-waiting-list.dto';

@ApiTags('Waiting List')
@Controller('waiting-list')
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @Post()
  @ApiOperation({ summary: 'Insere usuário na fila de espera' })
  create(@Body() createWaitingListDto: CreateWaitingListDto) {
    return this.waitingListService.create(createWaitingListDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista usuários da fila de espera com paginação' })
  findAll(@Query() filter: FilterWaitingListDto) {
    return this.waitingListService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Exibe um usuário específico da fila de espera' })
  findOne(@Param('id') id: string) {
    return this.waitingListService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de um usuário da fila de espera' })
  update(
    @Param('id') id: string,
    @Body() updateWaitingListDto: UpdateWaitingListDto,
  ) {
    return this.waitingListService.update(id, updateWaitingListDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário da fila de espera' })
  remove(@Param('id') id: string) {
    return this.waitingListService.remove(id);
  }
}
