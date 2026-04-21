-- CreateEnum
CREATE TYPE "ContentHubKind" AS ENUM ('VIDEO', 'STORY', 'SPEECH', 'ROAD_UPDATE', 'EXPLAINER', 'INTERVIEW');

-- AlterTable
ALTER TABLE "HomepageConfig" ADD COLUMN     "featuredHomepageVideoInboundId" TEXT;

-- AlterTable
ALTER TABLE "InboundContentItem" ADD COLUMN     "campaignPhase" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contentKind" "ContentHubKind",
ADD COLUMN     "contentSeries" TEXT,
ADD COLUMN     "countyFips" TEXT,
ADD COLUMN     "countySlug" TEXT,
ADD COLUMN     "featuredWeight" INTEGER,
ADD COLUMN     "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "playlistId" TEXT,
ADD COLUMN     "siteHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SyncedPost" ADD COLUMN     "campaignPhase" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contentKind" "ContentHubKind",
ADD COLUMN     "contentSeries" TEXT,
ADD COLUMN     "countyFips" TEXT,
ADD COLUMN     "countySlug" TEXT,
ADD COLUMN     "featuredRoadPreview" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "featuredWeight" INTEGER,
ADD COLUMN     "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "playlistId" TEXT;

-- CreateIndex
CREATE INDEX "InboundContentItem_sourcePlatform_siteHidden_reviewStatus_idx" ON "InboundContentItem"("sourcePlatform", "siteHidden", "reviewStatus");

-- CreateIndex
CREATE INDEX "SyncedPost_hidden_contentKind_publishedAt_idx" ON "SyncedPost"("hidden", "contentKind", "publishedAt");
