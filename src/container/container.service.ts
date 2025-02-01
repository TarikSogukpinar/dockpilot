import { HttpException, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { ContainerStatus, ContainerHealthStatus, ContainerRestartPolicy, ContainerAction } from "@prisma/client";
import Docker, { ContainerCreateOptions, ContainerInfo } from 'dockerode';
import { ConnectionChecker } from "src/connection/connection.checker";
import { Connection, DockerSetupResponse } from "src/connection/connection.interface";
import { ConnectionService } from "src/connection/connection.service";
import { PrismaService } from "src/database/database.service";
import { CreateContainerDto } from './dto/requests/createContanier.dto';
import { CreateContainerResponseDto } from './dto/responses/createContainerResponse.dto';
import { PullImageDto } from "./dto/requests/pullImage.dto";
import { PullImageResponseDto } from "./dto/responses/pullImageResponse.dto";

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

    async createAndStartContainer(
        userId: number,
        connectionUuid: string,
        createContainerDto: CreateContainerDto
    ): Promise<CreateContainerResponseDto> {
        const setupResponse = await this.setupDocker(userId, connectionUuid);

        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException();
        }

        try {
            const dockerOptions: ContainerCreateOptions = {
                Image: createContainerDto.Image,
                name: createContainerDto.name
            };

            await this.pullImage(dockerOptions.Image);
            const container = await this.dockerService.createContainer(dockerOptions);
            await container.start();

            const createdContainer = await this.prismaService.container.create({
                data: {
                    name: createContainerDto.name,
                    image: createContainerDto.Image,
                    status: ContainerStatus.RUNNING,
                    connectionId: this.currentConnection.id,
                    dockerId: container.id,
                }
            });

            return {
                status: 200,
                message: 'Container created successfully',
                data: {
                    id: createdContainer.id.toString(),
                    name: createdContainer.name,
                    status: createdContainer.status,
                    dockerId: createdContainer.dockerId,
                    createdAt: createdContainer.createdAt
                }
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("An unexpected error occurred while creating ticket");
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

    async inspectContainer(userId: number, connectionUuid: string, containerUuid: string): Promise<Docker.ContainerInspectInfo> {
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
            const inspectResult = await container.inspect();
            return inspectResult;
        } catch (error) {
            console.error(`Failed to inspect container: ${error.message}`);
            throw new Error(`Failed to inspect container: ${error.message}`);
        }
    }

    async restartContainer(userId: number, connectionUuid: string, containerUuid: string): Promise<string> {
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
            await container.restart();
            return `Container ${dockerContainerId} restarted successfully.`;
        } catch (error) {
            console.error(`Failed to restart container: ${error.message}`);
            throw new Error(`Failed to restart container: ${error.message}`);
        }
    }

    async getContainerLogs(
        userId: number,
        connectionUuid: string,
        containerUuid: string,
        options: {
            since?: Date;
            until?: Date;
            limit?: number;
            stream?: string;
        } = {}
    ): Promise<any[]> {
        const setupResponse = await this.setupDocker(userId, connectionUuid);
        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        const containerRecord = await this.prismaService.container.findFirst({
            where: {
                uuid: containerUuid,
                connectionId: this.currentConnection.id,
            },
        });

        if (!containerRecord) {
            throw new NotFoundException(`Container with UUID ${containerUuid} not found`);
        }

        try {
            // Get Docker logs if needed
            const container = this.dockerService.getContainer(containerRecord.dockerId);
            const dockerLogs = await container.logs({
                stdout: true,
                stderr: true,
                follow: false,
                ...(options.since && { since: options.since.getTime() / 1000 }),
                ...(options.until && { until: options.until.getTime() / 1000 }),
            });

            // Store the logs in the database
            const logEntry = await this.prismaService.containerLog.create({
                data: {
                    uuid: crypto.randomUUID(),
                    stream: 'stdout',
                    message: dockerLogs.toString('utf-8'),
                    containerId: containerRecord.id
                }
            });

            // Query logs based on filters
            const query: any = {
                where: {
                    containerId: containerRecord.id,
                    ...(options.stream && { stream: options.stream }),
                    ...(options.since && { timestamp: { gte: options.since } }),
                    ...(options.until && { timestamp: { lte: options.until } })
                },
                orderBy: { timestamp: 'desc' }
            };

            if (options.limit) {
                query.take = options.limit;
            }

            return this.prismaService.containerLog.findMany(query);
        } catch (error) {
            throw new Error(`Failed to get logs for container: ${error.message}`);
        }
    }

    async pauseContainer(userId: number, connectionUuid: string, containerUuid: string): Promise<string> {
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
            await container.pause();

            // Veritabanında durumu güncelle
            await this.prismaService.container.update({
                where: { uuid: containerUuid },
                data: { status: ContainerStatus.PAUSED },
            });

            return `Container ${dockerContainerId} paused successfully.`;
        } catch (error) {
            console.error(`Failed to pause container: ${error.message}`);
            throw new Error(`Failed to pause container: ${error.message}`);
        }
    }

    async unpauseContainer(userId: number, connectionUuid: string, containerUuid: string): Promise<string> {
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
            await container.unpause();

            // Veritabanında durumu güncelle
            await this.prismaService.container.update({
                where: { uuid: containerUuid },
                data: { status: ContainerStatus.RUNNING },
            });

            return `Container ${dockerContainerId} unpaused successfully.`;
        } catch (error) {
            console.error(`Failed to unpause container: ${error.message}`);
            throw new Error(`Failed to unpause container: ${error.message}`);
        }
    }

    async pruneContainers(userId: number, connectionUuid: string): Promise<string> {
        const setupResponse = await this.setupDocker(userId, connectionUuid);

        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        try {
            const result = await this.dockerService.pruneContainers();

            // Silinen containerları veritabanından da temizle
            if (result.ContainersDeleted && result.ContainersDeleted.length > 0) {
                // Veritabanındaki container kayıtlarını güncelle
                await this.prismaService.container.deleteMany({
                    where: {
                        connectionId: this.currentConnection.id,
                        dockerId: {
                            in: result.ContainersDeleted
                        }
                    }
                });
            }

            return `Unused containers pruned successfully. Removed: ${result.ContainersDeleted?.length || 0}`;
        } catch (error) {
            console.error(`Failed to prune containers: ${error.message}`);
            throw new Error(`Failed to prune containers: ${error.message}`);
        }
    }

    async getContainerStats(userId: number, connectionUuid: string, containerUuid: string): Promise<any> {
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
            const statsStream = await container.stats({ stream: false });

            return {
                containerId: dockerContainerId,
                stats: statsStream,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Failed to get stats for container: ${error.message}`);
            throw new Error(`Failed to get stats for container: ${error.message}`);
        }
    }

    private async pullImage(pullImageDto: PullImageDto): Promise<PullImageResponseDto> {
        return new Promise((resolve, reject) => {
            this.dockerService.pull(pullImageDto, (err, stream) => {
                if (err) {
                    return reject(err);
                }
                this.dockerService.modem.followProgress(stream, onFinished, onProgress);

                function onFinished(err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(void 0);
                }

                function onProgress(event) {
                    console.log(event);
                }
            });
        });
    }

    // Lifecycle Management Methods
    async updateContainerHealth(userId: number, connectionUuid: string, containerUuid: string): Promise<void> {
        const setupResponse = await this.setupDocker(userId, connectionUuid);
        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        const containerRecord = await this.prismaService.container.findFirst({
            where: {
                uuid: containerUuid,
                connectionId: this.currentConnection.id,
            },
        });

        if (!containerRecord) {
            throw new NotFoundException(`Container with UUID ${containerUuid} not found`);
        }

        try {
            const container = this.dockerService.getContainer(containerRecord.dockerId);
            const inspectInfo = await container.inspect();

            let healthStatus: "HEALTHY" | "UNHEALTHY" | "STARTING" | "NONE" = "NONE";
            if (inspectInfo.State.Health) {
                switch (inspectInfo.State.Health.Status) {
                    case 'healthy':
                        healthStatus = "HEALTHY";
                        break;
                    case 'unhealthy':
                        healthStatus = "UNHEALTHY";
                        break;
                    case 'starting':
                        healthStatus = "STARTING";
                        break;
                }
            }

            await this.prismaService.container.update({
                where: { uuid: containerUuid },
                data: {
                    healthStatus,
                    exitCode: inspectInfo.State.ExitCode,
                    startedAt: inspectInfo.State.StartedAt ? new Date(inspectInfo.State.StartedAt) : null,
                    finishedAt: inspectInfo.State.FinishedAt ? new Date(inspectInfo.State.FinishedAt) : null
                }
            });
        } catch (error) {
            throw new Error(`Failed to update container health: ${error.message}`);
        }
    }

    async configureHealthCheck(
        userId: number,
        connectionUuid: string,
        containerUuid: string,
        config: {
            test: string[];
            interval: number;
            timeout: number;
            retries: number;
            startPeriod: number;
        }
    ): Promise<void> {
        const setupResponse = await this.setupDocker(userId, connectionUuid);
        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        const containerRecord = await this.prismaService.container.findFirst({
            where: {
                uuid: containerUuid,
                connectionId: this.currentConnection.id,
            },
        });

        if (!containerRecord) {
            throw new NotFoundException(`Container with UUID ${containerUuid} not found`);
        }

        try {
            await this.prismaService.containerHealthCheck.upsert({
                where: { containerId: containerRecord.id },
                create: {
                    ...config,
                    containerId: containerRecord.id,
                    uuid: crypto.randomUUID()
                },
                update: config
            });
        } catch (error) {
            throw new Error(`Failed to configure health check: ${error.message}`);
        }
    }

    async logContainerEvent(
        containerUuid: string,
        action: ContainerAction,
        status: string,
        message?: string
    ): Promise<void> {
        const containerRecord = await this.prismaService.container.findUnique({
            where: { uuid: containerUuid }
        });

        if (!containerRecord) {
            throw new NotFoundException(`Container with UUID ${containerUuid} not found`);
        }

        await this.prismaService.containerEvent.create({
            data: {
                uuid: crypto.randomUUID(),
                action,
                status,
                message,
                containerId: containerRecord.id
            }
        });
    }

    async updateContainerRestartPolicy(
        userId: number,
        connectionUuid: string,
        containerUuid: string,
        restartPolicy: ContainerRestartPolicy
    ): Promise<void> {
        const setupResponse = await this.setupDocker(userId, connectionUuid);
        if (!setupResponse.isConnected) {
            throw new ServiceUnavailableException(setupResponse.error);
        }

        const containerRecord = await this.prismaService.container.findFirst({
            where: {
                uuid: containerUuid,
                connectionId: this.currentConnection.id,
            },
        });

        if (!containerRecord) {
            throw new NotFoundException(`Container with UUID ${containerUuid} not found`);
        }

        try {
            const container = this.dockerService.getContainer(containerRecord.dockerId);
            await container.update({ RestartPolicy: { Name: restartPolicy.toLowerCase() } });

            await this.prismaService.container.update({
                where: { uuid: containerUuid },
                data: { restartPolicy }
            });
        } catch (error) {
            throw new Error(`Failed to update restart policy: ${error.message}`);
        }
    }

    async getContainerEvents(
        userId: number,
        connectionUuid: string,
        containerUuid: string,
        limit: number = 100
    ): Promise<any[]> {
        const containerRecord = await this.prismaService.container.findFirst({
            where: {
                uuid: containerUuid,
                connection: {
                    uuid: connectionUuid,
                    userId
                }
            }
        });

        if (!containerRecord) {
            throw new NotFoundException(`Container with UUID ${containerUuid} not found`);
        }

        return this.prismaService.containerEvent.findMany({
            where: { containerId: containerRecord.id },
            orderBy: { timestamp: 'desc' },
            take: limit
        });
    }
}
