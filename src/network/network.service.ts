import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { ConnectionService } from '../connection/connection.service';
import { ConnectionChecker } from '../connection/connection.checker';
import { DockerSetupResponse } from '../connection/connection.interface';
import Dockerode from 'dockerode';
import { randomUUID } from 'crypto';

@Injectable()
export class NetworkService {
  private currentConnection: any = null;
  private docker: Dockerode;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly connectionService: ConnectionService,
    private readonly connectionChecker: ConnectionChecker,
  ) {}

  private initializeDocker(connection: any) {
    this.docker = new Dockerode({
      host: connection.host,
      port: connection.port,
      ...(connection.tlsConfig && {
        ca: connection.tlsConfig['ca'],
        cert: connection.tlsConfig['cert'],
        key: connection.tlsConfig['key'],
      }),
    });
  }

  private async setupDocker(
    userId: number,
    connectionUuid: string,
  ): Promise<DockerSetupResponse> {
    try {
      const connection = await this.connectionService.getConnectionByUuid(
        connectionUuid,
        userId,
      );
      const connectionStatus =
        await this.connectionChecker.checkConnection(connection);

      if (!connectionStatus.isConnected) {
        return {
          isConnected: false,
          connection,
          error: `Docker connection failed: ${connectionStatus.error}`,
        };
      }

      if (
        !this.currentConnection ||
        this.currentConnection.uuid !== connection.uuid
      ) {
        this.initializeDocker(connection);
        this.currentConnection = connection;
      }

      return {
        isConnected: true,
        connection,
        dockerInfo: await this.docker.info(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Connection not found or access denied');
      }
      throw new ServiceUnavailableException(
        `Failed to setup Docker connection: ${error.message}`,
      );
    }
  }

  async createNetwork(
    userId: number,
    connectionUuid: string,
    networkConfig: any,
  ) {
    const dockerSetup = await this.setupDocker(userId, connectionUuid);
    if (!dockerSetup.isConnected) {
      throw new ServiceUnavailableException(dockerSetup.error);
    }

    try {
      const network = await this.docker.createNetwork(networkConfig);
      const networkInfo = await network.inspect();

      // Save network in database
      const dbNetwork = await this.prismaService.network.create({
        data: {
          uuid: randomUUID(),
          name: networkConfig.Name,
          driver: networkConfig.Driver.toUpperCase(),
          scope: networkInfo.Scope.toUpperCase(),
          internal: networkConfig.Internal || false,
          attachable: networkConfig.Attachable || true,
          ingress: networkConfig.Ingress || false,
          enableIPv6: networkConfig.EnableIPv6 || false,
          ipam: networkInfo.IPAM,
          options: networkInfo.Options,
          labels: networkInfo.Labels,
          subnet: networkInfo.IPAM?.Config?.[0]?.Subnet,
          gateway: networkInfo.IPAM?.Config?.[0]?.Gateway,
          connectionId: dockerSetup.connection.id,
        },
      });

      return {
        ...dbNetwork,
        dockerInfo: networkInfo,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create network: ${error.message}`,
      );
    }
  }

  async listNetworks(userId: number, connectionUuid: string) {
    const dockerSetup = await this.setupDocker(userId, connectionUuid);
    if (!dockerSetup.isConnected) {
      throw new ServiceUnavailableException(dockerSetup.error);
    }

    try {
      const dockerNetworks = await this.docker.listNetworks();
      const dbNetworks = await this.prismaService.network.findMany({
        where: {
          connectionId: dockerSetup.connection.id,
        },
      });

      return dockerNetworks.map((dockerNetwork) => {
        const dbNetwork = dbNetworks.find((n) => n.name === dockerNetwork.Name);
        return {
          ...dockerNetwork,
          dbInfo: dbNetwork || null,
        };
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to list networks: ${error.message}`,
      );
    }
  }

  async getNetwork(
    userId: number,
    connectionUuid: string,
    networkUuid: string,
  ) {
    const dockerSetup = await this.setupDocker(userId, connectionUuid);
    if (!dockerSetup.isConnected) {
      throw new ServiceUnavailableException(dockerSetup.error);
    }

    try {
      const dbNetwork = await this.prismaService.network.findFirst({
        where: {
          uuid: networkUuid,
          connectionId: dockerSetup.connection.id,
        },
      });

      if (!dbNetwork) {
        throw new NotFoundException('Network not found');
      }

      const network = this.docker.getNetwork(dbNetwork.name);
      const networkInfo = await network.inspect();

      return {
        ...dbNetwork,
        dockerInfo: networkInfo,
      };
    } catch (error) {
      throw new NotFoundException(`Network not found: ${error.message}`);
    }
  }

  async removeNetwork(
    userId: number,
    connectionUuid: string,
    networkUuid: string,
  ) {
    const dockerSetup = await this.setupDocker(userId, connectionUuid);
    if (!dockerSetup.isConnected) {
      throw new ServiceUnavailableException(dockerSetup.error);
    }

    try {
      const dbNetwork = await this.prismaService.network.findFirst({
        where: {
          uuid: networkUuid,
          connectionId: dockerSetup.connection.id,
        },
      });

      if (!dbNetwork) {
        throw new NotFoundException('Network not found');
      }

      const network = this.docker.getNetwork(dbNetwork.name);
      await network.remove();

      await this.prismaService.network.delete({
        where: {
          uuid: networkUuid,
        },
      });

      return {
        success: true,
        message: `Network ${dbNetwork.name} removed successfully`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to remove network: ${error.message}`,
      );
    }
  }

  async connectContainer(
    userId: number,
    connectionUuid: string,
    networkUuid: string,
    containerId: string,
    config?: any,
  ) {
    const dockerSetup = await this.setupDocker(userId, connectionUuid);
    if (!dockerSetup.isConnected) {
      throw new ServiceUnavailableException(dockerSetup.error);
    }

    try {
      const dbNetwork = await this.prismaService.network.findFirst({
        where: {
          uuid: networkUuid,
          connectionId: dockerSetup.connection.id,
        },
      });

      if (!dbNetwork) {
        throw new NotFoundException('Network not found');
      }

      const network = this.docker.getNetwork(dbNetwork.name);
      await network.connect({
        Container: containerId,
        ...config,
      });

      return {
        success: true,
        message: `Container connected to network ${dbNetwork.name} successfully`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to connect container to network: ${error.message}`,
      );
    }
  }

  async disconnectContainer(
    userId: number,
    connectionUuid: string,
    networkUuid: string,
    containerId: string,
    force: boolean = false,
  ) {
    const dockerSetup = await this.setupDocker(userId, connectionUuid);
    if (!dockerSetup.isConnected) {
      throw new ServiceUnavailableException(dockerSetup.error);
    }

    try {
      const dbNetwork = await this.prismaService.network.findFirst({
        where: {
          uuid: networkUuid,
          connectionId: dockerSetup.connection.id,
        },
      });

      if (!dbNetwork) {
        throw new NotFoundException('Network not found');
      }

      const network = this.docker.getNetwork(dbNetwork.name);
      await network.disconnect({
        Container: containerId,
        Force: force,
      });

      return {
        success: true,
        message: `Container disconnected from network ${dbNetwork.name} successfully`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to disconnect container from network: ${error.message}`,
      );
    }
  }

  async pruneNetworks(userId: number, connectionUuid: string) {
    const dockerSetup = await this.setupDocker(userId, connectionUuid);
    if (!dockerSetup.isConnected) {
      throw new ServiceUnavailableException(dockerSetup.error);
    }

    try {
      const pruneResult = await this.docker.pruneNetworks();

      // Remove pruned networks from database
      await this.prismaService.network.deleteMany({
        where: {
          connectionId: dockerSetup.connection.id,
          name: {
            in: pruneResult.NetworksDeleted || [],
          },
        },
      });

      return pruneResult;
    } catch (error) {
      throw new BadRequestException(
        `Failed to prune networks: ${error.message}`,
      );
    }
  }
}
