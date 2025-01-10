import { Injectable } from "@nestjs/common";
import Docker, { ContainerCreateOptions, ContainerInfo } from 'dockerode';
import { ConnectionService } from "src/connection/connection.service";


@Injectable()
export class ContainerService {
    private dockerService: Docker

    constructor(private readonly connectionService: ConnectionService) { }

    private initializeDocker(connection: { host: string; port: number }): void {
        this.dockerService = new Docker({
            host: connection.host,
            port: connection.port,
        });
    }


    async createAndStartContainer(userId: number, connectionUuid: string, options: ContainerCreateOptions): Promise<string> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId); // Kullanıcının bağlantısını al
        this.initializeDocker(connection);

        try {
            await this.pullImage(options.Image);
            const container = await this.dockerService.createContainer(options);
            await container.start();

            return `Container ${container.id} created and started successfully.`;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to create and start container: ${error.message}`);
        }
    }


    // 2. Tüm konteynerleri listeleme
    async listContainers(userId: number, connectionUuid: string): Promise<ContainerInfo[]> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            return await this.dockerService.listContainers();
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to list containers: ${error.message}`);
        }
    }

    async stopContainer(userId: number, connectionUuid: string, containerId: string): Promise<string> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = this.dockerService.getContainer(containerId);
            await container.stop();
            return `Container ${containerId} stopped successfully.`;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to stop container: ${error.message}`);
        }
    }

    async removeContainer(userId: number, connectionUuid: string, containerId: string): Promise<string> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = this.dockerService.getContainer(containerId);
            await container.remove({ force: true }); // Force true ise çalışan konteyneri de siler
            return `Container ${containerId} removed successfully.`;
        } catch (error) {
            console.error(error);
            throw new Error(`Failed to remove container: ${error.message}`);
        }
    }

    async inspectContainer(userId: number, connectionUuid: string, containerId: string): Promise<Docker.ContainerInspectInfo> {
        const connection = await this.connectionService.getConnectionById(connectionUuid, userId);
        this.initializeDocker(connection);

        try {
            const container = this.dockerService.getContainer(containerId);
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
