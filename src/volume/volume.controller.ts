import {
  Controller,
  Get,
  Req,
  Post,
  Body,
  Param,
  Query,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { VolumeService } from './volume.service';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { CustomRequest } from '../core/request/customRequest';

@Controller({ path: 'volume', version: '1' })
@ApiTags('Docker Volumes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class VolumeController {
  constructor(private readonly volumeService: VolumeService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new Docker volume' })
  @ApiResponse({
    status: 201,
    description: 'The volume has been successfully created',
  })
  async createVolume(
    @Req() req: CustomRequest,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    @Body() volumeConfig: any,
  ) {
    return this.volumeService.createVolume(
      req.user.id,
      connectionUuid,
      volumeConfig,
    );
  }

  @Get('list')
  @ApiOperation({ summary: 'List all Docker volumes' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all Docker volumes',
  })
  async listVolumes(
    @Req() req: CustomRequest,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
  ) {
    return this.volumeService.listVolumes(req.user.id, connectionUuid);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get volume details' })
  @ApiParam({ name: 'uuid', description: 'UUID of the volume' })
  @ApiResponse({
    status: 200,
    description: 'Returns the volume details',
  })
  async getVolume(
    @Req() req: CustomRequest,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
  ) {
    return this.volumeService.getVolume(req.user.id, connectionUuid, uuid);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Remove a Docker volume' })
  @ApiParam({ name: 'uuid', description: 'UUID of the volume to remove' })
  @ApiResponse({
    status: 200,
    description: 'The volume has been successfully removed',
  })
  async removeVolume(
    @Req() req: CustomRequest,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    @Query('force') force?: boolean,
  ) {
    return this.volumeService.removeVolume(
      req.user.id,
      connectionUuid,
      uuid,
      force,
    );
  }

  @Post('prune')
  @ApiOperation({ summary: 'Remove all unused volumes' })
  @ApiResponse({
    status: 200,
    description: 'Unused volumes have been successfully removed',
  })
  async pruneVolumes(
    @Req() req: CustomRequest,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
  ) {
    return this.volumeService.pruneVolumes(req.user.id, connectionUuid);
  }

  @Post(':uuid/backup')
  @ApiOperation({ summary: 'Create a backup of a volume' })
  @ApiParam({ name: 'uuid', description: 'UUID of the volume to backup' })
  @ApiResponse({
    status: 200,
    description: 'The volume backup has been created successfully',
  })
  async createBackup(
    @Req() req: CustomRequest,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    @Body() backupConfig: any,
  ) {
    return this.volumeService.createBackup(
      req.user.id,
      connectionUuid,
      uuid,
      backupConfig,
    );
  }

  @Post(':uuid/snapshot')
  @ApiOperation({ summary: 'Create a snapshot of a volume' })
  @ApiParam({ name: 'uuid', description: 'UUID of the volume to snapshot' })
  @ApiResponse({
    status: 200,
    description: 'The volume snapshot has been created successfully',
  })
  async createSnapshot(
    @Req() req: CustomRequest,
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    @Body() snapshotConfig: any,
  ) {
    return this.volumeService.createSnapshot(
      req.user.id,
      connectionUuid,
      uuid,
      snapshotConfig,
    );
  }
}
