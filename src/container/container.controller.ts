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

    @Post(':connectionId/create')
    @UseGuards(JwtAuthGuard)
    async createContainer(
        @Req() customRequest:CustomRequest,
        @Param('connectionId') connectionId: number,
        @Body() options: any,
    ) {
        const userId = customRequest.user.id; // Kullanıcı ID'si Auth middleware'den alınır
        return this.containerService.createAndStartContainer(userId, connectionId, options);
    }

    @Get(':connectionId')
    @UseGuards(JwtAuthGuard)
    async listContainers(@Req() customRequest:CustomRequest, @Param('connectionId') connectionId: number) {
        const userId = customRequest.user.id;
        return this.containerService.listContainers(userId, connectionId);
    }
}