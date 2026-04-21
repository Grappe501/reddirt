-- CreateEnum
CREATE TYPE "CampaignEventType" AS ENUM ('RALLY', 'APPEARANCE', 'TRAINING', 'MEETING', 'CANVASS', 'PHONE_BANK', 'FUNDRAISER', 'PRESS', 'DEADLINE', 'ORIENTATION', 'OTHER');

-- CreateEnum
CREATE TYPE "CampaignEventStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignEventVisibility" AS ENUM ('INTERNAL', 'STAFF', 'PUBLIC_STAFF');

-- CreateEnum
CREATE TYPE "CampaignTaskType" AS ENUM ('PREP', 'COMMS', 'FIELD', 'DATA', 'VOLUNTEER', 'MEDIA', 'ADMIN', 'FOLLOW_UP', 'OTHER');

-- CreateEnum
CREATE TYPE "CampaignTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CampaignTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "WorkflowTemplateTrigger" AS ENUM ('EVENT_CREATED', 'EVENT_SIGNUP_CREATED', 'MENTION_REVIEWED', 'MANUAL');

-- CreateEnum
CREATE TYPE "WorkflowRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VolunteerAskType" AS ENUM ('SHARE', 'RSVP', 'CANVASS', 'PHONE_BANK', 'HOST', 'RECRUIT', 'AMPLIFY', 'OTHER');

-- CreateEnum
CREATE TYPE "VolunteerAskStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventSignupAttendeeStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'CANCELLED', 'ATTENDED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "MediaIngestBatchStatus" AS ENUM ('STARTED', 'COMPLETE', 'PARTIAL', 'FAILED');

-- AlterTable
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "mediaIngestBatchId" TEXT;

