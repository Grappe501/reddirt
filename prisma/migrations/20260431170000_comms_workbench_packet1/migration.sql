-- Comms Workbench Packet 1: CommunicationPlan, CommunicationDraft, CommunicationVariant, CommunicationSend, MediaOutreachItem
-- Note: delivery channel enum is `CommsWorkbenchChannel` (existing `CommunicationChannel` enum is SMS/EMAIL on legacy message rows).

-- CreateEnum
CREATE TYPE "CommunicationObjective" AS ENUM (
  'VOLUNTEER_RECRUITMENT',
  'VOLUNTEER_ACTIVATION',
  'EVENT_PROMOTION',
  'EVENT_REMINDER',
  'POST_EVENT_FOLLOWUP',
  'RAPID_RESPONSE',
  'CLARIFICATION',
  'SUPPORTER_MOBILIZATION',
  'DONOR_ENGAGEMENT',
  'INTERNAL_COORDINATION',
  'PRESS_OUTREACH',
  'MEDIA_RESPONSE',
  'GENERAL_UPDATE'
);

-- CreateEnum
CREATE TYPE "CommsWorkbenchChannel" AS ENUM (
  'EMAIL',
  'SMS',
  'INTERNAL_NOTICE',
  'PRESS_OUTREACH',
  'PHONE_SCRIPT',
  'TALKING_POINTS'
);

