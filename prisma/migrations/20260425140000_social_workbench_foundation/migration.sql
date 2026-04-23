-- CampaignOS Phase 2: Social Workbench foundation (SocialContentItem, SocialPlatformVariant, SocialAccount + CampaignTask link).

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM (
  'FACEBOOK',
  'INSTAGRAM',
  'X',
  'TIKTOK',
  'YOUTUBE',
  'BLUESKY',
  'THREADS',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "SocialContentStatus" AS ENUM (
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHING',
  'PUBLISHED',
  'ARCHIVED',
  'CANCELLED'
);

-- CreateEnum
CREATE TYPE "SocialVariantStatus" AS ENUM (
  'DRAFT',
  'READY',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
  'CANCELLED'
);

-- CreateEnum
CREATE TYPE "SocialContentKind" AS ENUM (
  'EVENT_PROMO',
  'RAPID_RESPONSE',
  'POST_EVENT_RECAP',
  'CLIP_REPURPOSE',
  'ORGANIC',
  'OTHER'
);

-- CreateTable
CREATE TABLE "SocialAccount" (
  "id" TEXT NOT NULL,
  "platform" "SocialPlatform" NOT NULL,
  "label" TEXT NOT NULL,
  "handle" TEXT,
  "externalId" TEXT,
  "profileUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialContentItem" (
  "id" TEXT NOT NULL,
  "workflowIntakeId" TEXT,
  "campaignEventId" TEXT,
  "kind" "SocialContentKind" NOT NULL DEFAULT 'OTHER',
  "status" "SocialContentStatus" NOT NULL DEFAULT 'DRAFT',
  "title" TEXT,
  "bodyCopy" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SocialContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialPlatformVariant" (
  "id" TEXT NOT NULL,
  "socialContentItemId" TEXT NOT NULL,
  "socialAccountId" TEXT,
  "platform" "SocialPlatform" NOT NULL,
  "status" "SocialVariantStatus" NOT NULL DEFAULT 'DRAFT',
  "copyText" TEXT,
  "scheduledAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "externalPostId" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SocialPlatformVariant_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "CampaignTask" ADD COLUMN "socialContentItemId" TEXT;

-- CreateIndex
CREATE INDEX "SocialAccount_platform_isActive_idx" ON "SocialAccount"("platform", "isActive");

-- CreateIndex
CREATE INDEX "SocialAccount_handle_platform_idx" ON "SocialAccount"("handle", "platform");

-- CreateIndex
CREATE INDEX "SocialContentItem_workflowIntakeId_status_idx" ON "SocialContentItem"("workflowIntakeId", "status");

-- CreateIndex
CREATE INDEX "SocialContentItem_campaignEventId_status_idx" ON "SocialContentItem"("campaignEventId", "status");

-- CreateIndex
CREATE INDEX "SocialContentItem_status_kind_createdAt_idx" ON "SocialContentItem"("status", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "SocialContentItem_createdByUserId_idx" ON "SocialContentItem"("createdByUserId");

-- CreateIndex
CREATE INDEX "SocialPlatformVariant_socialContentItemId_platform_idx" ON "SocialPlatformVariant"("socialContentItemId", "platform");

-- CreateIndex
CREATE INDEX "SocialPlatformVariant_status_scheduledAt_idx" ON "SocialPlatformVariant"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "SocialPlatformVariant_socialAccountId_status_idx" ON "SocialPlatformVariant"("socialAccountId", "status");

-- CreateIndex
CREATE INDEX "SocialPlatformVariant_platform_status_idx" ON "SocialPlatformVariant"("platform", "status");

-- CreateIndex
CREATE INDEX "CampaignTask_socialContentItemId_status_idx" ON "CampaignTask"("socialContentItemId", "status");

-- AddForeignKey
ALTER TABLE "SocialContentItem" ADD CONSTRAINT "SocialContentItem_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialContentItem" ADD CONSTRAINT "SocialContentItem_campaignEventId_fkey" FOREIGN KEY ("campaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialContentItem" ADD CONSTRAINT "SocialContentItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPlatformVariant" ADD CONSTRAINT "SocialPlatformVariant_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialPlatformVariant" ADD CONSTRAINT "SocialPlatformVariant_socialAccountId_fkey" FOREIGN KEY ("socialAccountId") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
