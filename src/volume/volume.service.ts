import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { ConnectionService } from '../connection/connection.service';
import { ConnectionChecker } from '../connection/connection.checker';
import { VolumeDriver, VolumeScope } from '@prisma/client';
import { DockerSetupResponse } from '../connection/connection.interface';
import Dockerode from 'dockerode';
import { randomUUID } from 'crypto';

@Injectable()
export class VolumeService {
    private currentConnection: any = null;
    private docker: Dockerode;

    constructor(
        private readonly prisma: PrismaService,
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

    // Volume Management
    async createVolume(userId: number, connectionUuid: string, volumeConfig: any) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            const volume = await this.docker.createVolume(volumeConfig);
            const volumeInfo = await volume.inspect();

            // Save volume in database
            const dbVolume = await this.prisma.volume.create({
                data: {
                    uuid: randomUUID(),
                    name: volumeConfig.Name,
                    driver: (volumeConfig.Driver || 'local').toUpperCase() as VolumeDriver,
                    scope: volumeInfo.Scope.toUpperCase() as VolumeScope,
                    mountpoint: volumeInfo.Mountpoint,
                    options: volumeInfo.Options,
                    labels: volumeInfo.Labels,
                    status: 'ACTIVE',
                    connectionId: dockerSetup.connection.id
                }
            });

            return {
                ...dbVolume,
                dockerInfo: volumeInfo
            };
        } catch (error) {
            throw new BadRequestException(`Failed to create volume: ${error.message}`);
        }
    }

    async listVolumes(userId: number, connectionUuid: string) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            const { Volumes } = await this.docker.listVolumes();
            const dbVolumes = await this.prisma.volume.findMany({
                where: {
                    connectionId: dockerSetup.connection.id
                }
            });

            return Volumes.map(dockerVolume => {
                const dbVolume = dbVolumes.find(v => v.name === dockerVolume.Name);
                return {
                    ...dockerVolume,
                    dbInfo: dbVolume || null
                };
            });
        } catch (error) {
            throw new BadRequestException(`Failed to list volumes: ${error.message}`);
        }
    }

    async getVolume(userId: number, connectionUuid: string, volumeUuid: string) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            const dbVolume = await this.prisma.volume.findFirst({
                where: {
                    uuid: volumeUuid,
                    connectionId: dockerSetup.connection.id
                }
            });

            if (!dbVolume) {
                throw new NotFoundException('Volume not found');
            }

            const volume = this.docker.getVolume(dbVolume.name);
            const volumeInfo = await volume.inspect();

            return {
                ...dbVolume,
                dockerInfo: volumeInfo
            };
        } catch (error) {
            throw new NotFoundException(`Volume not found: ${error.message}`);
        }
    }

    async removeVolume(userId: number, connectionUuid: string, volumeUuid: string, force: boolean = false) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            const dbVolume = await this.prisma.volume.findFirst({
                where: {
                    uuid: volumeUuid,
                    connectionId: dockerSetup.connection.id
                }
            });

            if (!dbVolume) {
                throw new NotFoundException('Volume not found');
            }

            const volume = this.docker.getVolume(dbVolume.name);
            await volume.remove({ force });

            await this.prisma.volume.delete({
                where: { uuid: volumeUuid }
            });

            return { success: true, message: `Volume ${dbVolume.name} removed successfully` };
        } catch (error) {
            throw new BadRequestException(`Failed to remove volume: ${error.message}`);
        }
    }

    async pruneVolumes(userId: number, connectionUuid: string) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            const pruneResult = await this.docker.pruneVolumes();

            // Remove pruned volumes from database
            if (pruneResult.VolumesDeleted) {
                await this.prisma.volume.deleteMany({
                    where: {
                        connectionId: dockerSetup.connection.id,
                        name: {
                            in: pruneResult.VolumesDeleted
                        }
                    }
                });
            }

            return pruneResult;
        } catch (error) {
            throw new BadRequestException(`Failed to prune volumes: ${error.message}`);
        }
    }

    // Volume Backup Management
    async createBackup(userId: number, connectionUuid: string, volumeUuid: string, backupConfig: any) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            const dbVolume = await this.prisma.volume.findFirst({
                where: {
                    uuid: volumeUuid,
                    connectionId: dockerSetup.connection.id
                }
            });

            if (!dbVolume) {
                throw new NotFoundException('Volume not found');
            }

            // Create a temporary container to backup the volume
            const backupContainer = await this.docker.createContainer({
                Image: 'alpine',
                Cmd: ['tar', 'czf', '/backup/volume.tar.gz', '-C', '/data', '.'],
                HostConfig: {
                    Binds: [
                        `${dbVolume.name}:/data:ro`,
                        `${backupConfig.backupPath}:/backup`
                    ]
                }
            });

            await backupContainer.start();
            await backupContainer.wait();
            await backupContainer.remove();

            // Create backup record in database
            const backup = await this.prisma.volumeBackup.create({
                data: {
                    uuid: randomUUID(),
                    name: backupConfig.name,
                    status: 'COMPLETED',
                    location: `${backupConfig.backupPath}/volume.tar.gz`,
                    size: 0, // You would need to get the actual size
                    completedAt: new Date(),
                    volumeId: dbVolume.id
                }
            });

            return backup;
        } catch (error) {
            throw new BadRequestException(`Failed to create backup: ${error.message}`);
        }
    }

    // Volume Snapshot Management
    async createSnapshot(userId: number, connectionUuid: string, volumeUuid: string, snapshotConfig: any) {
        const dockerSetup = await this.setupDocker(userId, connectionUuid);
        if (!dockerSetup.isConnected) {
            throw new ServiceUnavailableException(dockerSetup.error);
        }

        try {
            const dbVolume = await this.prisma.volume.findFirst({
                where: {
                    uuid: volumeUuid,
                    connectionId: dockerSetup.connection.id
                }
            });

            if (!dbVolume) {
                throw new NotFoundException('Volume not found');
            }

            // Create snapshot record in database
            const snapshot = await this.prisma.volumeSnapshot.create({
                data: {
                    uuid: randomUUID(),
                    name: snapshotConfig.name,
                    status: 'COMPLETED',
                    size: 0, // You would need to get the actual size
                    completedAt: new Date(),
                    volumeId: dbVolume.id
                }
            });

            return snapshot;
        } catch (error) {
            throw new BadRequestException(`Failed to create snapshot: ${error.message}`);
        }
    }
}
