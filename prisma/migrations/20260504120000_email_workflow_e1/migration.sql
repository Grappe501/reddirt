-- E-1: Email Workflow Intelligence — queue item model (queue-first; no auto-send/approval in this packet).

CREATE TYPE "EmailWorkflowStatus" AS ENUM (
  'NEW', 'IN_REVIEW', 'READY_TO_RESPOND', 'APPROVED', 'ESCALATED', 'SPAM', 'CLOSED', 'ARCHIVED'
);
CREATE TYPE "EmailWorkflowPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "EmailWorkflowSourceType" AS ENUM (
  'INBOUND_EMAIL', 'OUTBOUND_FOLLOWUP', 'WORKFLOW_TRIGGER', 'SEGMENT_TRIGGER', 'VOLUNTEER_TRIGGER', 'EVENT_TRIGGER', 'MANUAL', 'OTHER'
);
CREATE TYPE "EmailWorkflowTriggerType" AS ENUM (
  'MANUAL', 'INBOUND_MESSAGE', 'OUTBOUND_DRAFT', 'SCHEDULED', 'MONITORING', 'INTAKE', 'OTHER'
);
CREATE TYPE "EmailWorkflowIntent" AS ENUM (
  'QUESTION', 'VOLUNTEER_INTEREST', 'COMPLAINT', 'SUPPORT', 'MEDIA_INQUIRY', 'UNSUBSCRIBE', 'SPAM', 'FOLLOW_UP', 'UNKNOWN'
);
CREATE TYPE "EmailWorkflowTone" AS ENUM (
  'SUPPORTIVE', 'CURIOUS', 'CONFUSED', 'FRUSTRATED', 'HOSTILE', 'NEUTRAL', 'UNKNOWN'
);
CREATE TYPE "EmailWorkflowEscalationLevel" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "EmailWorkflowSpamDisposition" AS ENUM (
  'UNKNOWN', 'CLEAN', 'SUSPECTED_SPAM', 'CONFIRMED_SPAM', 'SUPPRESSED'
);

CREATE TABLE "EmailWorkflowItem" (
  "id" TEXT NOT NULL,
  "status" "EmailWorkflowStatus" NOT NULL DEFAULT 'NEW',
  "priority" "EmailWorkflowPriority" NOT NULL DEFAULT 'NORMAL',
  "sourceType" "EmailWorkflowSourceType" NOT NULL DEFAULT 'MANUAL',
  "triggerType" "EmailWorkflowTriggerType" NOT NULL DEFAULT 'MANUAL',
  "title" VARCHAR(500),
  "queueReason" TEXT,
  "whoSummary" TEXT,
  "whatSummary" TEXT,
  "whenSummary" TEXT,
  "whereSummary" TEXT,
  "whySummary" TEXT,
  "impactSummary" TEXT,
  "recommendedResponseSummary" TEXT,
  "recommendedResponseRationale" TEXT,
  "sentiment" VARCHAR(120),
  "tone" "EmailWorkflowTone" NOT NULL DEFAULT 'UNKNOWN',
  "intent" "EmailWorkflowIntent" NOT NULL DEFAULT 'UNKNOWN',
  "escalationLevel" "EmailWorkflowEscalationLevel" NOT NULL DEFAULT 'NONE',
  "spamDisposition" "EmailWorkflowSpamDisposition" NOT NULL DEFAULT 'UNKNOWN',
  "spamScore" DOUBLE PRECISION,
  "needsDeescalation" BOOLEAN NOT NULL DEFAULT false,
  "occurredAt" TIMESTAMP(3),
  "userId" TEXT,
  "volunteerProfileId" TEXT,
  "communicationThreadId" TEXT,
  "communicationPlanId" TEXT,
  "communicationSendId" TEXT,
  "workflowIntakeId" TEXT,
  "campaignTaskId" TEXT,
  "conversationOpportunityId" TEXT,
  "socialContentItemId" TEXT,
  "comsPlanAudienceSegmentId" TEXT,
  "communicationMessageId" TEXT,
  "assignedToUserId" TEXT,
  "createdByUserId" TEXT,
  "reviewedByUserId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmailWorkflowItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailWorkflowItem_status_priority_createdAt_idx" ON "EmailWorkflowItem" ("status", "priority", "createdAt");
CREATE INDEX "EmailWorkflowItem_assignedToUserId_status_idx" ON "EmailWorkflowItem" ("assignedToUserId", "status");
CREATE INDEX "EmailWorkflowItem_sourceType_status_idx" ON "EmailWorkflowItem" ("sourceType", "status");
CREATE INDEX "EmailWorkflowItem_communicationThreadId_idx" ON "EmailWorkflowItem" ("communicationThreadId");
CREATE INDEX "EmailWorkflowItem_communicationPlanId_idx" ON "EmailWorkflowItem" ("communicationPlanId");
CREATE INDEX "EmailWorkflowItem_escalationLevel_status_idx" ON "EmailWorkflowItem" ("escalationLevel", "status");
CREATE INDEX "EmailWorkflowItem_spamDisposition_status_idx" ON "EmailWorkflowItem" ("spamDisposition", "status");
CREATE INDEX "EmailWorkflowItem_createdAt_idx" ON "EmailWorkflowItem" ("createdAt");

ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationPlanId_fkey" FOREIGN KEY ("communicationPlanId") REFERENCES "CommunicationPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationSendId_fkey" FOREIGN KEY ("communicationSendId") REFERENCES "CommunicationSend"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_campaignTaskId_fkey" FOREIGN KEY ("campaignTaskId") REFERENCES "CampaignTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_conversationOpportunityId_fkey" FOREIGN KEY ("conversationOpportunityId") REFERENCES "ConversationOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_comsPlanAudienceSegmentId_fkey" FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "CommsPlanAudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_communicationMessageId_fkey" FOREIGN KEY ("communicationMessageId") REFERENCES "CommunicationMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
