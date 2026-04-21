-- New enums
CREATE TYPE "OwnedMediaStorageBackend" AS ENUM ('LOCAL_DISK', 'SUPABASE');
CREATE TYPE "GeoMetadataSource" AS ENUM ('NONE', 'EXIF', 'MANUAL', 'INFERRED', 'REVERSE_GEO');

-- Extend source type (append-only; Prisma uses labels, not order)
ALTER TYPE "OwnedMediaSourceType" ADD VALUE 'UPLOADED_CAMPAIGN';
ALTER TYPE "OwnedMediaSourceType" ADD VALUE 'SUPPORTER_UPLOAD';

-- New columns
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "storageBackend" "OwnedMediaStorageBackend" NOT NULL DEFAULT 'LOCAL_DISK';
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "thumbStorageKey" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "thumbPublicUrl" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "capturedAt" TIMESTAMP(3);
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "gpsLat" DOUBLE PRECISION;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "gpsLng" DOUBLE PRECISION;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "geoSource" "GeoMetadataSource" NOT NULL DEFAULT 'NONE';
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "geoConfidence" DOUBLE PRECISION;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "needsGeoReview" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "metadataJson" JSONB;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "consentCampaignUse" BOOLEAN;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "uploaderName" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "uploaderEmail" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "ingestContentSha256" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "localIngestRelativePath" TEXT;

-- Dedup hash (nullable unique: multiple NULLs allowed)
CREATE UNIQUE INDEX "OwnedMediaAsset_ingestContentSha256_key" ON "OwnedMediaAsset"("ingestContentSha256");

-- Additional indexes for county / geo / filters
CREATE INDEX "OwnedMediaAsset_countySlug_capturedAt_idx" ON "OwnedMediaAsset"("countySlug", "capturedAt");
CREATE INDEX "OwnedMediaAsset_city_capturedAt_idx" ON "OwnedMediaAsset"("city", "capturedAt");
CREATE INDEX "OwnedMediaAsset_capturedAt_idx" ON "OwnedMediaAsset"("capturedAt");
CREATE INDEX "OwnedMediaAsset_sourceType_reviewStatus_idx" ON "OwnedMediaAsset"("sourceType", "reviewStatus");
CREATE INDEX "OwnedMediaAsset_kind_capturedAt_idx" ON "OwnedMediaAsset"("kind", "capturedAt");
