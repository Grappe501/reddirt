-- Social Workbench: performance snapshots + strategic insight row (campaign analytics, not vanity dashboards).

CREATE TYPE "SocialSentimentType" AS ENUM (
  'SUPPORTER',
  'CURIOUS',
  'SKEPTICAL',
  'CONFUSED',
  'HOSTILE',
  'MEDIA',
  'UNKNOWN'
);

CREATE TYPE "SocialPerformanceDataSource" AS ENUM (
  'MANUAL',
  'API_IMPORT',
  'ESTIMATE',
  'AGGREGATOR'
);

CREATE TABLE "SocialPerformanceSnapshot" (
  "id" TEXT NOT NULL,
  "socialContentItemId" TEXT NOT NULL,
  "socialPlatformVariantId" TEXT,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "impressions" INTEGER,
  "likes" INTEGER,
  "comments" INTEGER,
  "shares" INTEGER,
  "saves" INTEGER,
  "clickThroughs" INTEGER,
  "clickThroughRate" DOUBLE PRECISION,
  "videoCompletionRate" DOUBLE PRECISION,
  "engagementQualityScore" DOUBLE PRECISION,
  "dominantSentiment" "SocialSentimentType",
  "sentimentBreakdownJson" JSONB DEFAULT '{}',
  "conversionCampaignEventId" TEXT,
  "volunteerLeadCount" INTEGER,
  "dataSource" "SocialPerformanceDataSource" NOT NULL DEFAULT 'MANUAL',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialPerformanceSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialContentStrategicInsight" (
  "id" TEXT NOT NULL,
  "socialContentItemId" TEXT NOT NULL,
  "timingInsight" TEXT,
  "tonePerformance" TEXT,
  "retentionSignal" TEXT,
  "conversionSignal" TEXT,
  "aiCommentClassifyStub" TEXT,
  "aiSummarizePerformanceStub" TEXT,
  "aiSuggestImprovementsStub" TEXT,
  "lastAiRunAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SocialContentStrategicInsight_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialPerformanceSnapshot_socialContentItemId_periodStart_idx" ON "SocialPerformanceSnapshot"("socialContentItemId", "periodStart");
CREATE INDEX "SocialPerformanceSnapshot_socialPlatformVariantId_periodStart_idx" ON "SocialPerformanceSnapshot"("socialPlatformVariantId", "periodStart");
CREATE INDEX "SocialPerformanceSnapshot_conversionCampaignEventId_idx" ON "SocialPerformanceSnapshot"("conversionCampaignEventId");

CREATE UNIQUE INDEX "SocialContentStrategicInsight_socialContentItemId_key" ON "SocialContentStrategicInsight"("socialContentItemId");

ALTER TABLE "SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_socialPlatformVariantId_fkey" FOREIGN KEY ("socialPlatformVariantId") REFERENCES "SocialPlatformVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPerformanceSnapshot" ADD CONSTRAINT "SocialPerformanceSnapshot_conversionCampaignEventId_fkey" FOREIGN KEY ("conversionCampaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SocialContentStrategicInsight" ADD CONSTRAINT "SocialContentStrategicInsight_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
