import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { BackupType, BackupStatus, BackupStorageType } from '@prisma/client';
import { CustomRequest } from 'src/core/request/customRequest';

@Controller({ path: 'backup', version: '1' })
@ApiTags('Backup')
@ApiBearerAuth()
export class BackupController {
    constructor(private readonly backupService: BackupService) {}

    @Post(':connectionUuid/create')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Create a new backup' })
    @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
    async createBackup(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') connectionUuid: string,
        @Body() data: {
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
    ) {
        return this.backupService.createBackup(customRequest.user.id, connectionUuid, data);
    }

    @Get(':connectionUuid/list')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'List backups' })
    @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
    async listBackups(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') connectionUuid: string,
        @Query('type') type?: BackupType,
        @Query('status') status?: BackupStatus,
        @Query('tags') tags?: string,
        @Query('from') from?: Date,
        @Query('to') to?: Date
    ) {
        const parsedTags = tags ? tags.split(',') : undefined;
        return this.backupService.listBackups(
            customRequest.user.id,
            connectionUuid,
            { type, status, tags: parsedTags, from, to }
        );
    }

    @Get(':connectionUuid/:backupUuid')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get backup details' })
    @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
    @ApiParam({ name: 'backupUuid', description: 'Backup UUID' })
    async getBackupDetails(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') connectionUuid: string,
        @Param('backupUuid') backupUuid: string
    ) {
        return this.backupService.getBackupDetails(
            customRequest.user.id,
            connectionUuid,
            backupUuid
        );
    }

    @Delete(':connectionUuid/:backupUuid')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Delete a backup' })
    @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
    @ApiParam({ name: 'backupUuid', description: 'Backup UUID' })
    async deleteBackup(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') connectionUuid: string,
        @Param('backupUuid') backupUuid: string
    ) {
        return this.backupService.deleteBackup(
            customRequest.user.id,
            connectionUuid,
            backupUuid
        );
    }

    @Post(':connectionUuid/:backupUuid/verify')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Verify backup integrity' })
    @ApiParam({ name: 'connectionUuid', description: 'Connection UUID' })
    @ApiParam({ name: 'backupUuid', description: 'Backup UUID' })
    async verifyBackup(
        @Req() customRequest: CustomRequest,
        @Param('connectionUuid') connectionUuid: string,
        @Param('backupUuid') backupUuid: string
    ) {
        return this.backupService.verifyBackup(
            customRequest.user.id,
            connectionUuid,
            backupUuid
        );
    }
}
