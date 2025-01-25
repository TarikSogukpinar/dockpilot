import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ComposeService } from './compose.service';
import { CreateComposeDto } from './dto/create-compose.dto';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { CustomRequest } from '../core/request/customRequest';

@Controller({ path: 'compose', version: '1' })
@ApiTags('Docker Compose')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ComposeController {
    constructor(private readonly composeService: ComposeService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new compose deployment' })
    @ApiResponse({
        status: 201,
        description: 'The compose deployment has been successfully created',
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('composeFile'))
    async createDeployment(
        @Req() req: CustomRequest,
        @Body() createComposeDto: CreateComposeDto,
        @UploadedFile(new ParseFilePipe({
            validators: [
                new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1MB
                new FileTypeValidator({ fileType: '.(yml|yaml)$' }),
            ],
            fileIsRequired: false,
        })) file?: Express.Multer.File
    ) {
        if (file) {
            createComposeDto.composeContent = file.buffer.toString();
        } else if (!createComposeDto.composeContent) {
            throw new Error('Either composeFile or composeContent must be provided');
        }

        return this.composeService.createDeployment(req.user.id, createComposeDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all compose deployments' })
    @ApiResponse({
        status: 200,
        description: 'Returns a list of all compose deployments',
    })
    async listDeployments(@Req() req: CustomRequest) {
        return this.composeService.listDeployments(req.user.id);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific compose deployment' })
    @ApiResponse({
        status: 200,
        description: 'Returns the specified compose deployment',
    })
    async getDeployment(
        @Req() req: CustomRequest,
        @Param('id') id: string,
    ) {
        return this.composeService.getDeployment(req.user.id, +id);
    }

    @Post(':id/stop')
    @ApiOperation({ summary: 'Stop a compose deployment' })
    @ApiResponse({
        status: 200,
        description: 'The compose deployment has been stopped',
    })
    async stopDeployment(
        @Req() req: CustomRequest,
        @Param('id') id: string,
    ) {
        return this.composeService.stopDeployment(req.user.id, +id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a compose deployment' })
    @ApiResponse({
        status: 200,
        description: 'The compose deployment has been deleted',
    })
    async deleteDeployment(
        @Req() req: CustomRequest,
        @Param('id') id: string,
    ) {
        return this.composeService.deleteDeployment(req.user.id, +id);
    }
} 