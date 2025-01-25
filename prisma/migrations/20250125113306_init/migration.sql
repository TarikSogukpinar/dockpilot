-- AlterTable
ALTER TABLE "Container" ADD COLUMN     "composeDeploymentId" INTEGER;

-- CreateTable
CREATE TABLE "Profile" (
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

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComposeDeployment" (
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

    CONSTRAINT "ComposeDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_uuid_key" ON "Profile"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ComposeDeployment_uuid_key" ON "ComposeDeployment"("uuid");

-- CreateIndex
CREATE INDEX "ComposeDeployment_connectionId_idx" ON "ComposeDeployment"("connectionId");

-- CreateIndex
CREATE INDEX "ComposeDeployment_createdBy_idx" ON "ComposeDeployment"("createdBy");

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_composeDeploymentId_fkey" FOREIGN KEY ("composeDeploymentId") REFERENCES "ComposeDeployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComposeDeployment" ADD CONSTRAINT "ComposeDeployment_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComposeDeployment" ADD CONSTRAINT "ComposeDeployment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
