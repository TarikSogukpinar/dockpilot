-- CreateEnum
CREATE TYPE "ResourceMetricType" AS ENUM ('CPU', 'MEMORY', 'DISK_READ', 'DISK_WRITE', 'NETWORK_IN', 'NETWORK_OUT', 'PIDS');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

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

-- AddForeignKey
ALTER TABLE "resource_metrics" ADD CONSTRAINT "resource_metrics_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_limits" ADD CONSTRAINT "resource_limits_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_alerts" ADD CONSTRAINT "resource_alerts_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_optimizations" ADD CONSTRAINT "resource_optimizations_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
