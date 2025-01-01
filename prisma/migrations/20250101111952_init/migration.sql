/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR', 'GUEST');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('FREE', 'MEDIUM', 'PREMIUM');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessToken" TEXT,
ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'FREE',
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
