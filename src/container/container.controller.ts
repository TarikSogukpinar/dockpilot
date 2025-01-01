import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ContainerService } from "./container.service";
import { ContainerCreateOptions } from 'dockerode';
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller({ path: 'container', version: '1' })
@ApiTags('Container')
@ApiBearerAuth()
export class ContainerController {
    constructor(private readonly containerService: ContainerService) { }

    @Post('create')
    async createContainer(@Body() options: ContainerCreateOptions) {
        return this.containerService.createAndStartContainer(options);
    }

    @Get("list")
    async listContainers() {
        return this.containerService.listContainers();
    }
}