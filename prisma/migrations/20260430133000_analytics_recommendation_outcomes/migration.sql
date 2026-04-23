-- Analytics → recommendation outcomes (traceability) + workflow intake provenance (stored on intake `metadata`).

-- CreateEnum
CREATE TYPE "AnalyticsRecommendationOutcomeStatus" AS ENUM (
  'GENERATED',
  'DRAFT_CREATED',
  'INTAKE_CREATED',
  'EXECUTED',
  'EVALUATED',
  'DISMISSED',
  'EXPIRED'
);

-- CreateTable
CREATE TABLE "AnalyticsRecommendationOutcome" (
  "id" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'analytics',
  "recommendationType" TEXT NOT NULL,
  "headline" TEXT NOT NULL,
  "confidence" DOUBLE PRECISION,
  "heuristicVersion" TEXT NOT NULL DEFAULT 'v1',
  "status" "AnalyticsRecommendationOutcomeStatus" NOT NULL DEFAULT 'GENERATED',
  "dateRangeStart" TIMESTAMP(3) NOT NULL,
  "dateRangeEnd" TIMESTAMP(3) NOT NULL,
  "platform" "SocialPlatform",
  "contentKind" "SocialContentKind",
  "toneMode" "SocialMessageToneMode",
  "eventId" TEXT,
  "sourceSocialContentItemId" TEXT,
  "provenanceJson" JSONB NOT NULL DEFAULT '{}',
  "createdSocialContentItemId" TEXT,
  "createdWorkflowIntakeId" TEXT,
  "executedSocialContentItemId" TEXT,
  "evaluatedAt" TIMESTAMP(3),
  "outcomeJson" JSONB,
  "notes" TEXT,
  CONSTRAINT "AnalyticsRecommendationOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsRecommendationOutcome_createdSocialContentItemId_key" ON "AnalyticsRecommendationOutcome"("createdSocialContentItemId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsRecommendationOutcome_createdWorkflowIntakeId_key" ON "AnalyticsRecommendationOutcome"("createdWorkflowIntakeId");

-- CreateIndex
CREATE INDEX "AnalyticsRecommendationOutcome_sourceSocialContentItemId_createdAt_idx" ON "AnalyticsRecommendationOutcome"("sourceSocialContentItemId", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsRecommendationOutcome_status_createdAt_idx" ON "AnalyticsRecommendationOutcome"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AnalyticsRecommendationOutcome_recommendationType_createdAt_idx" ON "AnalyticsRecommendationOutcome"("recommendationType", "createdAt");

-- AddForeignKey
ALTER TABLE "AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_sourceSocialContentItemId_fkey" FOREIGN KEY ("sourceSocialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_createdSocialContentItemId_fkey" FOREIGN KEY ("createdSocialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_createdWorkflowIntakeId_fkey" FOREIGN KEY ("createdWorkflowIntakeId") REFERENCES "WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsRecommendationOutcome" ADD CONSTRAINT "AnalyticsRecommendationOutcome_executedSocialContentItemId_fkey" FOREIGN KEY ("executedSocialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
