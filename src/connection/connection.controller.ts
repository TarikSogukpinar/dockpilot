import { Controller, Post, Get, Put, Delete, Body, Param, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CustomRequest } from 'src/core/request/customRequest';

@Controller({ path: 'connection', version: '1' })
export class ConnectionController {
    constructor(private readonly connectionService: ConnectionService) { }

    @Post("createConnection")
    @UseGuards(JwtAuthGuard) // Tüm uç noktalar için geçerli
    async createConnection(
        @Req() customRequest: CustomRequest,
        @Body() body: { host: string; port: number; tlsConfig?: any },
    ) {
        console.log(customRequest, "customRequest");
        if (!customRequest.user) {
            throw new UnauthorizedException('User not authenticated');
        }

        const userId = customRequest.user?.id; // Kullanıcı bilgisi
        console.log('Authenticated User ID:', userId);

        return this.connectionService.createConnection(userId, body.host, body.port, body.tlsConfig);
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
