import { Injectable } from "@nestjs/common";
import Docker, { ContainerCreateOptions, ContainerInfo } from 'dockerode';


@Injectable()
export class ContainerService {
    private dockerService: Docker

    constructor() {
        // Local Docker daemon ile iletişim kuran Docker instance
        this.dockerService = new Docker({
            host: 'localhost', // Localhost üzerinden bağlanıyoruz
            port: 2375,        // Docker Desktop'un açık TCP portu
        });
    }

    async createAndStartContainer(options: ContainerCreateOptions): Promise<string> {
        try {
            await this.pullImage(options.Image);
            const container = await this.dockerService.createContainer(options);
            await container.start();
            return `Container ${container.id} created and started successfully.`;
        } catch (error) {
            console.log(error);
            throw new Error(`Failed to create and start container: ${error.message}`);
        }
    }

    // 2. Tüm konteynerleri listeleme
    async listContainers(): Promise<ContainerInfo[]> {
        try {
            return await this.dockerService.listContainers();
        } catch (error) {
            console.log(error);
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
