import { Controller, Post, Get, Put, Delete, Body, Param, Req, UseGuards, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CustomRequest } from 'src/core/request/customRequest';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateConnectionDto } from './dto/requests/createConnection.dto';
import { InvalidCredentialsException } from 'src/core/handler/exceptions/custom-exception';
@Controller({ path: 'connection', version: '1' })
export class ConnectionController {
    constructor(private readonly connectionService: ConnectionService) { }

    @Post("createConnection")
    @ApiOperation({ summary: 'Create a new connection' })
    @ApiResponse({ status: 201, description: 'Connection successfully created' })
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async createConnection(
        @Req() customRequest: CustomRequest,
        @Body() createConnectionDto: CreateConnectionDto,
    ) {
        const userId = customRequest.user?.id;

        if (!customRequest.user) throw new InvalidCredentialsException();

        const result = await this.connectionService.createConnection(userId, createConnectionDto);

        return { result, message: "Connection created successfully" };
    }

    @Get("getConnections")
    @UseGuards(JwtAuthGuard) // Tüm uç noktalar için geçerli
    async getConnections(@Req() customRequest: CustomRequest) {
        const userId = customRequest.user?.id; // Kullanıcı ID'si
        return this.connectionService.getConnections(userId);
    }

    @Put(':id')
    async updateConnection(
        @Req() req,
        @Param('id') id: number,
        @Body() body: { host?: string; port?: number; tlsConfig?: any },
    ) {
        const userId = req.user.id; // Kullanıcı ID'si
        return this.connectionService.updateConnection(id, userId, body);
    }

    @Delete(':id')
    async deleteConnection(@Req() req, @Param('id') id: number) {
        const userId = req.user.id; // Kullanıcı ID'si
        return this.connectionService.deleteConnection(id, userId);
    }
}