-- CreateEnum
CREATE TYPE "CommunicationPlanStatus" AS ENUM (
  'DRAFT',
  'PLANNING',
  'READY_FOR_REVIEW',
  'APPROVED',
  'SCHEDULED',
  'ACTIVE',
  'COMPLETED',
  'CANCELED',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "CommunicationDraftStatus" AS ENUM (
  'DRAFT',
  'READY_FOR_REVIEW',
  'APPROVED',
  'REJECTED',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "CommunicationSendStatus" AS ENUM (
  'DRAFT',
  'QUEUED',
  'SCHEDULED',
  'SENDING',
  'SENT',
  'PARTIALLY_SENT',
  'FAILED',
  'CANCELED'
);

-- CreateEnum
CREATE TYPE "MediaOutreachStatus" AS ENUM (
  'NEW',
  'RESEARCHING',
  'READY',
  'CONTACTED',
  'FOLLOW_UP_DUE',
  'RESPONDED',
  'CLOSED',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "CommunicationReviewDecision" AS ENUM (
  'APPROVED',
  'REJECTED',
  'CHANGES_REQUESTED'
);

-- CreateEnum
CREATE TYPE "CommunicationVariantStatus" AS ENUM (
  'DRAFT',
  'READY',
  'APPROVED',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "CommunicationVariantType" AS ENUM (
  'AUDIENCE_SEGMENT',
  'COPY_ALT',
  'CHANNEL_OVERRIDE',
  'AB_TEST',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "CommunicationSendType" AS ENUM (
  'BROADCAST',
  'SCHEDULED',
  'TEST',
  'AD_HOC',
  'RETRY',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "MediaOutreachItemType" AS ENUM (
  'INQUIRY',
  'PITCH',
  'FOLLOW_UP',
  'OPPORTUNITY',
  'CRISIS',
  'OTHER'
);

-- CreateTable
CREATE TABLE "CommunicationPlan" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "objective" "CommunicationObjective" NOT NULL,
  "status" "CommunicationPlanStatus" NOT NULL DEFAULT 'DRAFT',
  "priority" "CampaignTaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "summary" TEXT,
  "ownerUserId" TEXT,
  "requestedByUserId" TEXT,
  "sourceType" TEXT,
  "sourceWorkflowIntakeId" TEXT,
  "sourceCampaignTaskId" TEXT,
  "sourceEventId" TEXT,
  "sourceSocialContentItemId" TEXT,
  "dueAt" TIMESTAMP(3),
  "scheduledAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationDraft" (
  "id" TEXT NOT NULL,
  "communicationPlanId" TEXT NOT NULL,
  "channel" "CommsWorkbenchChannel" NOT NULL,
  "title" TEXT,
  "subjectLine" TEXT,
  "previewText" TEXT,
  "bodyCopy" TEXT NOT NULL DEFAULT '',
  "shortCopy" TEXT,
  "messageToneMode" "SocialMessageToneMode",
  "messageTacticMode" "SocialMessageTacticMode",
  "ctaType" TEXT,
  "status" "CommunicationDraftStatus" NOT NULL DEFAULT 'DRAFT',
  "createdByUserId" TEXT,
  "updatedByUserId" TEXT,
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "reviewRequestedAt" TIMESTAMP(3),
  "reviewRequestedByUserId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedByUserId" TEXT,
  "reviewDecision" "CommunicationReviewDecision",
  "reviewNotes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationVariant" (
  "id" TEXT NOT NULL,
  "communicationDraftId" TEXT NOT NULL,
  "variantType" "CommunicationVariantType" NOT NULL DEFAULT 'OTHER',
  "targetSegmentId" TEXT,
  "targetSegmentLabel" TEXT,
  "channelOverride" "CommsWorkbenchChannel",
  "subjectLineOverride" TEXT,
  "bodyCopyOverride" TEXT,
  "ctaOverride" TEXT,
  "status" "CommunicationVariantStatus" NOT NULL DEFAULT 'DRAFT',
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationSend" (
  "id" TEXT NOT NULL,
  "communicationPlanId" TEXT NOT NULL,
  "communicationDraftId" TEXT NOT NULL,
  "communicationVariantId" TEXT,
  "channel" "CommsWorkbenchChannel" NOT NULL,
  "sendType" "CommunicationSendType",
  "targetSegmentId" TEXT,
  "status" "CommunicationSendStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "sentByUserId" TEXT,
  "outcomeSummaryJson" JSONB,
  "providerMessageId" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationSend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaOutreachItem" (
  "id" TEXT NOT NULL,
  "type" "MediaOutreachItemType" NOT NULL,
  "title" TEXT NOT NULL,
  "contactName" TEXT,
  "outletName" TEXT,
  "status" "MediaOutreachStatus" NOT NULL DEFAULT 'NEW',
  "urgency" "ConversationUrgency",
  "linkedCommunicationPlanId" TEXT,
  "linkedWorkflowIntakeId" TEXT,
  "linkedConversationOpportunityId" TEXT,
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MediaOutreachItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunicationPlan_status_updatedAt_idx" ON "CommunicationPlan"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "CommunicationPlan_objective_status_idx" ON "CommunicationPlan"("objective", "status");

-- CreateIndex
CREATE INDEX "CommunicationPlan_scheduledAt_idx" ON "CommunicationPlan"("scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationPlan_ownerUserId_idx" ON "CommunicationPlan"("ownerUserId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_status_scheduledAt_idx" ON "CommunicationPlan"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationPlan_sourceWorkflowIntakeId_idx" ON "CommunicationPlan"("sourceWorkflowIntakeId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_sourceCampaignTaskId_idx" ON "CommunicationPlan"("sourceCampaignTaskId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_sourceEventId_idx" ON "CommunicationPlan"("sourceEventId");

-- CreateIndex
CREATE INDEX "CommunicationPlan_sourceSocialContentItemId_idx" ON "CommunicationPlan"("sourceSocialContentItemId");

-- CreateIndex
CREATE INDEX "CommunicationDraft_communicationPlanId_idx" ON "CommunicationDraft"("communicationPlanId");

-- CreateIndex
CREATE INDEX "CommunicationDraft_status_idx" ON "CommunicationDraft"("status");

-- CreateIndex
CREATE INDEX "CommunicationDraft_channel_idx" ON "CommunicationDraft"("channel");

-- CreateIndex
CREATE INDEX "CommunicationDraft_isPrimary_idx" ON "CommunicationDraft"("isPrimary");

-- CreateIndex
CREATE INDEX "CommunicationDraft_messageToneMode_idx" ON "CommunicationDraft"("messageToneMode");

-- CreateIndex
CREATE INDEX "CommunicationDraft_messageTacticMode_idx" ON "CommunicationDraft"("messageTacticMode");

-- CreateIndex
CREATE INDEX "CommunicationVariant_communicationDraftId_idx" ON "CommunicationVariant"("communicationDraftId");

-- CreateIndex
CREATE INDEX "CommunicationVariant_targetSegmentId_idx" ON "CommunicationVariant"("targetSegmentId");

-- CreateIndex
CREATE INDEX "CommunicationVariant_status_idx" ON "CommunicationVariant"("status");

-- CreateIndex
CREATE INDEX "CommunicationSend_communicationPlanId_idx" ON "CommunicationSend"("communicationPlanId");

-- CreateIndex
CREATE INDEX "CommunicationSend_communicationDraftId_idx" ON "CommunicationSend"("communicationDraftId");

-- CreateIndex
CREATE INDEX "CommunicationSend_communicationVariantId_idx" ON "CommunicationSend"("communicationVariantId");

-- CreateIndex
CREATE INDEX "CommunicationSend_status_idx" ON "CommunicationSend"("status");

-- CreateIndex
CREATE INDEX "CommunicationSend_scheduledAt_idx" ON "CommunicationSend"("scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationSend_channel_idx" ON "CommunicationSend"("channel");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_status_updatedAt_idx" ON "MediaOutreachItem"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_type_status_idx" ON "MediaOutreachItem"("type", "status");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_linkedCommunicationPlanId_idx" ON "MediaOutreachItem"("linkedCommunicationPlanId");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_linkedWorkflowIntakeId_idx" ON "MediaOutreachItem"("linkedWorkflowIntakeId");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_linkedConversationOpportunityId_idx" ON "MediaOutreachItem"("linkedConversationOpportunityId");

-- CreateIndex
CREATE INDEX "MediaOutreachItem_updatedAt_idx" ON "MediaOutreachItem"("updatedAt");

-- AddForeignKey
ALTER TABLE "CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceWorkflowIntakeId_fkey" FOREIGN KEY ("sourceWorkflowIntakeId") REFERENCES "WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceCampaignTaskId_fkey" FOREIGN KEY ("sourceCampaignTaskId") REFERENCES "CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceEventId_fkey" FOREIGN KEY ("sourceEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationPlan" ADD CONSTRAINT "CommunicationPlan_sourceSocialContentItemId_fkey" FOREIGN KEY ("sourceSocialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_reviewRequestedByUserId_fkey" FOREIGN KEY ("reviewRequestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationDraft" ADD CONSTRAINT "CommunicationDraft_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_communicationDraftId_fkey" FOREIGN KEY ("communicationDraftId") REFERENCES "CommunicationDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationDraftId_fkey" FOREIGN KEY ("communicationDraftId") REFERENCES "CommunicationDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationSend" ADD CONSTRAINT "CommunicationSend_communicationVariantId_fkey" FOREIGN KEY ("communicationVariantId") REFERENCES "CommunicationVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationSend" ADD CONSTRAINT "CommunicationSend_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedCommunicationPlanId_fkey" FOREIGN KEY ("linkedCommunicationPlanId") REFERENCES "CommunicationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedWorkflowIntakeId_fkey" FOREIGN KEY ("linkedWorkflowIntakeId") REFERENCES "WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaOutreachItem" ADD CONSTRAINT "MediaOutreachItem_linkedConversationOpportunityId_fkey" FOREIGN KEY ("linkedConversationOpportunityId") REFERENCES "ConversationOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
