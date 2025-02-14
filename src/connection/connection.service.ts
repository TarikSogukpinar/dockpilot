import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { CreateConnectionDto } from './dto/requests/createConnection.dto';
import { CreateConnectionResponseDto } from './dto/responses/createConnectionResponse.dto';

@Injectable()
export class ConnectionService {
    constructor(private readonly prismaService: PrismaService) { }

    async createConnection(userId: number, createConnectionDto: CreateConnectionDto): Promise<CreateConnectionResponseDto> {
        try {
            const createdConnection = await this.prismaService.connection.create({
                data: {
                    host: createConnectionDto.host,
                    port: createConnectionDto.port,
                    tlsConfig: createConnectionDto.tlsConfig,
                    userId: userId,
                    name: `Connection-${Date.now()}`
                },
            });

            return createdConnection;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("An unexpected error occurred while creating ticket");
        }

    }

    async getConnections(userId: number): Promise<any> {
        try {
            return this.prismaService.connection.findMany({
                where: { userId },
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("An unexpected error occurred while creating ticket");
        }

    }

    async getConnectionById(connectionUuid: string, userId: number): Promise<any> {
        try {
            if (!connectionUuid) {
                throw new Error('Connection ID is required');
            }

            const connection = await this.prismaService.connection.findFirst({
                where: {
                    uuid: connectionUuid,
                    userId
                },
            });

            if (!connection) {
                throw new NotFoundException('Connection not found or you do not have access.');
            }

            return connection;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("An unexpected error occurred while creating ticket");
        }

    }

    async updateConnection(id: number, userId: number, data: { host?: string; port?: number; tlsConfig?: any }): Promise<any> {
        try {
            const connection = await this.prismaService.connection.findFirst({
                where: {
                    id,
                    userId
                },
            });

            if (!connection) {
                throw new NotFoundException('Connection not found or you do not have access.');
            }

            return this.prismaService.connection.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("An unexpected error occurred while creating ticket");
        }

    }

    async deleteConnection(id: number, userId: number): Promise<any> {
        try {
            const connection = await this.prismaService.connection.findFirst({
                where: {
                    id,
                    userId
                },
            });

            if (!connection) {
                throw new NotFoundException('Connection not found or you do not have access.');
            }

            return this.prismaService.connection.delete({
                where: { id },
            });

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("An unexpected error occurred while creating ticket");
        }
    }

    async findById(id: number): Promise<any> {
        try {
            const connection = await this.prismaService.connection.findUnique({
                where: { id },
            });

            if (!connection) {
                throw new NotFoundException('Connection not found');
            }

            return connection;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("An unexpected error occurred while creating ticket");
        }

    }

    async getConnectionByUuid(uuid: string, userId: number): Promise<any> {
        try {
            const connection = await this.prismaService.connection.findFirst({
                where: {
                    uuid,
                    userId
                }
            });

            if (!connection) {
                throw new NotFoundException('Connection not found or access denied');
            }

            return connection;

        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("An unexpected error occurred while creating ticket");
        }
    }
}
