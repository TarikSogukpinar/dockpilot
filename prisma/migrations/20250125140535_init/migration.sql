/*
  Warnings:

  - You are about to drop the `Connection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ComposeDeployment" DROP CONSTRAINT "ComposeDeployment_connectionId_fkey";

-- DropForeignKey
ALTER TABLE "Connection" DROP CONSTRAINT "Connection_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Container" DROP CONSTRAINT "Container_connectionId_fkey";

-- DropTable
DROP TABLE "Connection";

-- CreateTable
CREATE TABLE "connections" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "tlsConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
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
    "userId" INTEGER NOT NULL,
    "connectionId" INTEGER NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "connections_uuid_key" ON "connections"("uuid");

-- CreateIndex
CREATE INDEX "connections_userId_idx" ON "connections"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "images_uuid_key" ON "images"("uuid");

-- CreateIndex
CREATE INDEX "images_userId_idx" ON "images"("userId");

-- CreateIndex
CREATE INDEX "images_connectionId_idx" ON "images"("connectionId");

-- CreateIndex
CREATE INDEX "images_name_tag_idx" ON "images"("name", "tag");

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComposeDeployment" ADD CONSTRAINT "ComposeDeployment_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
