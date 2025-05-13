-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('CREATED', 'RUNNING', 'PAUSED', 'RESTARTING', 'REMOVING', 'EXITED', 'DEAD');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'GUEST');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('FREE', 'MEDIUM', 'PREMIUM');

-- CreateEnum
CREATE TYPE "NetworkDriver" AS ENUM ('BRIDGE', 'HOST', 'OVERLAY', 'MACVLAN', 'IPVLAN', 'NONE');

-- CreateEnum
CREATE TYPE "NetworkScope" AS ENUM ('LOCAL', 'SWARM', 'GLOBAL');

-- CreateEnum
CREATE TYPE "ResourceMetricType" AS ENUM ('CPU', 'MEMORY', 'DISK_READ', 'DISK_WRITE', 'NETWORK_IN', 'NETWORK_OUT', 'PIDS');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "VolumeDriver" AS ENUM ('LOCAL', 'NFS', 'CIFS', 'TMPFS', 'BIND');

-- CreateEnum
CREATE TYPE "VolumeScope" AS ENUM ('LOCAL', 'GLOBAL');

-- CreateEnum
CREATE TYPE "ContainerHealthStatus" AS ENUM ('HEALTHY', 'UNHEALTHY', 'STARTING', 'NONE');

-- CreateEnum
CREATE TYPE "ContainerRestartPolicy" AS ENUM ('NO', 'ALWAYS', 'ON_FAILURE', 'UNLESS_STOPPED');

-- CreateEnum
CREATE TYPE "ContainerAction" AS ENUM ('START', 'STOP', 'RESTART', 'PAUSE', 'UNPAUSE', 'KILL', 'RENAME', 'UPDATE');

-- CreateEnum
CREATE TYPE "BackupType" AS ENUM ('FULL', 'INCREMENTAL', 'SNAPSHOT');

-- CreateEnum
CREATE TYPE "BackupStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'VERIFIED', 'CORRUPTED');

-- CreateEnum
CREATE TYPE "BackupStorageType" AS ENUM ('LOCAL', 'S3', 'AZURE_BLOB', 'GOOGLE_CLOUD', 'FTP', 'SFTP');

