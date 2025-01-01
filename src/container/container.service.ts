import { Injectable } from "@nestjs/common";
import Docker, { ContainerCreateOptions, ContainerInfo } from 'dockerode';


@Injectable()
export class ContainerService {
    private dockerService: Docker

    constructor() {
        // Local Docker daemon ile iletişim kuran Docker instance
        this.dockerService = new Docker({ socketPath: '/var/run/docker.sock' });
    }

    async createAndStartContainer(options: ContainerCreateOptions): Promise<string> {
        try {
          const container = await this.dockerService.createContainer(options);
          await container.start();
          return `Container ${container.id} created and started successfully.`;
        } catch (error) {
          throw new Error(`Failed to create and start container: ${error.message}`);
        }
      }
    
      // 2. Tüm konteynerleri listeleme
      async listContainers(): Promise<ContainerInfo[]> {
        try {
          return await this.dockerService.listContainers();
        } catch (error) {
          throw new Error(`Failed to list containers: ${error.message}`);
        }
      }
}