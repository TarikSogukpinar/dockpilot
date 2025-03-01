import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { ResourceService } from './resource.service';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { ResourceMetricType } from '@prisma/client';

@Controller({ path: 'resource', version: '1' })
@ApiTags('Container Resources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Get('metrics/:containerUuid')
  @ApiOperation({ summary: 'Get container metrics' })
  @ApiParam({ name: 'containerUuid', description: 'UUID of the container' })
  @ApiResponse({
    status: 200,
    description: 'Returns container metrics for the specified time range',
  })
  async getMetrics(
    @Param('containerUuid', ParseUUIDPipe) containerUuid: string,
    @Query('type', new ParseEnumPipe(ResourceMetricType))
    type: ResourceMetricType,
    @Query('start') start: Date,
    @Query('end') end: Date,
  ) {
    return this.resourceService.getContainerMetrics(containerUuid, type, {
      start,
      end,
    });
  }

  @Post('limits/:containerUuid')
  @ApiOperation({ summary: 'Set resource limits for a container' })
  @ApiParam({ name: 'containerUuid', description: 'UUID of the container' })
  @ApiResponse({
    status: 200,
    description: 'Resource limits have been set',
  })
  async setLimits(
    @Param('containerUuid', ParseUUIDPipe) containerUuid: string,
    @Query('type', new ParseEnumPipe(ResourceMetricType))
    type: ResourceMetricType,
    @Body() limits: any,
  ) {
    return this.resourceService.setResourceLimit(containerUuid, type, limits);
  }

  @Get('alerts/:containerUuid')
  @ApiOperation({ summary: 'Get container resource alerts' })
  @ApiParam({ name: 'containerUuid', description: 'UUID of the container' })
  @ApiResponse({
    status: 200,
    description: 'Returns resource alerts for the container',
  })
  async getAlerts(
    @Param('containerUuid', ParseUUIDPipe) containerUuid: string,
    @Query('resolved') resolved?: boolean,
  ) {
    return this.resourceService.getContainerAlerts(containerUuid, resolved);
  }

  @Get('optimization/:containerUuid')
  @ApiOperation({ summary: 'Get optimization suggestions for a container' })
  @ApiParam({ name: 'containerUuid', description: 'UUID of the container' })
  @ApiResponse({
    status: 200,
    description: 'Returns optimization suggestions for the container',
  })
  async getOptimizations(
    @Param('containerUuid', ParseUUIDPipe) containerUuid: string,
    @Query('implemented') implemented?: boolean,
  ) {
    return this.resourceService.getOptimizationSuggestions(
      containerUuid,
      implemented,
    );
  }

  @Post('optimization/:suggestionUuid/implement')
  @ApiOperation({ summary: 'Implement an optimization suggestion' })
  @ApiParam({
    name: 'suggestionUuid',
    description: 'UUID of the optimization suggestion',
  })
  @ApiResponse({
    status: 200,
    description: 'The optimization suggestion has been implemented',
  })
  async implementOptimization(
    @Param('suggestionUuid', ParseUUIDPipe) suggestionUuid: string,
  ) {
    return this.resourceService.implementOptimizationSuggestion(suggestionUuid);
  }
}
