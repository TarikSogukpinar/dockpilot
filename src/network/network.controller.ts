import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { NetworkService } from './network.service';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { CustomRequest } from '../core/request/customRequest';

@Controller({ path: 'network', version: '1' })
@ApiTags('Docker Networks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new Docker network' })
  @ApiResponse({
    status: 201,
    description: 'The network has been successfully created',
  })
  async createNetwork(
    @Req() req: CustomRequest,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    @Body() networkConfig: any,
  ) {
    return this.networkService.createNetwork(
      req.user.id,
      connectionUuid,
      networkConfig,
    );
  }

  @Get('list')
  @ApiOperation({ summary: 'List all Docker networks' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all Docker networks',
  })
  async listNetworks(
    @Req() req: CustomRequest,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
  ) {
    return this.networkService.listNetworks(req.user.id, connectionUuid);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get network details' })
  @ApiParam({ name: 'uuid', description: 'UUID of the network' })
  @ApiResponse({
    status: 200,
    description: 'Returns the network details',
  })
  async getNetwork(
    @Req() req: CustomRequest,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
  ) {
    return this.networkService.getNetwork(req.user.id, connectionUuid, uuid);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Remove a Docker network' })
  @ApiParam({ name: 'uuid', description: 'UUID of the network to remove' })
  @ApiResponse({
    status: 200,
    description: 'The network has been successfully removed',
  })
  async removeNetwork(
    @Req() req: CustomRequest,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
  ) {
    return this.networkService.removeNetwork(req.user.id, connectionUuid, uuid);
  }

  @Post(':uuid/connect')
  @ApiOperation({ summary: 'Connect a container to a network' })
  @ApiParam({ name: 'uuid', description: 'UUID of the network' })
  @ApiResponse({
    status: 200,
    description: 'The container has been successfully connected to the network',
  })
  async connectContainer(
    @Req() req: CustomRequest,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    @Body('containerId') containerId: string,
    @Body('config') config?: any,
  ) {
    return this.networkService.connectContainer(
      req.user.id,
      connectionUuid,
      uuid,
      containerId,
      config,
    );
  }

  @Post(':uuid/disconnect')
  @ApiOperation({ summary: 'Disconnect a container from a network' })
  @ApiParam({ name: 'uuid', description: 'UUID of the network' })
  @ApiResponse({
    status: 200,
    description:
      'The container has been successfully disconnected from the network',
  })
  async disconnectContainer(
    @Req() req: CustomRequest,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    @Body('containerId') containerId: string,
    @Body('force') force?: boolean,
  ) {
    return this.networkService.disconnectContainer(
      req.user.id,
      connectionUuid,
      uuid,
      containerId,
      force,
    );
  }

  @Post('prune')
  @ApiOperation({ summary: 'Remove all unused networks' })
  @ApiResponse({
    status: 200,
    description: 'Unused networks have been successfully removed',
  })
  async pruneNetworks(
    @Req() req: CustomRequest,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
  ) {
    return this.networkService.pruneNetworks(req.user.id, connectionUuid);
  }
}
