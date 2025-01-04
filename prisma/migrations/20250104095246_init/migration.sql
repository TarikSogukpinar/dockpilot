/*
  Warnings:

  - You are about to drop the column `serverId` on the `Container` table. All the data in the column will be lost.
  - Added the required column `connectionId` to the `Container` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Container" DROP COLUMN "serverId",
ADD COLUMN     "connectionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "Connection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
