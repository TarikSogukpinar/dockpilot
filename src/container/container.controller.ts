import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ContainerService } from "./container.service";
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { CustomRequest } from "src/core/request/customRequest";
import { JwtAuthGuard } from "src/auth/guard/auth.guard";
import { ContainerRestartPolicy } from '@prisma/client';
import { CreateContainerDto } from "./dto/requests/createContanier.dto";
import { CreateContainerResponseDto } from "./dto/responses/createContainerResponse.dto";
import { SetupDockerDto } from "./dto/requests/setupDocker.dto";

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
        type: CreateContainerResponseDto
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Body() createContainerDto: CreateContainerDto,
    ): Promise<CreateContainerResponseDto> {
        const userId = customRequest.user.id;
        const result = await this.containerService.createAndStartContainer(setupDockerDto, createContainerDto);
        return result;
    }

    @Get(':connectionUuid')
    @UseGuards(JwtAuthGuard)
    async listContainers(@Req() customRequest: CustomRequest, @Param('connectionUuid') setupDockerDto: SetupDockerDto) {
        const userId = customRequest.user.id;
        return this.containerService.listContainers(setupDockerDto);
    }

    @Post(':containerId/:connectionUuid/stop')
    @UseGuards(JwtAuthGuard)
    async stopContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Param('containerId') containerId: string,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.stopContainer(setupDockerDto, containerId);
    }

    @Delete(':containerId/:connectionUuid/delete')
    @UseGuards(JwtAuthGuard)
    async removeContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Param('containerId') containerId: string
    ): Promise<string> {
        const userId = customRequest.user.id;
        return this.containerService.removeContainer(setupDockerDto, containerId);
    }

    @Get(':containerId/:connectionUuid/inspect')
    @UseGuards(JwtAuthGuard)
    async inspectContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Param('containerId') containerId: string,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.inspectContainer(setupDockerDto, containerId);
    }

    @Post(':containerId/:connectionUuid/restart')
    @UseGuards(JwtAuthGuard)
    async restartContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Param('containerId') containerId: string,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.restartContainer(setupDockerDto, containerId);
    }

    @Get(':containerId/:connectionUuid/logs')
    @UseGuards(JwtAuthGuard)
    async getContainerLogs(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Param('containerId') containerId: string,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.getContainerLogs(setupDockerDto, containerId);
    }

    @Post(':containerId/:connectionUuid/pause')
    @UseGuards(JwtAuthGuard)
    async pauseContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Param('containerId') containerId: string,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.pauseContainer(setupDockerDto, containerId);
    }

    @Post(':containerId/:connectionUuid/unpause')
    @UseGuards(JwtAuthGuard)
    async unpauseContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Param('containerId') containerId: string,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.unpauseContainer(setupDockerDto, containerId);
    }

    //TODO: REFACTOR THIS & CHECK THIS
    @Post(':connectionUuid/prune')
    @UseGuards(JwtAuthGuard)
    async pruneContainers(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.pruneContainers(setupDockerDto);
    }

    @Get(':containerId/:connectionUuid/stats')
    @UseGuards(JwtAuthGuard)
    async getContainerStats(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') setupDockerDto: SetupDockerDto,
        @Param('containerId') containerId: string,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.getContainerStats(setupDockerDto, containerId);
    }

    @Post(':containerUuid/health-check')
    @ApiOperation({ summary: 'Configure container health check' })
    @ApiParam({ name: 'containerUuid', description: 'Container UUID' })
    async configureHealthCheck(
        @Req() req: any,
        @Param('containerUuid') setupDockerDto: SetupDockerDto,
        @Body() config: {
            test: string[];
            interval: number;
            timeout: number;
            retries: number;
            startPeriod: number;
        }
    ) {
        return this.containerService.configureHealthCheck(
            req.user.id,
            req.headers.connectionuuid,
            setupDockerDto.connectionUuid,
            config,
        );
    }

    // @Get(':containerUuid/health')
    // @ApiOperation({ summary: 'Get container health status' })
    // @ApiParam({ name: 'containerUuid', description: 'Container UUID' })
    // async getContainerHealth(
    //     @Req() req: any,
    //     @Param('containerUuid') setupDockerDto: SetupDockerDto
    // ) {
    //     return this.containerService.updateContainerHealth(
    //         req.user.id,
    //         req.headers.connectionuuid,
    //         setupDockerDto.connectionUuid
    //     );
    // }

    // @Post(':containerUuid/restart-policy')
    // @ApiOperation({ summary: 'Update container restart policy' })
    // @ApiParam({ name: 'containerUuid', description: 'Container UUID' })
    // async updateRestartPolicy(
    //     @Req() req: any,
    //     @Param('containerUuid') containerUuid: string,
    //     @Body('policy') policy: ContainerRestartPolicy
    // ) {
    //     return this.containerService.updateContainerRestartPolicy(
    //         req.user.id,
    //         req.headers.connectionuuid,
    //         containerUuid,
    //         policy
    //     );
    // }

    @Get(':containerUuid/events')
    @ApiOperation({ summary: 'Get container events' })
    @ApiParam({ name: 'containerUuid', description: 'Container UUID' })
    async getContainerEvents(
        @Req() req: any,
        @Param('containerUuid') containerUuid: string,
        @Query('limit') limit?: number
    ) {
        return this.containerService.getContainerEvents(
            req.user.id,
            req.headers.connectionuuid,
            containerUuid,
            limit
        );
    }

    // @Get(':containerUuid/logs')
    // @ApiOperation({ summary: 'Get container logs with filtering options' })
    // @ApiParam({ name: 'containerUuid', description: 'Container UUID' })
    // async getFilteredContainerLogs(
    //     @Req() req: any,
    //     @Param('containerUuid') containerUuid: string,
    //     @Query('since') since?: Date,
    //     @Query('until') until?: Date,
    //     @Query('limit') limit?: number,
    //     @Query('stream') stream?: string
    // ) {
    //     return this.containerService.getContainerLogs(
    //         req.user.id,
    //         req.headers.connectionuuid,
    //         containerUuid,
    //         { since, until, limit, stream }
    //     );
    // }
}