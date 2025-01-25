import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { ConnectionService } from '../connection/connection.service';
import { ConnectionChecker } from '../connection/connection.checker';
import { CreateImageDto } from './dto/create-image.dto';
import { DockerSetupResponse } from '../connection/connection.interface';
import Dockerode from 'dockerode';
import { randomUUID } from 'crypto';

@Injectable()
export class ImageService {
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
            const connection = await this.connectionService.getConnectionByUuid(connectionUuid, userId);
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

            return {
                isConnected: true,
                connection,
                dockerInfo: await this.docker.info()
            };

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException('Connection not found or access denied');
            }
            throw new ServiceUnavailableException(`Failed to setup Docker connection: ${error.message}`);
        }
    }

    async pullImage(userId: number, createImageDto: CreateImageDto) {
        const { name, tag, registry, username, password, platform, forcePull } = createImageDto;

        // Setup Docker connection
        const dockerSetup = await this.setupDocker(userId, createImageDto.connectionId);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            // Prepare authentication config if credentials provided
            const authconfig = username && password ? {
                username,
                password,
                serveraddress: registry
            } : undefined;

            // Pull the image
            const stream = await this.docker.pull(`${registry ? registry + '/' : ''}${name}:${tag}`, {
                authconfig,
                platform
            });

            // Wait for the pull to complete
            const pullResult = await new Promise((resolve, reject) => {
                this.docker.modem.followProgress(stream, (err, output) => {
                    if (err) reject(err);
                    resolve(output);
                });
            });

            // Get image details
            const image = await this.docker.getImage(`${registry ? registry + '/' : ''}${name}:${tag}`);
            const imageInfo = await image.inspect();

            // Save or update image in database
            const dbImage = await this.prismaService.image.upsert({
                where: {
                    connectionId_imageId: {
                        connectionId: dockerSetup.connection.id,
                        imageId: imageInfo.Id
                    }
                },
                update: {
                    pullCount: { increment: 1 },
                    lastPulled: new Date(),
                    size: imageInfo.Size,
                    digest: imageInfo.RepoDigests?.[0],
                    labels: imageInfo.Config?.Labels || {}
                },
                create: {
                    uuid: randomUUID(),
                    name,
                    tag,
                    imageId: imageInfo.Id,
                    registry,
                    platform,
                    size: imageInfo.Size,
                    digest: imageInfo.RepoDigests?.[0],
                    labels: imageInfo.Config?.Labels || {},
                    connectionId: dockerSetup.connection.id,
                    pullCount: 1,
                    lastPulled: new Date()
                }
            });

            return {
                ...dbImage,
                pullResult
            };
        } catch (error) {
            throw new BadRequestException(`Failed to pull image: ${error.message}`);
        }
    }

    async listImages(userId: number, connectionUuid: string) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            // Get images from Docker
            const dockerImages = await this.docker.listImages({ all: true });

            // Get images from database
            const dbImages = await this.prismaService.image.findMany({
                where: {
                    connection: {
                        uuid: connectionUuid
                    }
                }
            });

            // Merge Docker and DB information
            return dockerImages.map(dockerImage => {
                const dbImage = dbImages.find(img => img.imageId === dockerImage.Id);
                return {
                    ...dockerImage,
                    dbInfo: dbImage || null
                };
            });
        } catch (error) {
            throw new BadRequestException(`Failed to list images: ${error.message}`);
        }
    }

    async getImage(userId: number, connectionUuid: string, imageUuid: string) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            // Get image from database first
            const dbImage = await this.prismaService.image.findFirst({
                where: {
                    uuid: imageUuid,
                    connection: {
                        uuid: connectionUuid
                    }
                }
            });

            if (!dbImage) {
                throw new NotFoundException('Image not found');
            }

            const image = this.docker.getImage(dbImage.imageId);
            const [imageInfo, imageHistory] = await Promise.all([
                image.inspect(),
                image.history()
            ]);

            return {
                ...dbImage,
                dockerInfo: imageInfo,
                history: imageHistory
            };
        } catch (error) {
            throw new NotFoundException(`Image not found: ${error.message}`);
        }
    }

    async removeImage(userId: number, connectionUuid: string, imageUuid: string, force: boolean = false) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            // Get image from database first
            const dbImage = await this.prismaService.image.findFirst({
                where: {
                    uuid: imageUuid,
                    connection: {
                        uuid: connectionUuid
                    }
                }
            });

            if (!dbImage) {
                throw new NotFoundException('Image not found');
            }

            const image = this.docker.getImage(dbImage.imageId);
            await image.remove({ force });

            // Remove from database
            await this.prismaService.image.delete({
                where: {
                    uuid: imageUuid
                }
            });

            return { success: true, message: `Image ${dbImage.name}:${dbImage.tag} removed successfully` };
        } catch (error) {
            throw new BadRequestException(`Failed to remove image: ${error.message}`);
        }
    }

    async tagImage(userId: number, connectionUuid: string, imageUuid: string, repo: string, tag: string) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            // Get image from database first
            const dbImage = await this.prismaService.image.findFirst({
                where: {
                    uuid: imageUuid,
                    connection: {
                        uuid: connectionUuid
                    }
                }
            });

            if (!dbImage) {
                throw new NotFoundException('Image not found');
            }

            const image = this.docker.getImage(dbImage.imageId);
            await image.tag({ repo, tag });
            return { success: true, message: `Image ${dbImage.name}:${dbImage.tag} tagged as ${repo}:${tag}` };
        } catch (error) {
            throw new BadRequestException(`Failed to tag image: ${error.message}`);
        }
    }

    async pushImage(
        userId: number,
        connectionUuid: string,
        imageUuid: string,
        registry: string,
        username?: string,
        password?: string
    ) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            // Get image from database first
            const dbImage = await this.prismaService.image.findFirst({
                where: {
                    uuid: imageUuid,
                    connection: {
                        uuid: connectionUuid
                    }
                }
            });

            if (!dbImage) {
                throw new NotFoundException('Image not found');
            }

            const image = this.docker.getImage(dbImage.imageId);
            const authconfig = username && password ? {
                username,
                password,
                serveraddress: registry
            } : undefined;

            const stream = await image.push({
                authconfig
            });

            return new Promise((resolve, reject) => {
                this.docker.modem.followProgress(stream, (err, output) => {
                    if (err) reject(err);
                    resolve(output);
                });
            });
        } catch (error) {
            throw new BadRequestException(`Failed to push image: ${error.message}`);
        }
    }
}
