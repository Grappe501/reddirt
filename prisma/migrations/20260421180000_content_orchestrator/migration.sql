-- CreateEnum
CREATE TYPE "ContentPlatform" AS ENUM ('SUBSTACK', 'FACEBOOK', 'INSTAGRAM', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "PlatformConnectionStatus" AS ENUM ('INACTIVE', 'CONFIGURED', 'SYNCING', 'ERROR', 'OK');

-- CreateEnum
CREATE TYPE "InboundSourceType" AS ENUM ('ARTICLE', 'POST', 'NOTE', 'VIDEO', 'REEL', 'SHORT', 'COMMENT', 'PODCAST_EPISODE', 'LIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "InboundReviewStatus" AS ENUM ('PENDING', 'REVIEWED', 'FEATURED', 'SUPPRESSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentRoutingDestination" AS ENUM ('NONE', 'HOMEPAGE_RAIL', 'PUBLIC_UPDATES', 'BLOG', 'STORIES_SEED', 'EDITORIAL_SEED', 'MEDIA_LIBRARY', 'CAMPAIGN_BRIEF');

-- CreateEnum
CREATE TYPE "ContentDecisionStatus" AS ENUM ('NEW', 'REVIEWED', 'FEATURED', 'SUPPRESSED', 'ARCHIVED', 'ROUTED');

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN "originPlatform" "ContentPlatform",
ADD COLUMN "originExternalId" TEXT;

-- CreateTable
CREATE TABLE "PlatformConnection" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "platform" "ContentPlatform" NOT NULL,
    "status" "PlatformConnectionStatus" NOT NULL DEFAULT 'INACTIVE',
    "externalAccountId" TEXT,
    "accountName" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "lastSyncError" TEXT,
    "metadata" JSONB,

    CONSTRAINT "PlatformConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InboundContentItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourcePlatform" "ContentPlatform" NOT NULL,
    "sourceType" "InboundSourceType" NOT NULL DEFAULT 'ARTICLE',
    "externalId" TEXT NOT NULL,
    "authorName" TEXT,
    "title" TEXT,
    "body" TEXT,
    "excerpt" TEXT,
    "canonicalUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "mediaAssetId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metrics" JSONB,
    "rawPayload" JSONB,
    "syncTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "InboundReviewStatus" NOT NULL DEFAULT 'PENDING',
    "visibleOnUpdatesPage" BOOLEAN NOT NULL DEFAULT false,
    "visibleOnHomepageRail" BOOLEAN NOT NULL DEFAULT false,
    "routeToBlog" BOOLEAN NOT NULL DEFAULT false,
    "storySeed" BOOLEAN NOT NULL DEFAULT false,
    "editorialSeed" BOOLEAN NOT NULL DEFAULT false,
    "publishCandidate" BOOLEAN NOT NULL DEFAULT false,
    "syncedPostId" TEXT,

    CONSTRAINT "InboundContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentDecision" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inboundItemId" TEXT NOT NULL,
    "status" "ContentDecisionStatus" NOT NULL,
    "destination" "ContentRoutingDestination" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "editor" TEXT,

    CONSTRAINT "ContentDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformMetricSnapshot" (
    "id" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platformConnectionId" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,

    CONSTRAINT "PlatformMetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformConnection_platform_key" ON "PlatformConnection"("platform");

-- CreateIndex
CREATE INDEX "PlatformConnection_platform_status_idx" ON "PlatformConnection"("platform", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InboundContentItem_syncedPostId_key" ON "InboundContentItem"("syncedPostId");

-- CreateIndex
CREATE INDEX "InboundContentItem_sourcePlatform_reviewStatus_idx" ON "InboundContentItem"("sourcePlatform", "reviewStatus");

-- CreateIndex
CREATE INDEX "InboundContentItem_reviewStatus_visibleOnUpdatesPage_idx" ON "InboundContentItem"("reviewStatus", "visibleOnUpdatesPage");

-- CreateIndex
CREATE INDEX "InboundContentItem_publishedAt_idx" ON "InboundContentItem"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InboundContentItem_sourcePlatform_externalId_key" ON "InboundContentItem"("sourcePlatform", "externalId");

-- CreateIndex
CREATE INDEX "PlatformMetricSnapshot_platformConnectionId_capturedAt_idx" ON "PlatformMetricSnapshot"("platformConnectionId", "capturedAt");

-- AddForeignKey
ALTER TABLE "InboundContentItem" ADD CONSTRAINT "InboundContentItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundContentItem" ADD CONSTRAINT "InboundContentItem_syncedPostId_fkey" FOREIGN KEY ("syncedPostId") REFERENCES "SyncedPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentDecision" ADD CONSTRAINT "ContentDecision_inboundItemId_fkey" FOREIGN KEY ("inboundItemId") REFERENCES "InboundContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformMetricSnapshot" ADD CONSTRAINT "PlatformMetricSnapshot_platformConnectionId_fkey" FOREIGN KEY ("platformConnectionId") REFERENCES "PlatformConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
