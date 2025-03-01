import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { CreateConnectionDto } from './dto/requests/createConnection.dto';
import { CreateConnectionResponseDto } from './dto/responses/createConnectionResponse.dto';
import { GetConnectionsDto } from './dto/requests/getConnection.dto';
import { GetConnectionsResponseDto } from './dto/responses/getConnectionResponse.dto';
import { GetConnectionByIdDto } from './dto/requests/getConnectionById.dto';
import { GetConnectionByIdResponseDto } from './dto/responses/getConnectionByIdResponse.dto';
import {
  ConnectionIdIsRequiredException,
  ConnectionNotFoundException,
} from 'src/core/handler/exceptions/custom-exception';
import { UpdateConnectionDto } from './dto/requests/updateConnection.dto';
import { UpdateConnectionResponseDto } from './dto/responses/updateConnectionResponse.dto';
import { DeleteConnectionDto } from './dto/requests/deleteConnection.dto';
import { DeleteConnectionResponseDto } from './dto/responses/deleteConnectionResponse.dto';
import { FindConnectionByIdRequestDto } from './dto/requests/findConnectionById.dto';
import { FindConnectionResponseDto } from './dto/responses/findConnectionResponse.dto';

@Injectable()
export class ConnectionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createConnection(
    userId: number,
    createConnectionDto: CreateConnectionDto,
  ): Promise<CreateConnectionResponseDto> {
    try {
      const createdConnection = await this.prismaService.connection.create({
        data: {
          host: createConnectionDto.host,
          port: createConnectionDto.port,
          tlsConfig: createConnectionDto.tlsConfig,
          userId: userId,
          name: `Connection-${Date.now()}`,
        },
      });

      return createdConnection;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating connection',
      );
    }
  }

  async getConnections(userId: number): Promise<GetConnectionsResponseDto> {
    try {
      const getConnections = await this.prismaService.connection.findMany({
        where: { userId },
      });

      return getConnections;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while getting connections',
      );
    }
  }

  async getConnectionById(
    userId: number,
    uuid: string,
  ): Promise<GetConnectionByIdResponseDto> {
    try {
      if (!uuid) throw new ConnectionIdIsRequiredException();

      const getConnectionById = await this.prismaService.connection.findFirst({
        where: {
          uuid: uuid,
          userId,
        },
      });

      if (!getConnectionById) throw new ConnectionNotFoundException();

      return getConnectionById;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while getting connection by id',
      );
    }
  }

  async updateConnection(
    userId: number,
    updateConnectionDto: UpdateConnectionDto,
  ): Promise<UpdateConnectionResponseDto> {
    try {
      const updateConnection = await this.prismaService.connection.findFirst({
        where: {
          id: updateConnectionDto.id,
          userId,
        },
      });

      if (!updateConnection) throw new ConnectionNotFoundException();

      const updatedConnection = await this.prismaService.connection.update({
        where: { id: updateConnectionDto.id },
        data: {
          host: updateConnectionDto.host,
          port: updateConnectionDto.port,
          tlsConfig: updateConnectionDto.tlsConfig,
          name: updateConnectionDto.name,
        },
      });

      return updatedConnection;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while updating connection',
      );
    }
  }

  async deleteConnection(
    userId: number,
    deleteConnectionDto: DeleteConnectionDto,
  ): Promise<DeleteConnectionResponseDto> {
    try {
      const findConnectionById = await this.prismaService.connection.findFirst({
        where: {
          id: deleteConnectionDto.id,
          userId,
        },
      });

      if (!findConnectionById) throw new ConnectionNotFoundException();

      const deletedConnection = await this.prismaService.connection.delete({
        where: { id: deleteConnectionDto.id },
      });

      return deletedConnection;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting connection',
      );
    }
  }

  async findById(
    findConnectionByIdRequestDto: FindConnectionByIdRequestDto,
  ): Promise<FindConnectionResponseDto> {
    try {
      const findConnectionById = await this.prismaService.connection.findUnique(
        {
          where: { id: findConnectionByIdRequestDto.id },
        },
      );

      if (!findConnectionById) throw new ConnectionNotFoundException();

      return findConnectionById;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while finding connection by id',
      );
    }
  }

  async getConnectionByUuid(uuid: string, userId: number): Promise<any> {
    try {
      const connection = await this.prismaService.connection.findFirst({
        where: {
          uuid,
          userId,
        },
      });

      if (!connection) {
        throw new NotFoundException('Connection not found or access denied');
      }

      return connection;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while getting connection by uuid',
      );
    }
  }
}
