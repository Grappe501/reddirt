-- Phase 5 campaign projects: lightweight Asana-style project layer for multi-lane ops pushes.

CREATE TYPE "CampaignProjectStatus" AS ENUM (
  'PLANNING',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'ARCHIVED'
);

CREATE TYPE "CampaignProjectOwnerKind" AS ENUM (
  'campaign_manager',
  'lane_lead',
  'county_chair',
  'leader'
);

CREATE TABLE "CampaignProject" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "CampaignProjectStatus" NOT NULL DEFAULT 'PLANNING',
  "ownerKind" "CampaignProjectOwnerKind" NOT NULL DEFAULT 'lane_lead',
  "ownerRole" TEXT,
  "laneId" TEXT,
  "countySlug" TEXT,
  "leaderSlug" TEXT,
  "targetStartAt" TIMESTAMP(3),
  "targetEndAt" TIMESTAMP(3),
  "metadataJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CampaignProject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CampaignProject_slug_key" ON "CampaignProject"("slug");
CREATE INDEX "CampaignProject_status_targetEndAt_idx" ON "CampaignProject"("status", "targetEndAt");
CREATE INDEX "CampaignProject_laneId_status_idx" ON "CampaignProject"("laneId", "status");

ALTER TABLE "CampaignTask" ADD COLUMN "campaignProjectId" TEXT;

ALTER TABLE "CampaignTask"
  ADD CONSTRAINT "CampaignTask_campaignProjectId_fkey"
  FOREIGN KEY ("campaignProjectId") REFERENCES "CampaignProject"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "CampaignTask_campaignProjectId_status_idx" ON "CampaignTask"("campaignProjectId", "status");
