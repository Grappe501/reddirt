-- Ingested community fairs/festivals + AI coverage snapshots; FESTIVAL on CampaignEventType

ALTER TYPE "CampaignEventType" ADD VALUE 'FESTIVAL';

-- CreateEnum
CREATE TYPE "FestivalIngestReviewStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "FestivalSourceChannel" AS ENUM ('RSS', 'WEB', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE', 'MANUAL', 'OTHER');

-- CreateTable
CREATE TABLE "FestivalIngestRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "label" TEXT,
    "summaryJson" JSONB,
    "inserted" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,

    CONSTRAINT "FestivalIngestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArkansasFestivalIngest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "city" TEXT,
    "countyId" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "venueName" TEXT,
    "sourceChannel" "FestivalSourceChannel" NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceFingerprint" TEXT,
    "rawPayload" JSONB,
    "reviewStatus" "FestivalIngestReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "isVisibleOnSite" BOOLEAN NOT NULL DEFAULT false,
    "estimatedAttendance" INTEGER,
    "promotedCampaignEventId" TEXT,
    "ingestRunId" TEXT,
    "lastSeenInIngestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArkansasFestivalIngest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FestivalCoveragePlanSnapshot" (
    "id" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "modelName" TEXT,
    "payload" JSONB NOT NULL,

    CONSTRAINT "FestivalCoveragePlanSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArkansasFestivalIngest_sourceUrl_key" ON "ArkansasFestivalIngest"("sourceUrl");

-- CreateIndex
CREATE UNIQUE INDEX "ArkansasFestivalIngest_promotedCampaignEventId_key" ON "ArkansasFestivalIngest"("promotedCampaignEventId");

-- CreateIndex
CREATE INDEX "ArkansasFestivalIngest_startAt_reviewStatus_idx" ON "ArkansasFestivalIngest"("startAt", "reviewStatus");

-- CreateIndex
CREATE INDEX "ArkansasFestivalIngest_countyId_startAt_idx" ON "ArkansasFestivalIngest"("countyId", "startAt");

-- CreateIndex
CREATE INDEX "ArkansasFestivalIngest_isVisibleOnSite_startAt_reviewStatus_idx" ON "ArkansasFestivalIngest"("isVisibleOnSite", "startAt", "reviewStatus");

-- AddForeignKey
ALTER TABLE "ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_promotedCampaignEventId_fkey" FOREIGN KEY ("promotedCampaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArkansasFestivalIngest" ADD CONSTRAINT "ArkansasFestivalIngest_ingestRunId_fkey" FOREIGN KEY ("ingestRunId") REFERENCES "FestivalIngestRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
