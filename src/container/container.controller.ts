import { Body, Controller, Get, Param, Post, Query, Req } from "@nestjs/common";
import { ContainerService } from "./container.service";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller({ path: 'container', version: '1' })
@ApiTags('Container')
@ApiBearerAuth()
export class ContainerController {
    constructor(private readonly containerService: ContainerService) { }

    @Post(':connectionId/create')
    async createContainer(
        @Req() req,
        @Param('connectionId') connectionId: number,
        @Body() options: any,
    ) {
        const userId = req.user.id; // Kullanıcı ID'si Auth middleware'den alınır
        return this.containerService.createAndStartContainer(userId, connectionId, options);
    }

    @Get(':connectionId')
    async listContainers(@Req() req, @Param('connectionId') connectionId: number) {
        const userId = req.user.id;
        return this.containerService.listContainers(userId, connectionId);
    }
}