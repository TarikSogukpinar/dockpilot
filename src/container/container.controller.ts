import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ContainerService } from './container.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CustomRequest } from 'src/core/request/customRequest';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CreateContainerDto } from './dto/requests/createContanier.dto';
import { CreateContainerResponseDto } from './dto/responses/createContainerResponse.dto';
import { SetupDockerDto } from './dto/requests/setupDocker.dto';
import { InvalidCredentialsException } from 'src/core/handler/exceptions/custom-exception';

@Controller({ path: 'container', version: '1' })
@ApiTags('Container')
@ApiBearerAuth()
export class ContainerController {
  constructor(private readonly containerService: ContainerService) { }

  @Post(':connectionUuid/create')
  @ApiOperation({ summary: 'Create a new container' })
  @ApiResponse({
    status: 200,
    description: 'Container created successfully',
    type: CreateContainerResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createContainer(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Body() createContainerDto: CreateContainerDto,
  ) {
    const userId = customRequest.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.createAndStartContainer(
      setupDockerDto,
      createContainerDto,
    );

    return { result, message: 'Container created successfully' };
  }

  @Get(':connectionUuid')
  @ApiOperation({ summary: 'List all containers' })
  @ApiResponse({
    status: 200,
    description: 'Containers listed successfully',
  })
  @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async listContainers(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
  ) {
    const userId = customRequest.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.listContainers(setupDockerDto);

    return { result, message: 'Containers listed successfully' };
  }

  @Post(':containerId/:connectionUuid/stop')
  @ApiOperation({ summary: 'Stop a container' })
  @ApiResponse({
    status: 200,
    description: 'Container stopped successfully',
  })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async stopContainer(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Param('containerId') containerId: string,
  ) {
    const userId = customRequest.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.stopContainer(
      setupDockerDto,
      containerId,
    );

    return { result, message: 'Container stopped successfully' };
  }

  @Delete(':containerId/:connectionUuid/delete')
  @ApiOperation({ summary: 'Delete a container' })
  @ApiResponse({
    status: 200,
    description: 'Container deleted successfully',
  })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeContainer(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Param('containerId') containerId: string,
  ) {
    const userId = customRequest.user.id;
    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.removeContainer(
      setupDockerDto,
      containerId,
    );

    return { result, message: 'Container deleted successfully' };
  }

  @Get(':containerId/:connectionUuid/inspect')
  @ApiOperation({ summary: 'Inspect a container' })
  @ApiResponse({
    status: 200,
    description: 'Container inspected successfully',
  })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async inspectContainer(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Param('containerId') containerId: string,
  ) {

    const userId = customRequest.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.inspectContainer(
      setupDockerDto,
      containerId,
    );

    return { result, message: 'Container inspected successfully' };
  }

  @Post(':containerId/:connectionUuid/restart')
  @ApiOperation({ summary: 'Restart a container' })
  @ApiResponse({
    status: 200,
    description: 'Container restarted successfully',
  })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
  @UseGuards(JwtAuthGuard)
  async restartContainer(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Param('containerId') containerId: string,
  ) {
    const userId = customRequest.user.id;
    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.restartContainer(setupDockerDto, containerId);

    return { result, message: 'Container restarted successfully' }
  }

  @Get(':containerId/:connectionUuid/logs')
  @ApiOperation({ summary: 'Get container logs' })
  @ApiResponse({
    status: 200,
    description: 'Container logs retrieved successfully',
  })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getContainerLogs(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Param('containerId') containerId: string,
  ) {
    const userId = customRequest.user.id;
    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.getContainerLogs(setupDockerDto, containerId);

    return { result, message: 'Container logs retrieved successfully' }
  }

  @Post(':containerId/:connectionUuid/pause')
  @ApiOperation({ summary: 'Pause a container' })
  @ApiResponse({
    status: 200,
    description: 'Container paused successfully',
  })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async pauseContainer(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Param('containerId') containerId: string,
  ) {
    const userId = customRequest.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.pauseContainer(setupDockerDto, containerId);

    return { result, message: "Container paused successfully" }
  }

  @Post(':containerId/:connectionUuid/unpause')
  @ApiOperation({ summary: 'Unpause a container' })
  @ApiResponse({
    status: 200,
    description: 'Container unpaused successfully',
  })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async unpauseContainer(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Param('containerId') containerId: string,
  ) {
    const userId = customRequest.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.unpauseContainer(setupDockerDto, containerId);

    return { result, message: "Container unpaused successfully" }
  }


  @Post(':connectionUuid/prune')
  @ApiOperation({ summary: 'Prune containers' })
  @ApiResponse({
    status: 200,
    description: 'Containers pruned successfully',
  })
  @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async pruneContainers(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
  ) {
    const userId = customRequest.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.pruneContainers(setupDockerDto);

    return { result, message: "Containers pruned successfully" }
  }

  @Get(':containerId/:connectionUuid/stats')
  @ApiOperation({ summary: 'Get container stats' })
  @ApiResponse({
    status: 200,
    description: 'Container stats retrieved successfully',
  })
  @ApiParam({ name: 'containerId', description: 'Container ID' })
  @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getContainerStats(
    @Req() customRequest: CustomRequest,
    @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    @Param('containerId') containerId: string,
  ) {
    const userId = customRequest.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.getContainerStats(setupDockerDto, containerId);

    return { result, message: "Container stats retrieved successfully" }
  }


  @Post(':containerUuid/health-check')
  @ApiOperation({ summary: 'Configure container health check' })
  @ApiResponse({
    status: 200,
    description: 'Container health check configured successfully',
  })
  @ApiParam({ name: 'containerUuid', description: 'Container UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async configureHealthCheck(
    @Req() req: any,
    @Param('containerUuid') setupDockerDto: SetupDockerDto,
    @Body()
    config: {
      test: string[];
      interval: number;
      timeout: number;
      retries: number;
      startPeriod: number;
    },
  ) {
    const result = await this.containerService.configureHealthCheck(req.user.id,
      req.headers.connectionuuid,
      setupDockerDto.connectionUuid,
      config)

    return { result, message: "Container health check configured successfully" }
  }

  @Get(':containerUuid/events')
  @ApiOperation({ summary: 'Get container events' })
  @ApiResponse({
    status: 200,
    description: 'Container events retrieved successfully',
  })
  @ApiParam({ name: 'containerUuid', description: 'Container UUID' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getContainerEvents(
    @Req() req: any,
    @Param('containerUuid') containerUuid: string,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.containerService.getContainerEvents(userId, req.headers.connectionuuid, containerUuid, limit);

    return { result, message: "Container events retrieved successfully" }
  }



}

