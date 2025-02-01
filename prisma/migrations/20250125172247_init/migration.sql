-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('FULL', 'INCREMENTAL', 'SNAPSHOT');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'VERIFIED', 'CORRUPTED');

-- CreateEnum
CREATE TYPE "BackupStorageType" AS ENUM ('LOCAL', 'S3', 'AZURE_BLOB', 'GOOGLE_CLOUD', 'FTP', 'SFTP');

-- CreateEnum
CREATE TYPE "RestoreStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'VALIDATED');

-- CreateTable
CREATE TABLE "backups" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "BackupType" NOT NULL,
    "status" "BackupStatus" NOT NULL DEFAULT 'PENDING',
    "storageType" "BackupStorageType" NOT NULL,
    "storageLocation" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "compression" BOOLEAN NOT NULL DEFAULT true,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "encryptionKey" TEXT,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "containerIds" TEXT[],
    "volumeIds" TEXT[],
    "networkIds" TEXT[],
    "metadata" JSONB,
    "tags" TEXT[],
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "lastVerifiedAt" TIMESTAMP(3),
    "connectionId" INTEGER NOT NULL,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restores" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "RestoreStatus" NOT NULL DEFAULT 'PENDING',
    "targetEnv" TEXT,
    "overwriteExisting" BOOLEAN NOT NULL DEFAULT false,
    "selectedItems" JSONB,
    "restoredItems" JSONB,
    "errorLog" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "backupId" INTEGER NOT NULL,
    "connectionId" INTEGER NOT NULL,

    CONSTRAINT "restores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_schedules" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "cronExpression" TEXT NOT NULL,
    "backupType" "BackupType" NOT NULL,
    "retention" INTEGER NOT NULL DEFAULT 30,
    "compression" BOOLEAN NOT NULL DEFAULT true,
    "encryption" BOOLEAN NOT NULL DEFAULT false,
    "storageType" "BackupStorageType" NOT NULL,
    "storageConfig" JSONB,
    "includeContainers" BOOLEAN NOT NULL DEFAULT true,
    "includeVolumes" BOOLEAN NOT NULL DEFAULT true,
    "includeNetworks" BOOLEAN NOT NULL DEFAULT true,
    "specificItems" JSONB,
    "connectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),

    CONSTRAINT "backup_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "backups_uuid_key" ON "backups"("uuid");

-- CreateIndex
CREATE INDEX "backups_connectionId_idx" ON "backups"("connectionId");

-- CreateIndex
CREATE INDEX "backups_type_status_idx" ON "backups"("type", "status");

-- CreateIndex
CREATE INDEX "backups_startedAt_idx" ON "backups"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "restores_uuid_key" ON "restores"("uuid");

-- CreateIndex
CREATE INDEX "restores_backupId_idx" ON "restores"("backupId");

-- CreateIndex
CREATE INDEX "restores_connectionId_idx" ON "restores"("connectionId");

-- CreateIndex
CREATE INDEX "restores_status_idx" ON "restores"("status");

-- CreateIndex
CREATE UNIQUE INDEX "backup_schedules_uuid_key" ON "backup_schedules"("uuid");

-- CreateIndex
CREATE INDEX "backup_schedules_connectionId_idx" ON "backup_schedules"("connectionId");

-- CreateIndex
CREATE INDEX "backup_schedules_enabled_idx" ON "backup_schedules"("enabled");

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restores" ADD CONSTRAINT "restores_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "backups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restores" ADD CONSTRAINT "restores_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_schedules" ADD CONSTRAINT "backup_schedules_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
