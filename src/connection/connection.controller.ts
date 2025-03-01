import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CustomRequest } from 'src/core/request/customRequest';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateConnectionDto } from './dto/requests/createConnection.dto';
import { InvalidCredentialsException } from 'src/core/handler/exceptions/custom-exception';
import { UpdateConnectionDto } from './dto/requests/updateConnection.dto';
import { DeleteConnectionDto } from './dto/requests/deleteConnection.dto';
@Controller({ path: 'connection', version: '1' })
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('createConnection')
  @ApiOperation({ summary: 'Create a new connection' })
  @ApiResponse({ status: 201, description: 'Connection successfully created' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createConnection(
    @Req() customRequest: CustomRequest,
    @Body() createConnectionDto: CreateConnectionDto,
  ) {
    const userId = customRequest.user?.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.connectionService.createConnection(
      userId,
      createConnectionDto,
    );

    return { result, message: 'Connection created successfully' };
  }

  @Get('getConnections')
  @ApiOperation({ summary: 'Get all connections' })
  @ApiResponse({
    status: 200,
    description: 'Connections successfully retrieved',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getConnections(@Req() customRequest: CustomRequest) {
    const userId = customRequest.user?.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.connectionService.getConnections(userId);

    return { result, message: 'Connections retrieved successfully' };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a connection' })
  @ApiResponse({ status: 200, description: 'Connection successfully updated' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateConnection(
    @Req() req,
    @Body() updateConnectionDto: UpdateConnectionDto,
  ) {
    const userId = req.user.id;

    if (!userId) throw new InvalidCredentialsException();

    const result = await this.connectionService.updateConnection(
      userId,
      updateConnectionDto,
    );

    return { result, message: 'Connection updated successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a connection' })
  @ApiResponse({ status: 200, description: 'Connection successfully deleted' })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteConnection(
    @Req() req,
    @Param() deleteConnectionDto: DeleteConnectionDto,
  ) {
    const userId = req.user.id;
    return this.connectionService.deleteConnection(userId, deleteConnectionDto);
  }
}
