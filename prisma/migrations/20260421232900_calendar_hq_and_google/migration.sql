-- CreateEnum
CREATE TYPE "EventWorkflowState" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'CANCELED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "GoogleEventSyncState" AS ENUM ('IDLE', 'PENDING_PUSH', 'PENDING_PULL', 'SYNCED', 'CONFLICT', 'ERROR');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('GOOGLE');

-- CreateEnum
CREATE TYPE "CalendarSourceVisibility" AS ENUM ('STAFF', 'MANAGER', 'PUBLIC_CONNECTOR');

-- CreateEnum
CREATE TYPE "EventApprovalState" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EventSyncDirection" AS ENUM ('PUSH_TO_GOOGLE', 'PULL_FROM_GOOGLE', 'WATCH_PING');

-- CreateEnum
CREATE TYPE "EventSyncLogStatus" AS ENUM ('OK', 'ERROR', 'SKIPPED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_REMINDER_DUE';
ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_EVENT_CHANGED';
ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_CANCELLATION_NOTICE';
ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_RSVP_FOLLOWUP';
ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_THANK_YOU_FOLLOWUP';
ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_COUNTY_LEAD_MISSING';
ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_MEDIA_CAPTURE_MISSING';
ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_COMMS_PREP_MISSING';
ALTER TYPE "CommunicationActionType" ADD VALUE 'CAL_STAFFING_GAP';

-- AlterTable
ALTER TABLE "CampaignEvent" ADD COLUMN     "calendarSourceId" TEXT,
ADD COLUMN     "commsStateJson" JSONB DEFAULT '{}',
ADD COLUMN     "eventWorkflowState" "EventWorkflowState" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "googleEtag" TEXT,
ADD COLUMN     "googleEventId" TEXT,
ADD COLUMN     "googleSyncState" "GoogleEventSyncState" NOT NULL DEFAULT 'IDLE',
ADD COLUMN     "isPublicOnWebsite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastAiScanAt" TIMESTAMP(3),
ADD COLUMN     "lastGoogleSyncAt" TIMESTAMP(3),
ADD COLUMN     "publicSummary" TEXT,
ADD COLUMN     "staffingStateJson" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "CommunicationActionQueue" ADD COLUMN     "eventId" TEXT;

-- CreateTable
CREATE TABLE "CalendarSource" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "provider" "CalendarProvider" NOT NULL DEFAULT 'GOOGLE',
    "externalCalendarId" TEXT NOT NULL,
    "color" TEXT,
    "visibility" "CalendarSourceVisibility" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "syncToken" TEXT,
    "oauthJson" JSONB DEFAULT '{}',
    "lastFullSyncAt" TIMESTAMP(3),
    "lastIncrementalAt" TIMESTAMP(3),
    "ownerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarWatchChannel" (
    "id" TEXT NOT NULL,
    "calendarSourceId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "token" TEXT,
    "expiration" TIMESTAMP(3) NOT NULL,
    "lastRenewedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarWatchChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventApproval" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "state" "EventApprovalState" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "submittedByUserId" TEXT,
    "approverUserId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSyncLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "calendarSourceId" TEXT,
    "direction" "EventSyncDirection" NOT NULL,
    "status" "EventSyncLogStatus" NOT NULL,
    "message" TEXT,
    "detailJson" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAnalyticsSnapshot" (
    "id" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "scope" TEXT NOT NULL,
    "eventId" TEXT,
    "countyId" TEXT,
    "metricsJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAnalyticsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarWatchChannel_calendarSourceId_expiration_idx" ON "CalendarWatchChannel"("calendarSourceId", "expiration");

-- CreateIndex
CREATE INDEX "CalendarWatchChannel_channelId_idx" ON "CalendarWatchChannel"("channelId");

-- CreateIndex
CREATE INDEX "EventApproval_eventId_state_idx" ON "EventApproval"("eventId", "state");

-- CreateIndex
CREATE INDEX "EventApproval_state_createdAt_idx" ON "EventApproval"("state", "createdAt");

-- CreateIndex
CREATE INDEX "EventSyncLog_eventId_createdAt_idx" ON "EventSyncLog"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventSyncLog_calendarSourceId_createdAt_idx" ON "EventSyncLog"("calendarSourceId", "createdAt");

-- CreateIndex
CREATE INDEX "EventAnalyticsSnapshot_day_scope_idx" ON "EventAnalyticsSnapshot"("day", "scope");

-- CreateIndex
CREATE INDEX "EventAnalyticsSnapshot_countyId_day_idx" ON "EventAnalyticsSnapshot"("countyId", "day");

-- CreateIndex
CREATE INDEX "EventAnalyticsSnapshot_eventId_day_idx" ON "EventAnalyticsSnapshot"("eventId", "day");

-- CreateIndex
CREATE INDEX "CampaignEvent_eventWorkflowState_startAt_idx" ON "CampaignEvent"("eventWorkflowState", "startAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_isPublicOnWebsite_eventWorkflowState_startAt_idx" ON "CampaignEvent"("isPublicOnWebsite", "eventWorkflowState", "startAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_googleEventId_idx" ON "CampaignEvent"("googleEventId");

-- CreateIndex
CREATE INDEX "CommunicationActionQueue_eventId_queueStatus_idx" ON "CommunicationActionQueue"("eventId", "queueStatus");

-- AddForeignKey
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "CalendarSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarSource" ADD CONSTRAINT "CalendarSource_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarWatchChannel" ADD CONSTRAINT "CalendarWatchChannel_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "CalendarSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventApproval" ADD CONSTRAINT "EventApproval_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventApproval" ADD CONSTRAINT "EventApproval_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventApproval" ADD CONSTRAINT "EventApproval_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSyncLog" ADD CONSTRAINT "EventSyncLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSyncLog" ADD CONSTRAINT "EventSyncLog_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "CalendarSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAnalyticsSnapshot" ADD CONSTRAINT "EventAnalyticsSnapshot_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAnalyticsSnapshot" ADD CONSTRAINT "EventAnalyticsSnapshot_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;
