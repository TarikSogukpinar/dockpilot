-- CreateEnum
CREATE TYPE "NetworkDriver" AS ENUM ('BRIDGE', 'HOST', 'OVERLAY', 'MACVLAN', 'IPVLAN', 'NONE');

-- CreateEnum
CREATE TYPE "NetworkScope" AS ENUM ('LOCAL', 'SWARM', 'GLOBAL');

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
CREATE TABLE "_ContainerToNetwork" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ContainerToNetwork_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "networks_uuid_key" ON "networks"("uuid");

-- CreateIndex
CREATE INDEX "networks_connectionId_idx" ON "networks"("connectionId");

-- CreateIndex
CREATE INDEX "_ContainerToNetwork_B_index" ON "_ContainerToNetwork"("B");

-- AddForeignKey
ALTER TABLE "networks" ADD CONSTRAINT "networks_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToNetwork" ADD CONSTRAINT "_ContainerToNetwork_A_fkey" FOREIGN KEY ("A") REFERENCES "Container"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContainerToNetwork" ADD CONSTRAINT "_ContainerToNetwork_B_fkey" FOREIGN KEY ("B") REFERENCES "networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
