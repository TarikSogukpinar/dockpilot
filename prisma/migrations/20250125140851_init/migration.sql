/*
  Warnings:

  - You are about to drop the column `userId` on the `images` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[connectionId,imageId]` on the table `images` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_userId_fkey";

-- DropIndex
DROP INDEX "images_userId_idx";

-- AlterTable
ALTER TABLE "images" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "images_connectionId_imageId_key" ON "images"("connectionId", "imageId");
