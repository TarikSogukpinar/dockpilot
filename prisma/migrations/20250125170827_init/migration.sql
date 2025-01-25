-- CreateEnum
CREATE TYPE "VolumeDriver" AS ENUM ('LOCAL', 'NFS', 'CIFS', 'TMPFS', 'BIND');

-- CreateEnum
CREATE TYPE "VolumeScope" AS ENUM ('LOCAL', 'GLOBAL');

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
CREATE TABLE "_ContainerToVolume" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ContainerToVolume_AB_pkey" PRIMARY KEY ("A","B")
);

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
CREATE INDEX "_ContainerToVolume_B_index" ON "_ContainerToVolume"("B");

-- AddForeignKey
ALTER TABLE "volumes" ADD CONSTRAINT "volumes_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volume_backups" ADD CONSTRAINT "volume_backups_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volume_snapshots" ADD CONSTRAINT "volume_snapshots_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToVolume" ADD CONSTRAINT "_ContainerToVolume_A_fkey" FOREIGN KEY ("A") REFERENCES "Container"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToVolume" ADD CONSTRAINT "_ContainerToVolume_B_fkey" FOREIGN KEY ("B") REFERENCES "volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
