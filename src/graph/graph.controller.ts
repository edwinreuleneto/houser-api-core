// Dependencies
import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// Services
import { GraphService } from './graph.service';

@ApiTags('Graph')
@Controller('graph')
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get('users')
  @ApiOperation({ summary: 'Lista usuários do Microsoft Graph com foto' })
  getUsers() {
    return this.graphService.getUsersWithPhotos();
  }

  @Post('sync-users')
  @ApiOperation({
    summary: 'Sincroniza usuários do Microsoft Graph na base local',
  })
  syncUsers() {
    return this.graphService.syncUsers();
  }
}
