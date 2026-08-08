/*
  Warnings:

  - You are about to drop the column `globalRanking` on the `LeetCodeCache` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "LeetCodeCache" DROP COLUMN "globalRanking",
ADD COLUMN     "contestGlobalRanking" INTEGER,
ADD COLUMN     "overallRanking" INTEGER;
