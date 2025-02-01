import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../database/database.service';
import { ConnectionService } from '../connection/connection.service';
import { BackupType, BackupStatus, BackupStorageType, Backup } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';
import { ConnectionChecker } from 'src/connection/connection.checker';

@Injectable()
export class BackupService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly connectionService: ConnectionService,
        private readonly connectionChecker: ConnectionChecker
    ) { }

    async createBackup(
        userId: number,
        connectionUuid: string,
        data: {
            name: string;
            description?: string;
            type: BackupType;
            storageType: BackupStorageType;
            compression?: boolean;
            encrypted?: boolean;
            retentionDays?: number;
            containerIds?: string[];
            volumeIds?: string[];
            networkIds?: string[];
            tags?: string[];
        }
    ): Promise<Backup> {
        const connection = await this.connectionService.getConnectionByUuid(connectionUuid, userId);

        // Validate connection
        const connectionStatus = await this.connectionChecker.checkConnection(connection);
        if (!connectionStatus.isConnected) {
            throw new ServiceUnavailableException('Docker connection is not available');
        }

        // Create backup record
        const backup = await this.prisma.backup.create({
            data: {
                uuid: uuidv4(),
                name: data.name,
                description: data.description,
                type: data.type,
                status: BackupStatus.PENDING,
                storageType: data.storageType,
                storageLocation: this.generateStorageLocation(data.storageType, data.name),
                compression: data.compression ?? true,
                encrypted: data.encrypted ?? false,
                retentionDays: data.retentionDays ?? 30,
                containerIds: data.containerIds ?? [],
                volumeIds: data.volumeIds ?? [],
                networkIds: data.networkIds ?? [],
                tags: data.tags ?? [],
                size: 0, // Initial size, will be updated after backup completion
                connection: {
                    connect: {
                        id: connection.id
                    }
                }
            }
        });

        // Start backup process asynchronously
        this.processBackup(backup.id).catch(error => {
            console.error(`Backup process failed for backup ${backup.id}:`, error);
        });

        return backup;
    }

    private async processBackup(backupId: number): Promise<void> {
        try {
            // Update status to IN_PROGRESS
            await this.prisma.backup.update({
                where: { id: backupId },
                data: { status: BackupStatus.IN_PROGRESS }
            });

            const backup = await this.prisma.backup.findUnique({
                where: { id: backupId },
                include: { connection: true }
            });

            if (!backup) {
                throw new NotFoundException(`Backup ${backupId} not found`);
            }

            // Perform backup based on type
            switch (backup.type) {
                case BackupType.FULL:
                    await this.performFullBackup(backup);
                    break;
                case BackupType.INCREMENTAL:
                    await this.performIncrementalBackup(backup);
                    break;
                case BackupType.SNAPSHOT:
                    await this.performSnapshotBackup(backup);
                    break;
            }

            // Update status to COMPLETED
            await this.prisma.backup.update({
                where: { id: backupId },
                data: {
                    status: BackupStatus.COMPLETED,
                    completedAt: new Date()
                }
            });
        } catch (error) {
            // Update status to FAILED
            await this.prisma.backup.update({
                where: { id: backupId },
                data: {
                    status: BackupStatus.FAILED,
                    completedAt: new Date()
                }
            });
            throw error;
        }
    }

    private async performFullBackup(backup: Backup): Promise<void> {
        // Implementation for full backup
        // 1. Export container configurations
        // 2. Export volumes
        // 3. Export networks
        // 4. Compress if needed
        // 5. Encrypt if needed
        // 6. Store in specified location
    }

    private async performIncrementalBackup(backup: Backup): Promise<void> {
        // Implementation for incremental backup
        // 1. Find last full backup
        // 2. Calculate changes since last backup
        // 3. Backup only changed components
    }

    private async performSnapshotBackup(backup: Backup): Promise<void> {
        // Implementation for snapshot backup
        // 1. Create container snapshots
        // 2. Create volume snapshots
        // 3. Store metadata
    }

    private generateStorageLocation(storageType: BackupStorageType, name: string): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseName = `${name}-${timestamp}`;

        switch (storageType) {
            case BackupStorageType.LOCAL:
                return path.join('backups', 'local', baseName);
            case BackupStorageType.S3:
                return `s3://backups/${baseName}`;
            case BackupStorageType.AZURE_BLOB:
                return `azure://backups/${baseName}`;
            case BackupStorageType.GOOGLE_CLOUD:
                return `gs://backups/${baseName}`;
            case BackupStorageType.FTP:
                return `/backups/${baseName}`;
            case BackupStorageType.SFTP:
                return `/backups/${baseName}`;
            default:
                throw new Error(`Unsupported storage type: ${storageType}`);
        }
    }

    async listBackups(
        userId: number,
        connectionUuid: string,
        filters?: {
            type?: BackupType;
            status?: BackupStatus;
            tags?: string[];
            from?: Date;
            to?: Date;
        }
    ): Promise<Backup[]> {
        const connection = await this.connectionService.getConnectionByUuid(connectionUuid, userId);

        return this.prisma.backup.findMany({
            where: {
                connectionId: connection.id,
                ...(filters?.type && { type: filters.type }),
                ...(filters?.status && { status: filters.status }),
                ...(filters?.tags && { tags: { hasEvery: filters.tags } }),
                ...(filters?.from && { startedAt: { gte: filters.from } }),
                ...(filters?.to && { startedAt: { lte: filters.to } })
            },
            orderBy: { startedAt: 'desc' }
        });
    }

    async getBackupDetails(userId: number, connectionUuid: string, backupUuid: string): Promise<Backup> {
        const connection = await this.connectionService.getConnectionByUuid(connectionUuid, userId);

        const backup = await this.prisma.backup.findFirst({
            where: {
                uuid: backupUuid,
                connectionId: connection.id
            }
        });

        if (!backup) {
            throw new NotFoundException(`Backup ${backupUuid} not found`);
        }

        return backup;
    }

    async deleteBackup(userId: number, connectionUuid: string, backupUuid: string): Promise<void> {
        const connection = await this.connectionService.getConnectionByUuid(connectionUuid, userId);

        const backup = await this.prisma.backup.findFirst({
            where: {
                uuid: backupUuid,
                connectionId: connection.id
            }
        });

        if (!backup) {
            throw new NotFoundException(`Backup ${backupUuid} not found`);
        }

        // Delete backup files based on storage type
        await this.deleteBackupFiles(backup);

        // Delete backup record
        await this.prisma.backup.delete({
            where: { id: backup.id }
        });
    }

    private async deleteBackupFiles(backup: Backup): Promise<void> {
        switch (backup.storageType) {
            case BackupStorageType.LOCAL:
                await fs.unlink(backup.storageLocation).catch(() => { });
                break;
            case BackupStorageType.S3:
                // Implement S3 deletion
                break;
            case BackupStorageType.AZURE_BLOB:
                // Implement Azure deletion
                break;
            case BackupStorageType.GOOGLE_CLOUD:
                // Implement GCP deletion
                break;
            case BackupStorageType.FTP:
            case BackupStorageType.SFTP:
                // Implement FTP/SFTP deletion
                break;
        }
    }

    async verifyBackup(userId: number, connectionUuid: string, backupUuid: string): Promise<boolean> {
        const backup = await this.getBackupDetails(userId, connectionUuid, backupUuid);

        try {
            // Verify backup integrity
            const isValid = await this.verifyBackupIntegrity(backup);

            // Update verification status
            await this.prisma.backup.update({
                where: { id: backup.id },
                data: {
                    status: isValid ? BackupStatus.VERIFIED : BackupStatus.CORRUPTED,
                    lastVerifiedAt: new Date()
                }
            });

            return isValid;
        } catch (error) {
            await this.prisma.backup.update({
                where: { id: backup.id },
                data: {
                    status: BackupStatus.CORRUPTED,
                    lastVerifiedAt: new Date()
                }
            });
            return false;
        }
    }

    private async verifyBackupIntegrity(backup: Backup): Promise<boolean> {
        // Implement backup verification logic based on storage type and backup type
        return true; // Placeholder
    }
}
