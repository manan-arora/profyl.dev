/*
  Warnings:

  - The values [BRONZE,SILVER,GOLD,PLATINUM,DIAMOND] on the enum `Tier` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Tier_new" AS ENUM ('S', 'A', 'B', 'C');
ALTER TABLE "Analytics" ALTER COLUMN "tier" TYPE "Tier_new" USING ("tier"::text::"Tier_new");
ALTER TYPE "Tier" RENAME TO "Tier_old";
ALTER TYPE "Tier_new" RENAME TO "Tier";
DROP TYPE "public"."Tier_old";
COMMIT;
