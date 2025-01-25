/*
  Warnings:

  - You are about to drop the `Container` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ContainerHealthStatus" AS ENUM ('HEALTHY', 'UNHEALTHY', 'STARTING', 'NONE');

-- CreateEnum
CREATE TYPE "ContainerRestartPolicy" AS ENUM ('NO', 'ALWAYS', 'ON_FAILURE', 'UNLESS_STOPPED');

-- CreateEnum
CREATE TYPE "ContainerAction" AS ENUM ('START', 'STOP', 'RESTART', 'PAUSE', 'UNPAUSE', 'KILL', 'RENAME', 'UPDATE');

-- DropForeignKey
ALTER TABLE "Container" DROP CONSTRAINT "Container_composeDeploymentId_fkey";

-- DropForeignKey
ALTER TABLE "Container" DROP CONSTRAINT "Container_connectionId_fkey";

-- DropForeignKey
ALTER TABLE "_ContainerToNetwork" DROP CONSTRAINT "_ContainerToNetwork_A_fkey";

-- DropForeignKey
ALTER TABLE "_ContainerToVolume" DROP CONSTRAINT "_ContainerToVolume_A_fkey";

-- DropForeignKey
ALTER TABLE "resource_alerts" DROP CONSTRAINT "resource_alerts_containerId_fkey";

-- DropForeignKey
ALTER TABLE "resource_limits" DROP CONSTRAINT "resource_limits_containerId_fkey";

-- DropForeignKey
ALTER TABLE "resource_metrics" DROP CONSTRAINT "resource_metrics_containerId_fkey";

-- DropForeignKey
ALTER TABLE "resource_optimizations" DROP CONSTRAINT "resource_optimizations_containerId_fkey";

-- DropTable
DROP TABLE "Container";

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

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_composeDeploymentId_fkey" FOREIGN KEY ("composeDeploymentId") REFERENCES "ComposeDeployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_health_checks" ADD CONSTRAINT "container_health_checks_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_logs" ADD CONSTRAINT "container_logs_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_events" ADD CONSTRAINT "container_events_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_metrics" ADD CONSTRAINT "resource_metrics_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_limits" ADD CONSTRAINT "resource_limits_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_alerts" ADD CONSTRAINT "resource_alerts_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_optimizations" ADD CONSTRAINT "resource_optimizations_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToVolume" ADD CONSTRAINT "_ContainerToVolume_A_fkey" FOREIGN KEY ("A") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToNetwork" ADD CONSTRAINT "_ContainerToNetwork_A_fkey" FOREIGN KEY ("A") REFERENCES "containers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
