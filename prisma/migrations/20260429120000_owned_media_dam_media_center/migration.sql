-- Media Center (Lightroom-style DAM) — additive enums, asset fields, collections, review log, derivative job queue.
-- `MediaIngestBatch` remains the import batch table (UI copy: "Owned Media import batch").

-- CreateEnum
CREATE TYPE "OwnedMediaPickStatus" AS ENUM ('UNRATED', 'PICK', 'REJECT');

-- CreateEnum
CREATE TYPE "OwnedMediaColorLabel" AS ENUM ('NONE', 'RED', 'YELLOW', 'GREEN', 'BLUE', 'PURPLE');

-- CreateEnum
CREATE TYPE "OwnedMediaDerivativeType" AS ENUM (
  'ORIGINAL',
  'THUMBNAIL',
  'WEB_JPEG',
  'CROP_SQUARE',
  'CROP_PORTRAIT',
  'CROP_STORY',
  'VIDEO_PROXY',
  'VIDEO_POSTER',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "OwnedMediaDerivativeJobStatus" AS ENUM (
  'PLANNED',
  'QUEUED',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'SKIPPED'
);

-- AlterTable: import batch (additive)
ALTER TABLE "MediaIngestBatch" ADD COLUMN "clientBatchCode" TEXT;
ALTER TABLE "MediaIngestBatch" ADD COLUMN "metadataJson" JSONB;

CREATE UNIQUE INDEX "MediaIngestBatch_clientBatchCode_key" ON "MediaIngestBatch"("clientBatchCode");

-- AlterTable: canonical asset
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "originalFileName" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "rating" INTEGER;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "pickStatus" "OwnedMediaPickStatus" NOT NULL DEFAULT 'UNRATED';
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "colorLabel" "OwnedMediaColorLabel" NOT NULL DEFAULT 'NONE';
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "stackGroupId" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "parentAssetId" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "rootAssetId" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "derivativeType" "OwnedMediaDerivativeType" NOT NULL DEFAULT 'ORIGINAL';
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "approvedForPress" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "approvedForPublicSite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "staffReviewNotes" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "importDuplicateNote" TEXT;

ALTER TABLE "OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_parentAssetId_fkey" FOREIGN KEY ("parentAssetId") REFERENCES "OwnedMediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_rootAssetId_fkey" FOREIGN KEY ("rootAssetId") REFERENCES "OwnedMediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "OwnedMediaAsset_stackGroupId_idx" ON "OwnedMediaAsset"("stackGroupId");
CREATE INDEX "OwnedMediaAsset_pickStatus_reviewStatus_idx" ON "OwnedMediaAsset"("pickStatus", "reviewStatus");
CREATE INDEX "OwnedMediaAsset_colorLabel_idx" ON "OwnedMediaAsset"("colorLabel");
CREATE INDEX "OwnedMediaAsset_rating_idx" ON "OwnedMediaAsset"("rating");
CREATE INDEX "OwnedMediaAsset_isFavorite_idx" ON "OwnedMediaAsset"("isFavorite");
CREATE INDEX "OwnedMediaAsset_parentAssetId_idx" ON "OwnedMediaAsset"("parentAssetId");
CREATE INDEX "OwnedMediaAsset_rootAssetId_idx" ON "OwnedMediaAsset"("rootAssetId");
CREATE INDEX "OwnedMediaAsset_derivativeType_idx" ON "OwnedMediaAsset"("derivativeType");
CREATE INDEX "OwnedMediaAsset_approvedForPress_idx" ON "OwnedMediaAsset"("approvedForPress");
CREATE INDEX "OwnedMediaAsset_approvedForPublicSite_idx" ON "OwnedMediaAsset"("approvedForPublicSite");
CREATE INDEX "OwnedMediaAsset_countyId_pickStatus_capturedAt_idx" ON "OwnedMediaAsset"("countyId", "pickStatus", "capturedAt");

-- CreateTable
CREATE TABLE "OwnedMediaCollection" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isSmart" BOOLEAN NOT NULL DEFAULT false,
  "filterJson" JSONB,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPinned" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OwnedMediaCollection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OwnedMediaCollection_slug_key" ON "OwnedMediaCollection"("slug");
CREATE INDEX "OwnedMediaCollection_sortOrder_name_idx" ON "OwnedMediaCollection"("sortOrder", "name");

-- CreateTable
CREATE TABLE "OwnedMediaCollectionItem" (
  "id" TEXT NOT NULL,
  "collectionId" TEXT NOT NULL,
  "ownedMediaId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OwnedMediaCollectionItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OwnedMediaCollectionItem_collectionId_ownedMediaId_key" ON "OwnedMediaCollectionItem"("collectionId", "ownedMediaId");
CREATE INDEX "OwnedMediaCollectionItem_ownedMediaId_idx" ON "OwnedMediaCollectionItem"("ownedMediaId");
CREATE INDEX "OwnedMediaCollectionItem_collectionId_sortOrder_idx" ON "OwnedMediaCollectionItem"("collectionId", "sortOrder");

ALTER TABLE "OwnedMediaCollectionItem" ADD CONSTRAINT "OwnedMediaCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "OwnedMediaCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OwnedMediaCollectionItem" ADD CONSTRAINT "OwnedMediaCollectionItem_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "OwnedMediaReviewLog" (
  "id" TEXT NOT NULL,
  "ownedMediaId" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "fromSnapshot" JSONB,
  "toSnapshot" JSONB,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OwnedMediaReviewLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OwnedMediaReviewLog_ownedMediaId_createdAt_idx" ON "OwnedMediaReviewLog"("ownedMediaId", "createdAt");
CREATE INDEX "OwnedMediaReviewLog_userId_createdAt_idx" ON "OwnedMediaReviewLog"("userId", "createdAt");

ALTER TABLE "OwnedMediaReviewLog" ADD CONSTRAINT "OwnedMediaReviewLog_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OwnedMediaReviewLog" ADD CONSTRAINT "OwnedMediaReviewLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "OwnedMediaDerivativeJob" (
  "id" TEXT NOT NULL,
  "sourceAssetId" TEXT NOT NULL,
  "targetDerivativeType" "OwnedMediaDerivativeType" NOT NULL,
  "status" "OwnedMediaDerivativeJobStatus" NOT NULL DEFAULT 'PLANNED',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "payloadJson" JSONB,
  "lastError" TEXT,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OwnedMediaDerivativeJob_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OwnedMediaDerivativeJob_sourceAssetId_status_idx" ON "OwnedMediaDerivativeJob"("sourceAssetId", "status");
CREATE INDEX "OwnedMediaDerivativeJob_status_priority_idx" ON "OwnedMediaDerivativeJob"("status", "priority");

ALTER TABLE "OwnedMediaDerivativeJob" ADD CONSTRAINT "OwnedMediaDerivativeJob_sourceAssetId_fkey" FOREIGN KEY ("sourceAssetId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_rating_check" CHECK ("rating" IS NULL OR ("rating" >= 0 AND "rating" <= 5));
