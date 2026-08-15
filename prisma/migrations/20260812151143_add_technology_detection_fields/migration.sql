-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "detectedCapabilities" JSONB,
ADD COLUMN     "detectedTechnologies" JSONB;
