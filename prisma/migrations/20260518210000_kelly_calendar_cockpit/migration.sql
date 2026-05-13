-- Kelly Calendar Cockpit — additive only (Kelly decisions, alerts, local coverage, promotion audit).

CREATE TYPE "KellyCockpitDecisionKind" AS ENUM ('APPROVE', 'MODIFY', 'SEND_LOCAL', 'HOLD', 'REJECT', 'ASK_STAFF');

CREATE TYPE "KellySurrogateTypePref" AS ENUM (
  'COUNTY_CHAIR',
  'COUNTY_PARTY_CONTACT',
  'TRUSTED_LOCAL',
  'VOLUNTEER',
  'LOCAL_ELECTED',
  'STAFF_CHOOSE'
);

CREATE TYPE "LocalCoverageRequestStatus" AS ENUM (
  'NEEDS_STAFF_FOLLOW_UP',
  'STAFF_ASSIGNED',
  'CONFIRMED',
  'CANCELLED'
);

CREATE TYPE "CalendarAlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TYPE "CalendarAlertChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

CREATE TYPE "CalendarAlertStatus" AS ENUM ('PENDING', 'READ', 'SNOOZED', 'DISMISSED');

CREATE TABLE "KellyCalendarDecision" (
  "id" TEXT NOT NULL,
  "calendarItemId" TEXT NOT NULL,
  "campaignEventId" TEXT,
  "decision" "KellyCockpitDecisionKind" NOT NULL,
  "decidedByUserId" TEXT NOT NULL,
  "notes" TEXT,
  "requestedDateChange" TIMESTAMP(3),
  "requestedTimeChange" TEXT,
  "requestedLocationChange" TEXT,
  "requestedSurrogateType" "KellySurrogateTypePref",
  "requestedSurrogateId" TEXT,
  "staffFollowUpRequired" BOOLEAN NOT NULL DEFAULT false,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "KellyCalendarDecision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KellyCalendarPromotion" (
  "id" TEXT NOT NULL,
  "calendarItemId" TEXT NOT NULL,
  "campaignEventId" TEXT NOT NULL,
  "promotedByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "KellyCalendarPromotion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LocalCoverageRequest" (
  "id" TEXT NOT NULL,
  "calendarItemId" TEXT NOT NULL,
  "campaignEventId" TEXT,
  "countyId" UUID,
  "requestedByUserId" TEXT NOT NULL,
  "surrogateType" "KellySurrogateTypePref" NOT NULL,
  "requestedSurrogateId" TEXT,
  "status" "LocalCoverageRequestStatus" NOT NULL DEFAULT 'NEEDS_STAFF_FOLLOW_UP',
  "notes" TEXT,
  "sourceDecisionId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LocalCoverageRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CalendarAlert" (
  "id" TEXT NOT NULL,
  "calendarItemId" TEXT NOT NULL,
  "campaignEventId" TEXT,
  "alertType" VARCHAR(96) NOT NULL,
  "severity" "CalendarAlertSeverity" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "dueAt" TIMESTAMP(3),
  "channel" "CalendarAlertChannel" NOT NULL DEFAULT 'IN_APP',
  "status" "CalendarAlertStatus" NOT NULL DEFAULT 'PENDING',
  "assignedToRole" TEXT,
  "assignedToUserId" TEXT,
  "snoozedUntil" TIMESTAMP(3),
  "dedupeKey" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CalendarAlert_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KellyCalendarPromotion_calendarItemId_key" ON "KellyCalendarPromotion"("calendarItemId");

CREATE UNIQUE INDEX "LocalCoverageRequest_sourceDecisionId_key" ON "LocalCoverageRequest"("sourceDecisionId");

CREATE UNIQUE INDEX "CalendarAlert_dedupeKey_key" ON "CalendarAlert"("dedupeKey");

CREATE INDEX "KellyCalendarDecision_calendarItemId_createdAt_idx" ON "KellyCalendarDecision"("calendarItemId", "createdAt");

CREATE INDEX "KellyCalendarDecision_campaignEventId_idx" ON "KellyCalendarDecision"("campaignEventId");

CREATE INDEX "KellyCalendarPromotion_campaignEventId_idx" ON "KellyCalendarPromotion"("campaignEventId");

CREATE INDEX "LocalCoverageRequest_calendarItemId_idx" ON "LocalCoverageRequest"("calendarItemId");

CREATE INDEX "LocalCoverageRequest_status_createdAt_idx" ON "LocalCoverageRequest"("status", "createdAt");

CREATE INDEX "CalendarAlert_calendarItemId_status_idx" ON "CalendarAlert"("calendarItemId", "status");

CREATE INDEX "CalendarAlert_status_dueAt_idx" ON "CalendarAlert"("status", "dueAt");

ALTER TABLE "KellyCalendarDecision"
  ADD CONSTRAINT "KellyCalendarDecision_campaignEventId_fkey"
  FOREIGN KEY ("campaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "KellyCalendarPromotion"
  ADD CONSTRAINT "KellyCalendarPromotion_campaignEventId_fkey"
  FOREIGN KEY ("campaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalCoverageRequest"
  ADD CONSTRAINT "LocalCoverageRequest_campaignEventId_fkey"
  FOREIGN KEY ("campaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LocalCoverageRequest"
  ADD CONSTRAINT "LocalCoverageRequest_countyId_fkey"
  FOREIGN KEY ("countyId") REFERENCES "counties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "LocalCoverageRequest"
  ADD CONSTRAINT "LocalCoverageRequest_sourceDecisionId_fkey"
  FOREIGN KEY ("sourceDecisionId") REFERENCES "KellyCalendarDecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CalendarAlert"
  ADD CONSTRAINT "CalendarAlert_campaignEventId_fkey"
  FOREIGN KEY ("campaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