-- CreateTable
CREATE TABLE "CampaignEvent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "CampaignEventType" NOT NULL,
    "status" "CampaignEventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "visibility" "CampaignEventVisibility" NOT NULL DEFAULT 'INTERNAL',
    "countyId" TEXT,
    "locationName" TEXT,
    "address" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
    "ownerUserId" TEXT,
    "relatedInboundContentId" TEXT,
    "relatedSyncedPostId" TEXT,
    "relatedOwnedMediaAssetId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "CampaignTaskType" NOT NULL DEFAULT 'OTHER',
    "status" "CampaignTaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" "CampaignTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueAt" TIMESTAMP(3),
    "startAt" TIMESTAMP(3),
    "assignedUserId" TEXT,
    "assignedRole" TEXT,
    "countyId" TEXT,
    "eventId" TEXT,
    "workflowRunId" TEXT,
    "parentTaskId" TEXT,
    "createdByUserId" TEXT,
    "completionNotes" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" "WorkflowTemplateTrigger" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "configJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowTemplateTask" (
    "id" TEXT NOT NULL,
    "workflowTemplateId" TEXT NOT NULL,
    "taskKey" TEXT NOT NULL,
    "titleTemplate" TEXT NOT NULL,
    "descriptionTemplate" TEXT,
    "offsetMinutes" INTEGER NOT NULL DEFAULT 0,
    "roleTarget" TEXT,
    "taskType" "CampaignTaskType" NOT NULL DEFAULT 'OTHER',
    "priority" "CampaignTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "required" BOOLEAN NOT NULL DEFAULT true,
    "dependsOnTaskKey" TEXT,
    "configJson" JSONB DEFAULT '{}',

    CONSTRAINT "WorkflowTemplateTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowRun" (
    "id" TEXT NOT NULL,
    "workflowTemplateId" TEXT NOT NULL,
    "triggerType" "WorkflowTemplateTrigger" NOT NULL,
    "triggerSourceType" TEXT NOT NULL,
    "triggerSourceId" TEXT NOT NULL,
    "status" "WorkflowRunStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "contextJson" JSONB DEFAULT '{}',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerAsk" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "askType" "VolunteerAskType" NOT NULL,
    "status" "VolunteerAskStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "countyId" TEXT,
    "eventId" TEXT,
    "workflowRunId" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "recurrenceRule" TEXT,
    "targetAudienceJson" JSONB DEFAULT '{}',
    "actionUrl" TEXT,
    "completionMode" TEXT NOT NULL DEFAULT 'HONOR_SYSTEM',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerAsk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSignup" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobilePhone" TEXT,
    "countyId" TEXT,
    "signupSource" TEXT NOT NULL DEFAULT 'web',
    "notes" TEXT,
    "status" "EventSignupAttendeeStatus" NOT NULL DEFAULT 'REGISTERED',
    "attendedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSignup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleKey" TEXT NOT NULL,
    "countyId" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaIngestBatch" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "ingestPath" TEXT,
    "status" "MediaIngestBatchStatus" NOT NULL DEFAULT 'STARTED',
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaIngestBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignEvent_slug_key" ON "CampaignEvent"("slug");

-- CreateIndex
CREATE INDEX "CampaignEvent_startAt_status_idx" ON "CampaignEvent"("startAt", "status");

-- CreateIndex
CREATE INDEX "CampaignEvent_countyId_startAt_idx" ON "CampaignEvent"("countyId", "startAt");

-- CreateIndex
CREATE INDEX "CampaignEvent_status_startAt_idx" ON "CampaignEvent"("status", "startAt");

-- CreateIndex
CREATE INDEX "CampaignTask_status_dueAt_idx" ON "CampaignTask"("status", "dueAt");

-- CreateIndex
CREATE INDEX "CampaignTask_assignedUserId_status_idx" ON "CampaignTask"("assignedUserId", "status");

-- CreateIndex
CREATE INDEX "CampaignTask_eventId_idx" ON "CampaignTask"("eventId");

-- CreateIndex
CREATE INDEX "CampaignTask_dueAt_status_idx" ON "CampaignTask"("dueAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplate_key_key" ON "WorkflowTemplate"("key");

-- CreateIndex
CREATE INDEX "WorkflowTemplateTask_workflowTemplateId_idx" ON "WorkflowTemplateTask"("workflowTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowTemplateTask_workflowTemplateId_taskKey_key" ON "WorkflowTemplateTask"("workflowTemplateId", "taskKey");

-- CreateIndex
CREATE INDEX "WorkflowRun_status_createdAt_idx" ON "WorkflowRun"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowRun_workflowTemplateId_triggerSourceType_triggerSou_key" ON "WorkflowRun"("workflowTemplateId", "triggerSourceType", "triggerSourceId");

-- CreateIndex
CREATE INDEX "VolunteerAsk_status_startsAt_idx" ON "VolunteerAsk"("status", "startsAt");

-- CreateIndex
CREATE INDEX "VolunteerAsk_countyId_status_idx" ON "VolunteerAsk"("countyId", "status");

-- CreateIndex
CREATE INDEX "EventSignup_eventId_createdAt_idx" ON "EventSignup"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventSignup_email_idx" ON "EventSignup"("email");

-- CreateIndex
CREATE INDEX "TeamRoleAssignment_userId_roleKey_idx" ON "TeamRoleAssignment"("userId", "roleKey");

-- CreateIndex
CREATE INDEX "TeamRoleAssignment_countyId_roleKey_idx" ON "TeamRoleAssignment"("countyId", "roleKey");

-- CreateIndex
CREATE INDEX "MediaIngestBatch_status_createdAt_idx" ON "MediaIngestBatch"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_mediaIngestBatchId_fkey" FOREIGN KEY ("mediaIngestBatchId") REFERENCES "MediaIngestBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTask" ADD CONSTRAINT "CampaignTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowTemplateTask" ADD CONSTRAINT "WorkflowTemplateTask_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "WorkflowTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowRun" ADD CONSTRAINT "WorkflowRun_workflowTemplateId_fkey" FOREIGN KEY ("workflowTemplateId") REFERENCES "WorkflowTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_workflowRunId_fkey" FOREIGN KEY ("workflowRunId") REFERENCES "WorkflowRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerAsk" ADD CONSTRAINT "VolunteerAsk_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSignup" ADD CONSTRAINT "EventSignup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSignup" ADD CONSTRAINT "EventSignup_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSignup" ADD CONSTRAINT "EventSignup_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRoleAssignment" ADD CONSTRAINT "TeamRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamRoleAssignment" ADD CONSTRAINT "TeamRoleAssignment_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaIngestBatch" ADD CONSTRAINT "MediaIngestBatch_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