-- CreateEnum
CREATE TYPE "RestoreStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'VALIDATED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "accountType" "AccountType" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "tlsConfig" JSONB,
    "autoReconnect" BOOLEAN NOT NULL DEFAULT false,
    "connectionTimeout" INTEGER NOT NULL DEFAULT 30000,
    "encryptedCredentials" TEXT,
    "encryptedCredentialsIv" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "containers" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "dockerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" "ContainerStatus" NOT NULL DEFAULT 'CREATED',
    "healthStatus" "ContainerHealthStatus" NOT NULL DEFAULT 'NONE',
    "restartPolicy" "ContainerRestartPolicy" NOT NULL DEFAULT 'NO',
    "restartCount" INTEGER NOT NULL DEFAULT 0,
    "exitCode" INTEGER,
    "command" TEXT,
    "entrypoint" TEXT,
    "workingDir" TEXT,
    "environment" JSONB,
    "ports" JSONB,
    "labels" JSONB,
    "connectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "composeDeploymentId" INTEGER,

    CONSTRAINT "containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_health_checks" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "test" TEXT[],
    "interval" INTEGER NOT NULL DEFAULT 30,
    "timeout" INTEGER NOT NULL DEFAULT 30,
    "retries" INTEGER NOT NULL DEFAULT 3,
    "startPeriod" INTEGER NOT NULL DEFAULT 0,
    "containerId" INTEGER NOT NULL,

    CONSTRAINT "container_health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_logs" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "containerId" INTEGER NOT NULL,

    CONSTRAINT "container_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_events" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "action" "ContainerAction" NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "containerId" INTEGER NOT NULL,

    CONSTRAINT "container_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blacklistedTokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklistedTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "jobTitle" TEXT,
    "department" TEXT,
    "website" TEXT,
    "github" TEXT,
    "dockerHub" TEXT,
    "defaultRegistryUrl" TEXT,
    "defaultImagePrefix" TEXT,
    "preferredNetwork" TEXT,
    "defaultRestartPolicy" TEXT,
    "totalContainers" INTEGER NOT NULL DEFAULT 0,
    "activeContainers" INTEGER NOT NULL DEFAULT 0,
    "totalConnections" INTEGER NOT NULL DEFAULT 0,
    "totalImages" INTEGER NOT NULL DEFAULT 0,
    "diskUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "containerAlerts" BOOLEAN NOT NULL DEFAULT true,
    "resourceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorTempSecret" TEXT,
    "apiKeyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSecurityScan" TIMESTAMP(3),
    "theme" TEXT DEFAULT 'light',
    "language" TEXT DEFAULT 'en',
    "timeZone" TEXT DEFAULT 'UTC',
    "lastLogin" TIMESTAMP(3),
    "lastActivity" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compose_deployments" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "composeContent" TEXT NOT NULL,
    "environmentVars" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "connectionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER NOT NULL,

    CONSTRAINT "compose_deployments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tag" TEXT NOT NULL DEFAULT 'latest',
    "imageId" TEXT NOT NULL,
    "registry" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pullCount" INTEGER NOT NULL DEFAULT 0,
    "lastPulled" TIMESTAMP(3),
    "digest" TEXT,
    "platform" TEXT,
    "labels" JSONB,
    "connectionId" INTEGER NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "networks" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "driver" "NetworkDriver" NOT NULL DEFAULT 'BRIDGE',
    "scope" "NetworkScope" NOT NULL DEFAULT 'LOCAL',
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "attachable" BOOLEAN NOT NULL DEFAULT true,
    "ingress" BOOLEAN NOT NULL DEFAULT false,
    "ipam" JSONB,
    "options" JSONB,
    "labels" JSONB,
    "enableIPv6" BOOLEAN NOT NULL DEFAULT false,
    "subnet" TEXT,
    "gateway" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "connectionId" INTEGER NOT NULL,

    CONSTRAINT "networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_metrics" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" "ResourceMetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "containerId" INTEGER NOT NULL,

    CONSTRAINT "resource_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_limits" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" "ResourceMetricType" NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "minValue" DOUBLE PRECISION,
    "softLimit" DOUBLE PRECISION,
    "hardLimit" DOUBLE PRECISION,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "containerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_alerts" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "type" "ResourceMetricType" NOT NULL,
    "message" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "containerId" INTEGER NOT NULL,

    CONSTRAINT "resource_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_optimizations" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "containerId" INTEGER NOT NULL,
    "suggestion" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "suggestedValue" DOUBLE PRECISION,
    "metric" "ResourceMetricType" NOT NULL,
    "implemented" BOOLEAN NOT NULL DEFAULT false,
    "implementedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_optimizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volumes" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "driver" "VolumeDriver" NOT NULL DEFAULT 'LOCAL',
    "scope" "VolumeScope" NOT NULL DEFAULT 'LOCAL',
    "mountpoint" TEXT,
    "options" JSONB,
    "labels" JSONB,
    "size" INTEGER,
    "usedSize" INTEGER,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "connectionId" INTEGER NOT NULL,

    CONSTRAINT "volumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volume_backups" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "volumeId" INTEGER NOT NULL,

    CONSTRAINT "volume_backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volume_snapshots" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "volumeId" INTEGER NOT NULL,

    CONSTRAINT "volume_snapshots_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "_ContainerToVolume" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ContainerToVolume_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ContainerToNetwork" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ContainerToNetwork_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uuid_key" ON "users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "connections_uuid_key" ON "connections"("uuid");

-- CreateIndex
CREATE INDEX "connections_userId_idx" ON "connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "containers_uuid_key" ON "containers"("uuid");

-- CreateIndex
CREATE INDEX "containers_connectionId_idx" ON "containers"("connectionId");

-- CreateIndex
CREATE INDEX "containers_status_idx" ON "containers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "container_health_checks_uuid_key" ON "container_health_checks"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "container_health_checks_containerId_key" ON "container_health_checks"("containerId");

-- CreateIndex
CREATE UNIQUE INDEX "container_logs_uuid_key" ON "container_logs"("uuid");

