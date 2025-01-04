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
