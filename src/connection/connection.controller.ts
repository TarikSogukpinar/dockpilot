import { Controller, Post, Get, Put, Delete, Body, Param, Req } from '@nestjs/common';
import { ConnectionService } from './connection.service';

@Controller({ path: 'connection', version: '1' })
export class ConnectionController {
    constructor(private readonly connectionService: ConnectionService) { }

    @Post()
    async createConnection(@Req() req, @Body() body: { host: string; port: number; tlsConfig?: any }) {
        const userId = req.user.id; // Kullanıcı ID'si Auth middleware'den alınır
        const { host, port, tlsConfig } = body;

        return this.connectionService.createConnection(userId, host, port, tlsConfig);
    }

    @Get()
    async getConnections(@Req() req) {
        const userId = req.user.id; // Kullanıcı ID'si
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
