-- CreateEnum
CREATE TYPE "CalendarSourceType" AS ENUM ('CAMPAIGN_MASTER', 'CANDIDATE_PUBLIC_APPEARANCES', 'TRAVEL_LOGISTICS', 'INTERNAL_STAFF_PLANNING', 'CONTENT_MEDIA', 'PERSONAL_OVERLAY');

-- AlterTable
ALTER TABLE "CalendarSource" ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "isPublicFacing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceType" "CalendarSourceType" NOT NULL DEFAULT 'INTERNAL_STAFF_PLANNING';

-- AlterTable
ALTER TABLE "CampaignEvent" ADD COLUMN     "googleSyncError" TEXT,
ADD COLUMN     "inboundTimeChangedAt" TIMESTAMP(3),
ADD COLUMN     "syncReviewNeeded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "CalendarSource_sourceType_isActive_syncEnabled_idx" ON "CalendarSource"("sourceType", "isActive", "syncEnabled");

-- CreateIndex
CREATE INDEX "CalendarSource_isPublicFacing_isActive_syncEnabled_idx" ON "CalendarSource"("isPublicFacing", "isActive", "syncEnabled");

-- CreateIndex
CREATE INDEX "CampaignEvent_googleSyncState_updatedAt_idx" ON "CampaignEvent"("googleSyncState", "updatedAt");
