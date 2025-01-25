import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { CreateImageDto } from './dto/create-image.dto';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { CustomRequest } from '../core/request/customRequest';

@Controller({ path: 'image', version: '1' })
@ApiTags('Docker Images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ImageController {
    constructor(private readonly imageService: ImageService) { }

    @Post('pull')
    @ApiOperation({ summary: 'Pull a Docker image' })
    @ApiResponse({
        status: 201,
        description: 'The image has been successfully pulled',
    })
    async pullImage(
        @Req() req: CustomRequest,
        @Body() createImageDto: CreateImageDto,
    ) {
        return this.imageService.pullImage(req.user.id, createImageDto);
    }

    @Get('list')
    @ApiOperation({ summary: 'List all Docker images' })
    @ApiResponse({
        status: 200,
        description: 'Returns a list of all Docker images',
    })
    async listImages(
        @Req() req: CustomRequest,
        @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    ) {
        return this.imageService.listImages(req.user.id, connectionUuid);
    }

    @Get(':uuid')
    @ApiOperation({ summary: 'Get image details' })
    @ApiParam({ name: 'uuid', description: 'UUID of the image' })
    @ApiResponse({
        status: 200,
        description: 'Returns the image details',
    })
    async getImage(
        @Req() req: CustomRequest,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
    ) {
        return this.imageService.getImage(req.user.id, connectionUuid, uuid);
    }

    @Delete(':uuid')
    @ApiOperation({ summary: 'Remove a Docker image' })
    @ApiParam({ name: 'uuid', description: 'UUID of the image to remove' })
    @ApiResponse({
        status: 200,
        description: 'The image has been successfully removed',
    })
    async removeImage(
        @Req() req: CustomRequest,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
        @Query('force') force?: boolean,
    ) {
        return this.imageService.removeImage(req.user.id, connectionUuid, uuid, force);
    }

    @Post(':uuid/tag')
    @ApiOperation({ summary: 'Tag a Docker image' })
    @ApiParam({ name: 'uuid', description: 'UUID of the image to tag' })
    @ApiResponse({
        status: 200,
        description: 'The image has been successfully tagged',
    })
    async tagImage(
        @Req() req: CustomRequest,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
        @Body('repo') repo: string,
        @Body('tag') tag: string,
    ) {
        return this.imageService.tagImage(req.user.id, connectionUuid, uuid, repo, tag);
    }

    @Post(':uuid/push')
    @ApiOperation({ summary: 'Push a Docker image to registry' })
    @ApiParam({ name: 'uuid', description: 'UUID of the image to push' })
    @ApiResponse({
        status: 200,
        description: 'The image has been successfully pushed',
    })
    async pushImage(
        @Req() req: CustomRequest,
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Query('connectionUuid', ParseUUIDPipe) connectionUuid: string,
        @Body('registry') registry: string,
        @Body('username') username?: string,
        @Body('password') password?: string,
    ) {
        return this.imageService.pushImage(req.user.id, connectionUuid, uuid, registry, username, password);
    }
}