-- CreateIndex
CREATE INDEX "container_logs_containerId_timestamp_idx" ON "container_logs"("containerId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "container_events_uuid_key" ON "container_events"("uuid");

-- CreateIndex
CREATE INDEX "container_events_containerId_timestamp_idx" ON "container_events"("containerId", "timestamp");

-- CreateIndex
CREATE INDEX "logs_userId_idx" ON "logs"("userId");

-- CreateIndex
CREATE INDEX "logs_serverId_idx" ON "logs"("serverId");

-- CreateIndex
CREATE UNIQUE INDEX "blacklistedTokens_token_key" ON "blacklistedTokens"("token");

-- CreateIndex
CREATE INDEX "blacklistedTokens_expiresAt_idx" ON "blacklistedTokens"("expiresAt");

-- CreateIndex
CREATE INDEX "blacklistedTokens_token_idx" ON "blacklistedTokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_uuid_key" ON "profiles"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_userId_idx" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "compose_deployments_uuid_key" ON "compose_deployments"("uuid");

-- CreateIndex
CREATE INDEX "compose_deployments_connectionId_idx" ON "compose_deployments"("connectionId");

-- CreateIndex
CREATE INDEX "compose_deployments_createdBy_idx" ON "compose_deployments"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "images_uuid_key" ON "images"("uuid");

-- CreateIndex
CREATE INDEX "images_connectionId_idx" ON "images"("connectionId");

-- CreateIndex
CREATE INDEX "images_name_tag_idx" ON "images"("name", "tag");

-- CreateIndex
CREATE UNIQUE INDEX "images_connectionId_imageId_key" ON "images"("connectionId", "imageId");

-- CreateIndex
CREATE UNIQUE INDEX "networks_uuid_key" ON "networks"("uuid");

-- CreateIndex
CREATE INDEX "networks_connectionId_idx" ON "networks"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "resource_metrics_uuid_key" ON "resource_metrics"("uuid");

-- CreateIndex
CREATE INDEX "resource_metrics_containerId_timestamp_idx" ON "resource_metrics"("containerId", "timestamp");

-- CreateIndex
CREATE INDEX "resource_metrics_type_timestamp_idx" ON "resource_metrics"("type", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "resource_limits_uuid_key" ON "resource_limits"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "resource_limits_containerId_type_key" ON "resource_limits"("containerId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "resource_alerts_uuid_key" ON "resource_alerts"("uuid");

-- CreateIndex
CREATE INDEX "resource_alerts_containerId_timestamp_idx" ON "resource_alerts"("containerId", "timestamp");

-- CreateIndex
CREATE INDEX "resource_alerts_severity_resolved_idx" ON "resource_alerts"("severity", "resolved");

-- CreateIndex
CREATE UNIQUE INDEX "resource_optimizations_uuid_key" ON "resource_optimizations"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "volumes_uuid_key" ON "volumes"("uuid");

-- CreateIndex
CREATE INDEX "volumes_connectionId_idx" ON "volumes"("connectionId");

-- CreateIndex
CREATE UNIQUE INDEX "volume_backups_uuid_key" ON "volume_backups"("uuid");

-- CreateIndex
CREATE INDEX "volume_backups_volumeId_idx" ON "volume_backups"("volumeId");

-- CreateIndex
CREATE UNIQUE INDEX "volume_snapshots_uuid_key" ON "volume_snapshots"("uuid");

-- CreateIndex
CREATE INDEX "volume_snapshots_volumeId_idx" ON "volume_snapshots"("volumeId");

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

-- CreateIndex
CREATE INDEX "_ContainerToVolume_B_index" ON "_ContainerToVolume"("B");

-- CreateIndex
CREATE INDEX "_ContainerToNetwork_B_index" ON "_ContainerToNetwork"("B");

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_composeDeploymentId_fkey" FOREIGN KEY ("composeDeploymentId") REFERENCES "compose_deployments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_health_checks" ADD CONSTRAINT "container_health_checks_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_logs" ADD CONSTRAINT "container_logs_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_events" ADD CONSTRAINT "container_events_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compose_deployments" ADD CONSTRAINT "compose_deployments_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compose_deployments" ADD CONSTRAINT "compose_deployments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "networks" ADD CONSTRAINT "networks_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_metrics" ADD CONSTRAINT "resource_metrics_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_limits" ADD CONSTRAINT "resource_limits_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_alerts" ADD CONSTRAINT "resource_alerts_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_optimizations" ADD CONSTRAINT "resource_optimizations_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volumes" ADD CONSTRAINT "volumes_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volume_backups" ADD CONSTRAINT "volume_backups_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volume_snapshots" ADD CONSTRAINT "volume_snapshots_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restores" ADD CONSTRAINT "restores_backupId_fkey" FOREIGN KEY ("backupId") REFERENCES "backups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restores" ADD CONSTRAINT "restores_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backup_schedules" ADD CONSTRAINT "backup_schedules_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToVolume" ADD CONSTRAINT "_ContainerToVolume_A_fkey" FOREIGN KEY ("A") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToVolume" ADD CONSTRAINT "_ContainerToVolume_B_fkey" FOREIGN KEY ("B") REFERENCES "volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToNetwork" ADD CONSTRAINT "_ContainerToNetwork_A_fkey" FOREIGN KEY ("A") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToNetwork" ADD CONSTRAINT "_ContainerToNetwork_B_fkey" FOREIGN KEY ("B") REFERENCES "networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
