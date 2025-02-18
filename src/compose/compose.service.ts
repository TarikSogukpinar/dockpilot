import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { ConnectionService } from '../connection/connection.service';
import { ConnectionChecker } from '../connection/connection.checker';
import { CreateComposeDto } from './dto/create-compose.dto';
import { ComposeConfig } from './interfaces/compose-config.interface';
import { DockerSetupResponse } from '../connection/connection.interface';
import * as yaml from 'js-yaml';
import Dockerode from 'dockerode';
import { randomUUID } from 'crypto';

@Injectable()
export class ComposeService {
    private currentConnection: any = null;
    private docker: Dockerode;

    constructor(
        private readonly prismaService: PrismaService,
        private readonly connectionService: ConnectionService,
        private readonly connectionChecker: ConnectionChecker,
    ) { }

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

    private async setupDocker(userId: number, connectionUuid: string): Promise<DockerSetupResponse> {
        try {
            const connection = await this.connectionService.getConnectionById(userId, connectionUuid);
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

            const dockerInfo = await this.docker.info();

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

    async createDeployment(userId: number, createComposeDto: CreateComposeDto) {
        // Setup and validate Docker connection
        const dockerSetup = await this.setupDocker(userId, createComposeDto.connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        // Parse and validate compose file
        let composeConfig: ComposeConfig;
        try {
            composeConfig = yaml.load(createComposeDto.composeContent) as ComposeConfig;
            this.validateComposeConfig(composeConfig);
        } catch (error) {
            throw new BadRequestException(`Invalid compose file: ${error.message}`);
        }

        // Create deployment record
        const deployment = await this.prismaService.composeDeployment.create({
            data: {
                uuid: randomUUID(),
                name: createComposeDto.name,
                description: createComposeDto.description,
                composeContent: createComposeDto.composeContent,
                environmentVars: createComposeDto.environmentVariables || {},
                connectionId: dockerSetup.connection.id,
                createdBy: userId,
                status: 'PENDING',
            },
        });

        // Start deployment process
        try {
            await this.startDeployment(deployment.uuid);
            return deployment;
        } catch (error) {
            await this.prismaService.composeDeployment.update({
                where: { uuid: deployment.uuid },
                data: { status: 'FAILED' },
            });
            throw error;
        }
    }

    //check is port avaliable
    private async isPortAvailable(hostPort: number, containerPort: number): Promise<boolean> {
        try {
            const containers = await this.docker.listContainers({ all: true });
            for (const container of containers) {
                const ports = container.Ports || [];
                for (const p of ports) {
                    // Check both host port and private port (container port)
                    if (p.PublicPort === hostPort || p.PrivatePort === containerPort) {
                        return false;
                    }
                }
            }
            return true;
        } catch (error) {
            console.error(`Error checking port availability: ${error.message}`);
            return false;
        }
    }

    private async validatePorts(serviceConfig: any): Promise<void> {
        if (!serviceConfig.ports) return;

        for (const portMapping of serviceConfig.ports) {
            const [hostPort, containerPort] = portMapping.split(':').map(p => parseInt(p, 10));

            if (!await this.isPortAvailable(hostPort, containerPort)) {
                throw new BadRequestException(`Port ${hostPort} (host) or ${containerPort} (container) is already in use. Please choose different ports.`);
            }
        }
    }

    private async startDeployment(uuid: string) {
        const deployment = await this.prismaService.composeDeployment.findUnique({
            where: { uuid },
            include: { connection: true },
        });

        if (!deployment) {
            throw new NotFoundException('Deployment not found');
        }

        if (!this.docker || this.currentConnection.id !== deployment.connectionId) {
            throw new ServiceUnavailableException('Docker connection not properly initialized');
        }

        const composeConfig = yaml.load(deployment.composeContent) as ComposeConfig;

        // Validate all ports before starting deployment
        for (const [serviceName, serviceConfig] of Object.entries(composeConfig.services)) {
            await this.validatePorts(serviceConfig);
        }

        // Process each service in the compose file
        for (const [serviceName, serviceConfig] of Object.entries(composeConfig.services)) {
            try {
                // Pull image if needed
                if (serviceConfig.image) {
                    await this.docker.pull(serviceConfig.image);
                }

                // Create container
                const containerConfig = this.convertComposeToContainerConfig(serviceName, serviceConfig);
                const container = await this.docker.createContainer(containerConfig);

                // Create container record in database
                await this.prismaService.container.create({
                    data: {
                        name: serviceName,
                        dockerId: container.id,
                        image: serviceConfig.image,
                        connectionId: deployment.connectionId,
                        composeDeploymentId: deployment.id,
                        status: 'CREATED',
                    },
                });

                // Start container
                await container.start();
            } catch (error) {
                throw new BadRequestException(`Failed to deploy service ${serviceName}: ${error.message}`);
            }
        }

        // Update deployment status
        await this.prismaService.composeDeployment.update({
            where: { uuid },
            data: { status: 'RUNNING' },
        });
    }

    private validateComposeConfig(config: ComposeConfig) {
        if (!config || !config.services || typeof config.services !== 'object') {
            throw new BadRequestException('Invalid compose file: must contain services section');
        }

        // Add more validation as needed
    }

    private convertComposeToContainerConfig(serviceName: string, serviceConfig: any) {
        const uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).substring(2);
        // Convert compose service config to Docker container config
        return {
            Image: serviceConfig.image,
            name: `${serviceName}-${uniqueSuffix}`,
            Env: this.processEnvironmentVariables(serviceConfig.environment),
            ExposedPorts: this.processExposedPorts(serviceConfig.ports),
            HostConfig: {
                PortBindings: this.processPortBindings(serviceConfig.ports),
                Binds: this.processVolumes(serviceConfig.volumes),
                RestartPolicy: {
                    Name: serviceConfig.restart || 'no',
                },
            },
            // Add more configuration options as needed
        };
    }

    private processEnvironmentVariables(env: any): string[] {
        if (!env) return [];
        if (Array.isArray(env)) return env;
        return Object.entries(env).map(([key, value]) => `${key}=${value}`);
    }

    private processExposedPorts(ports: string[]) {
        if (!ports) return {};
        const exposed = {};
        ports.forEach(port => {
            const [containerPort] = port.split(':');
            exposed[`${containerPort}/tcp`] = {};
        });
        return exposed;
    }

    private processPortBindings(ports: string[]) {
        if (!ports) return {};
        const bindings = {};
        ports.forEach(port => {
            const [hostPort, containerPort] = port.split(':');
            if (!containerPort) {
                // If no container port specified, use host port for both
                bindings[`${hostPort}/tcp`] = [{ HostPort: hostPort }];
            } else {
                bindings[`${containerPort}/tcp`] = [{ HostPort: hostPort }];
            }
        });
        return bindings;
    }

    private processVolumes(volumes: string[]) {
        if (!volumes) return [];
        return volumes.map(volume => {
            const [host, container] = volume.split(':');
            return `${host}:${container}`;
        });
    }

    async getDeployment(userId: number, uuid: string) {
        const deployment = await this.prismaService.composeDeployment.findUnique({
            where: { uuid },
            include: {
                containers: true,
                connection: true,
            },
        });

        if (!deployment || deployment.createdBy !== userId) {
            throw new NotFoundException('Deployment not found or access denied');
        }

        return deployment;
    }

    async listDeployments(userId: number) {
        return this.prismaService.composeDeployment.findMany({
            where: { createdBy: userId },
            include: {
                containers: true,
                connection: {
                    select: {
                        host: true,
                        port: true,
                    },
                },
            },
        });
    }

    async stopDeployment(userId: number, uuid: string) {
        const deployment = await this.getDeployment(userId, uuid);

        const docker = new Dockerode({
            host: deployment.connection.host,
            port: deployment.connection.port,
            ...(deployment.connection.tlsConfig && {
                ca: deployment.connection.tlsConfig['ca'],
                cert: deployment.connection.tlsConfig['cert'],
                key: deployment.connection.tlsConfig['key'],
            }),
        });

        // Stop all containers in the deployment
        for (const container of deployment.containers) {
            try {
                const dockerContainer = docker.getContainer(container.dockerId);
                await dockerContainer.stop();

                await this.prismaService.container.update({
                    where: { id: container.id },
                    data: { status: 'EXITED' },
                });
            } catch (error) {
                console.error(`Failed to stop container ${container.name}: ${error.message}`);
            }
        }

        return this.prismaService.composeDeployment.update({
            where: { uuid },
            data: { status: 'STOPPED' },
        });
    }

    async deleteDeployment(userId: number, uuid: string) {
        const deployment = await this.getDeployment(userId, uuid);

        const docker = new Dockerode({
            host: deployment.connection.host,
            port: deployment.connection.port,
            ...(deployment.connection.tlsConfig && {
                ca: deployment.connection.tlsConfig['ca'],
                cert: deployment.connection.tlsConfig['cert'],
                key: deployment.connection.tlsConfig['key'],
            }),
        });

        // Remove all containers in the deployment
        for (const container of deployment.containers) {
            try {
                const dockerContainer = docker.getContainer(container.dockerId);
                await dockerContainer.stop();
                await dockerContainer.remove();
            } catch (error) {
                console.error(`Failed to remove container ${container.name}: ${error.message}`);
            }
        }

        return this.prismaService.composeDeployment.delete({
            where: { uuid },
        });
    }
} 