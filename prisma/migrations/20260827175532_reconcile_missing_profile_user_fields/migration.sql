/*
  Warnings:

  - The values [READY_TO_PUBLISH] on the enum `ProfileStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProfileStatus_new" AS ENUM ('INCOMPLETE', 'DRAFT', 'PUBLISHED');
ALTER TABLE "User" ALTER COLUMN "profileStatus" TYPE "ProfileStatus_new" USING ("profileStatus"::text::"ProfileStatus_new");
ALTER TYPE "ProfileStatus" RENAME TO "ProfileStatus_old";
ALTER TYPE "ProfileStatus_new" RENAME TO "ProfileStatus";
DROP TYPE "public"."ProfileStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "location" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "name" TEXT;
