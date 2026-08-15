/*
  Warnings:

  - You are about to drop the column `contributionSeries` on the `GitHubCache` table. All the data in the column will be lost.
  - You are about to drop the column `contributions365` on the `GitHubCache` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GitHubCache" DROP COLUMN "contributionSeries",
DROP COLUMN "contributions365",
ADD COLUMN     "contributionCalendar" JSONB,
ADD COLUMN     "totalContributionsLastYear" INTEGER;
