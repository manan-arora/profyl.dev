/*
  Warnings:

  - You are about to drop the column `detectedCapabilities` on the `Repository` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Tier" ADD VALUE 'EXCEPTIONAL';
ALTER TYPE "Tier" ADD VALUE 'STRONG';
ALTER TYPE "Tier" ADD VALUE 'SOLID';
ALTER TYPE "Tier" ADD VALUE 'GROWING';

-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "detectedCapabilities",
ADD COLUMN     "defaultBranch" TEXT NOT NULL DEFAULT 'main',
ADD COLUMN     "detectedSignals" JSONB;
