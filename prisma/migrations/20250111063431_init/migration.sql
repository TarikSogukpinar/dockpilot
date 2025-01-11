/*
  Warnings:

  - The `status` column on the `Container` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('CREATED', 'RUNNING', 'PAUSED', 'RESTARTING', 'REMOVING', 'EXITED', 'DEAD');

-- AlterTable
ALTER TABLE "Container" DROP COLUMN "status",
ADD COLUMN     "status" "ContainerStatus" NOT NULL DEFAULT 'CREATED';
