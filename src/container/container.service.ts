import { Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { ContainerStatus } from "@prisma/client";
import Docker, { ContainerCreateOptions, ContainerInfo } from 'dockerode';
import { ConnectionChecker } from "src/connection/connection.checker";
import { Connection, DockerSetupResponse } from "src/connection/connection.interface";
import { ConnectionService } from "src/connection/connection.service";
import { PrismaService } from "src/database/database.service";
@Injectable()
export class ContainerService {
    private dockerService: Docker
    private currentConnection: Connection | null = null;

    constructor(private readonly connectionService: ConnectionService, private readonly prismaService: PrismaService, private readonly connectionChecker: ConnectionChecker) { }

    private initializeDocker(connection: { host: string; port: number }): void {
        this.dockerService = new Docker({
            host: connection.host,
            port: connection.port,
        });
    }

    private async setupDocker(userId: number, connectionUuid: string): Promise<DockerSetupResponse> {
        try {
            const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
            const connectionStatus = await this.connectionChecker.checkConnection(connection);

            if (!connectionStatus.isConnected) {
                return {
                    isConnected: false,
                    connection,
                    error: `Docker connection failed: ${connectionStatus.error}`
                };
            }

            if (!this.currentConnection || this.currentConnection.uuid !== connection.uuid) {
                this.initializeDocker(connection);
                this.currentConnection = connection;
            }

            // Docker bilgilerini al
            const dockerInfo = await this.dockerService.info();

            return {
                isConnected: true,
                connection,
                dockerInfo: {
                    version: dockerInfo.ServerVersion,
                    containers: dockerInfo.Containers,
                    images: dockerInfo.Images,
                    serverTime: dockerInfo.SystemTime,
                    operatingSystem: dockerInfo.OperatingSystem
                }
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('Connection not found or access denied');
            }
            if (error instanceof ServiceUnavailableException) {
                throw error;
            }

            return {
                isConnected: false,
                connection: null,
                error: `Failed to setup Docker connection: ${error.message}`
            };
        }
    }


    async createAndStartContainer(userId: number, connectionUuid: string, options: ContainerCreateOptions): Promise<string> {
        //const connection = await this.connectionService.getConnectionById(connectionUuid, userId); // Kullanıcının bağlantısını al
        //this.initializeDocker(connection);

        const setupResponse = await this.setupDocker(userId, connectionUuid);

        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        try {
            await this.pullImage(options.Image);
            const container = await this.dockerService.createContainer(options);
            await container.start();

            const dockerId = container.id;

            await this.prismaService.container.create({
                data: {
                    name: options.name,
                    image: options.Image,
                    status: ContainerStatus.CREATED, // Başlatıldığı için durum "running" olarak kaydedilir
                    connectionId: this.currentConnection.id,
                    //connectionId: connection.id, // Bağlantı ID'si
                    dockerId: dockerId, // Docker'dan alınan benzersiz ID
                },
            });

            return `Container ${container.id} created and started successfully.`;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to create and start container: ${error.message}`);
        }
    }

    async listContainers(userId: number, connectionUuid: string): Promise<ContainerInfo[]> {
        const setupResponse = await this.setupDocker(userId, connectionUuid);

        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        try {
            return await this.dockerService.listContainers();
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to list containers: ${error.message}`);
        }
    }

    async stopContainer(userId: number, connectionUuid: string, containerUuid: string): Promise<string> {
        // Kullanıcı bağlantısını doğrula
        const setupResponse = await this.setupDocker(userId, connectionUuid);

        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        // Veritabanından konteyner kaydını al
        const containerRecord = await this.prismaService.container.findFirst({
            where: {
                uuid: containerUuid,
                connectionId: this.currentConnection.id, // Doğru bağlantıya ait olduğundan emin olun
            },
        });

        if (!containerRecord) {
            throw new Error(`Container with UUID ${containerUuid} not found for the given connection.`);
        }

        const dockerContainerId = containerRecord.dockerId;

        try {
            // Docker'daki konteyneri durdur
            const container = this.dockerService.getContainer(dockerContainerId);
            await container.stop();

            // Veritabanında durumu güncelle
            await this.prismaService.container.update({
                where: { uuid: containerUuid },
                data: { status: ContainerStatus.PAUSED },
            });

            return `Container ${dockerContainerId} stopped successfully.`;
        } catch (error) {
            console.error(`Error stopping container: ${error.message}`);
            throw new Error(`Failed to stop container: ${error.message}`);
        }
    }

    private async updateContainerStatus(containerUuid: string, status: string): Promise<void> {
        try {
            // `containerUuid` üzerinden güncelleme
            await this.prismaService.container.update({
                where: { uuid: containerUuid }, // `uuid` alanını kullanıyoruz
                data: { status: ContainerStatus.PAUSED },
            });
        } catch (error) {
            console.error(`Failed to update container status in database: ${error.message}`);
            throw new Error(`Failed to update container status in database: ${error.message}`);
        }
    }

    async removeContainer(userId: number, connectionUuid: string, containerUuid: string): Promise<string> {
        const setupResponse = await this.setupDocker(userId, connectionUuid);

        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        // Veritabanından konteyner kaydını al
        const containerRecord = await this.prismaService.container.findFirst({
            where: {
                uuid: containerUuid,
                connectionId: this.currentConnection.id,
            },
        });

        if (!containerRecord) {
            throw new Error(`Container with UUID ${containerUuid} not found for the given connection.`);
        }

        const dockerContainerId = containerRecord.dockerId;

        try {
            const container = this.dockerService.getContainer(dockerContainerId);
            await container.remove({ force: true });

            // Veritabanından container kaydını sil
            await this.prismaService.container.delete({
                where: { uuid: containerUuid },
            });

            return `Container ${dockerContainerId} removed successfully.`;
        } catch (error) {
            console.error(`Failed to remove container: ${error.message}`);
            throw new Error(`Failed to remove container: ${error.message}`);
        }
    }

    async inspectContainer(userId: number, connectionUuid: string, containerId: string): Promise<Docker.ContainerInspectInfo> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = await this.dockerService.getContainer(containerId);
            return await container.inspect();
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to inspect container: ${error.message}`);
        }
    }

    async restartContainer(userId: number, connectionUuid: string, containerId: string): Promise<string> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = this.dockerService.getContainer(containerId);
            await container.restart();
            return `Container ${containerId} restarted successfully.`;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to restart container: ${error.message}`);
        }
    }

    async getContainerLogs(userId: number, connectionUuid: string, containerId: string): Promise<string> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = this.dockerService.getContainer(containerId);
            const logs = await container.logs({
                stdout: true,
                stderr: true,
                follow: false,
            });

            return logs.toString('utf-8');
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to get logs for container ${containerId}: ${error.message}`);
        }
    }

    async pauseContainer(userId: number, connectionUuid: string, containerId: string): Promise<string> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = this.dockerService.getContainer(containerId);
            await container.pause();
            return `Container ${containerId} paused successfully.`;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to pause container: ${error.message}`);
        }
    }

    async unpauseContainer(userId: number, connectionUuid: string, containerId: string): Promise<string> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = this.dockerService.getContainer(containerId);
            await container.unpause();
            return `Container ${containerId} unpaused successfully.`;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to unpause container: ${error.message}`);
        }
    }

    async pruneContainers(userId: number, connectionUuid: string): Promise<string> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const result = await this.dockerService.pruneContainers();
            return `Unused containers pruned successfully. Removed: ${result.ContainersDeleted}`;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to prune containers: ${error.message}`);
        }
    }

    async getContainerStats(userId: number, connectionUuid: string, containerId: string): Promise<any> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = this.dockerService.getContainer(containerId);
            const statsStream = await container.stats({ stream: false });

            return statsStream;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to get stats for container ${containerId}: ${error.message}`);
        }
    }

    private async pullImage(image: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.dockerService.pull(image, (err, stream) => {
                if (err) {
                    return reject(err);
                }
                this.dockerService.modem.followProgress(stream, onFinished, onProgress);

                function onFinished(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                }

                function onProgress(event) {
                    console.log(event);
                }
            });
        });
    }
}
