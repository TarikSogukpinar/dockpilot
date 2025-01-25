import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';

@Injectable()
export class ConnectionService {
    constructor(private readonly prisma: PrismaService) { }

    async createConnection(userId: number, host: string, port: number, tlsConfig?: any) {
        return this.prisma.connection.create({
            data: {
                host,
                port,
                tlsConfig,
                userId,
                name: `Connection-${Date.now()}`
            },
        });
    }

    async getConnections(userId: number) {
        return this.prisma.connection.findMany({
            where: { userId },
        });
    }

    async getConnectionById(connectionUuid: string, userId: number) {
        if (!connectionUuid) {
            throw new Error('Connection ID is required');
        }

        const connection = await this.prisma.connection.findFirst({
            where: { 
                uuid: connectionUuid,
                userId 
            },
        });

        if (!connection) {
            throw new NotFoundException('Connection not found or you do not have access.');
        }

        return connection;
    }

    async updateConnection(id: number, userId: number, data: { host?: string; port?: number; tlsConfig?: any }) {
        const connection = await this.prisma.connection.findFirst({
            where: { 
                id,
                userId 
            },
        });

        if (!connection) {
            throw new NotFoundException('Connection not found or you do not have access.');
        }

        return this.prisma.connection.update({
            where: { id },
            data,
        });
    }

    async deleteConnection(id: number, userId: number) {
        const connection = await this.prisma.connection.findFirst({
            where: { 
                id,
                userId 
            },
        });

        if (!connection) {
            throw new NotFoundException('Connection not found or you do not have access.');
        }

        return this.prisma.connection.delete({
            where: { id },
        });
    }

    async findById(id: number) {
        const connection = await this.prisma.connection.findUnique({
            where: { id },
        });

        if (!connection) {
            throw new NotFoundException('Connection not found');
        }

        return connection;
    }

    async getConnectionByUuid(uuid: string, userId: number) {
        const connection = await this.prisma.connection.findFirst({
            where: {
                uuid,
                userId
            }
        });

        if (!connection) {
            throw new NotFoundException('Connection not found or access denied');
        }

        return connection;
    }
}
