-- CE-LEDGER-1: Campaign Event Fact Card persistence (additive).

CREATE TYPE "CampaignEventLedgerCreatedFrom" AS ENUM (
  'NORMALIZED_CALENDAR',
  'WEBSITE_ENTRY',
  'GOOGLE_CALENDAR',
  'MANUAL_ADMIN',
  'IMPORT'
);

CREATE TYPE "CampaignEventLedgerEventStatus" AS ENUM (
  'TENTATIVE',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NEEDS_REVIEW'
);

CREATE TYPE "CampaignEventLedgerCalendarStatus" AS ENUM (
  'TENTATIVE_CALENDAR',
  'OFFICIAL_CALENDAR',
  'UNSYNCED',
  'IMPORTED_ONLY'
);

CREATE TYPE "CampaignEventLedgerReviewStatus" AS ENUM (
  'NOT_STARTED',
  'IN_PROGRESS',
  'NEEDS_INFO',
  'READY'
);

CREATE TYPE "CampaignEventLedgerGoogleSyncStatus" AS ENUM (
  'NOT_LINKED',
  'PENDING',
  'SYNCED',
  'ERROR'
);

CREATE TYPE "CampaignEventKellyAttendanceMode" AS ENUM (
  'IN_PERSON',
  'ZOOM',
  'NOT_ATTENDING',
  'UNKNOWN'
);

CREATE TABLE "CampaignEventLedgerRecord" (
  "id" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "sourceKey" TEXT NOT NULL,
  "calendarSourceId" TEXT NOT NULL,
  "googleEventId" TEXT,
  "sourceCalendarName" TEXT,
  "createdFromSource" "CampaignEventLedgerCreatedFrom" NOT NULL DEFAULT 'NORMALIZED_CALENDAR',
  "entrySource" "CampaignEventLedgerCreatedFrom" NOT NULL DEFAULT 'NORMALIZED_CALENDAR',
  "originalTitle" TEXT NOT NULL,
  "originalNotes" TEXT,
  "originalLocation" TEXT,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3),
  "allDay" BOOLEAN NOT NULL DEFAULT false,
  "eventStatus" "CampaignEventLedgerEventStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "calendarStatus" "CampaignEventLedgerCalendarStatus" NOT NULL DEFAULT 'IMPORTED_ONLY',
  "reviewStatus" "CampaignEventLedgerReviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "tentativeCalendarId" TEXT,
  "officialCalendarId" TEXT,
  "googleSyncStatus" "CampaignEventLedgerGoogleSyncStatus" NOT NULL DEFAULT 'NOT_LINKED',
  "googleLastSyncedAt" TIMESTAMP(3),
  "googleEventUrl" TEXT,
  "displayCity" TEXT,
  "displayEventType" TEXT,
  "roundTripMiles" DECIMAL(10,1),
  "reimbursementAmount" DECIMAL(12,2),
  "factCard" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CampaignEventLedgerRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CampaignEventLedgerRecord_sourceKey_key" ON "CampaignEventLedgerRecord"("sourceKey");
CREATE UNIQUE INDEX "CampaignEventLedgerRecord_calendarSourceId_key" ON "CampaignEventLedgerRecord"("calendarSourceId");
CREATE UNIQUE INDEX "CampaignEventLedgerRecord_googleEventId_key" ON "CampaignEventLedgerRecord"("googleEventId");
CREATE INDEX "CampaignEventLedgerRecord_period_startAt_idx" ON "CampaignEventLedgerRecord"("period", "startAt");
CREATE INDEX "CampaignEventLedgerRecord_eventStatus_startAt_idx" ON "CampaignEventLedgerRecord"("eventStatus", "startAt");
CREATE INDEX "CampaignEventLedgerRecord_googleSyncStatus_idx" ON "CampaignEventLedgerRecord"("googleSyncStatus");
