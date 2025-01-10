import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ContainerService } from "./container.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CustomRequest } from "src/core/request/customRequest";
import { AuthGuard } from "@nestjs/passport";
import { JwtAuthGuard } from "src/auth/guard/auth.guard";

@Controller({ path: 'container', version: '1' })
@ApiTags('Container')
@ApiBearerAuth()
export class ContainerController {
    constructor(private readonly containerService: ContainerService) { }

    @Post(':connectionUuid/create')
    @UseGuards(JwtAuthGuard)
    async createContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') connectionUuid: string,
        @Body() options: any,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.createAndStartContainer(userId, connectionUuid, options);
    }

    @Get(':connectionUuid')
    @UseGuards(JwtAuthGuard)
    async listContainers(@Req() customRequest: CustomRequest, @Param('connectionUuid') connectionUuid: string) {
        const userId = customRequest.user.id;
        return this.containerService.listContainers(userId, connectionUuid);
    }

    @Post(':connectionUuid/:containerId/stop')
    @UseGuards(JwtAuthGuard)
    async stopContainer(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') connectionUuid: string,
        @Param('containerId') containerId: string,
    ) {
        const userId = customRequest.user.id;
        return this.containerService.stopContainer(userId, connectionUuid, containerId);
    }
}