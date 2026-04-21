-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN "width" INTEGER;
ALTER TABLE "MediaAsset" ADD COLUMN "height" INTEGER;

-- AlterTable
ALTER TABLE "HomepageConfig" ADD COLUMN "featuredEditorialSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
