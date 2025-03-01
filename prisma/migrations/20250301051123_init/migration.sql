-- AlterTable
ALTER TABLE "connections" ADD COLUMN     "autoReconnect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "connectionTimeout" INTEGER NOT NULL DEFAULT 30000,
ADD COLUMN     "encryptedCredentials" TEXT,
ADD COLUMN     "encryptedCredentialsIv" TEXT;
