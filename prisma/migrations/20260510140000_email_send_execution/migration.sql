-- EMAIL-SEND-EXECUTION-1.0 — governed SendGrid send execution audit tables (no queue send).

CREATE TYPE "EmailSendExecutionStatus" AS ENUM (
  'DRAFT',
  'PREFLIGHT_FAILED',
  'READY_FOR_TEST',
  'TEST_SENT',
  'READY_FOR_FINAL_APPROVAL',
  'FINAL_APPROVED',
  'SENDING',
  'SENT',
  'PARTIAL_FAILURE',
  'FAILED',
  'CANCELLED',
  'ARCHIVED'
);

CREATE TYPE "EmailSendExecutionSendType" AS ENUM (
  'SENDGRID_TEST',
  'SENDGRID_BROADCAST',
  'GMAIL_ONE_TO_ONE_FUTURE'
);

CREATE TYPE "EmailSendRecipientStatus" AS ENUM (
  'CANDIDATE',
  'EXCLUDED_SUPPRESSED',
  'EXCLUDED_MISSING_CONSENT',
  'READY',
  'SUBMITTED',
  'DELIVERED',
  'BOUNCED',
  'UNSUBSCRIBED',
  'SPAM_REPORTED',
  'FAILED'
);

CREATE TYPE "EmailSendApprovalType" AS ENUM (
  'OPERATOR_REVIEW',
  'COMMS_REVIEW',
  'PRINCIPAL_REVIEW',
  'LEGAL_REVIEW',
  'FINANCE_REVIEW',
  'FINAL_SEND_APPROVAL'
);

CREATE TYPE "EmailSendApprovalStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'NOT_REQUIRED'
);

CREATE TABLE "EmailSendExecution" (
    "id" TEXT NOT NULL,
    "status" "EmailSendExecutionStatus" NOT NULL DEFAULT 'DRAFT',
    "sendType" "EmailSendExecutionSendType" NOT NULL DEFAULT 'SENDGRID_BROADCAST',
    "messageStudioDraftId" TEXT,
    "emailAudienceDefinitionId" TEXT,
    "sendGridContactSyncRunId" TEXT,
    "sendPacketJson" JSONB NOT NULL DEFAULT '{}',
    "subject" TEXT NOT NULL DEFAULT '',
    "preheader" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "fromEmail" VARCHAR(320) NOT NULL DEFAULT '',
    "fromName" VARCHAR(320) NOT NULL DEFAULT '',
    "replyToEmail" VARCHAR(320),
    "testRecipientEmail" VARCHAR(320),
    "candidateRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "suppressedRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "finalRecipientCount" INTEGER NOT NULL DEFAULT 0,
    "preflightJson" JSONB NOT NULL DEFAULT '{}',
    "approvalJson" JSONB NOT NULL DEFAULT '{}',
    "providerResultJson" JSONB NOT NULL DEFAULT '{}',
    "errorSafe" TEXT,
    "createdByUserId" TEXT,
    "preflightByUserId" TEXT,
    "approvedByUserId" TEXT,
    "sentByUserId" TEXT,
    "preflightAt" TIMESTAMP(3),
    "finalApprovedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSendExecution_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailSendRecipient" (
    "id" TEXT NOT NULL,
    "sendExecutionId" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "emailContactProfileId" TEXT,
    "status" "EmailSendRecipientStatus" NOT NULL DEFAULT 'CANDIDATE',
    "suppressionReason" VARCHAR(500),
    "providerMessageId" VARCHAR(200),
    "providerEventJson" JSONB,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSendRecipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailSendApproval" (
    "id" TEXT NOT NULL,
    "sendExecutionId" TEXT NOT NULL,
    "approvalType" "EmailSendApprovalType" NOT NULL,
    "status" "EmailSendApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT NOT NULL DEFAULT '',
    "approvedByUserId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSendApproval_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailSendExecution_status_updatedAt_idx" ON "EmailSendExecution"("status", "updatedAt");
CREATE INDEX "EmailSendExecution_createdAt_idx" ON "EmailSendExecution"("createdAt");
CREATE INDEX "EmailSendExecution_messageStudioDraftId_idx" ON "EmailSendExecution"("messageStudioDraftId");
CREATE INDEX "EmailSendExecution_emailAudienceDefinitionId_idx" ON "EmailSendExecution"("emailAudienceDefinitionId");

CREATE INDEX "EmailSendRecipient_sendExecutionId_status_idx" ON "EmailSendRecipient"("sendExecutionId", "status");
CREATE INDEX "EmailSendRecipient_email_idx" ON "EmailSendRecipient"("email");

CREATE INDEX "EmailSendApproval_sendExecutionId_approvalType_idx" ON "EmailSendApproval"("sendExecutionId", "approvalType");

ALTER TABLE "EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_messageStudioDraftId_fkey" FOREIGN KEY ("messageStudioDraftId") REFERENCES "MessageStudioDraft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_sendGridContactSyncRunId_fkey" FOREIGN KEY ("sendGridContactSyncRunId") REFERENCES "SendGridContactSyncRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_preflightByUserId_fkey" FOREIGN KEY ("preflightByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailSendExecution" ADD CONSTRAINT "EmailSendExecution_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailSendRecipient" ADD CONSTRAINT "EmailSendRecipient_sendExecutionId_fkey" FOREIGN KEY ("sendExecutionId") REFERENCES "EmailSendExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailSendRecipient" ADD CONSTRAINT "EmailSendRecipient_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailSendApproval" ADD CONSTRAINT "EmailSendApproval_sendExecutionId_fkey" FOREIGN KEY ("sendExecutionId") REFERENCES "EmailSendExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailSendApproval" ADD CONSTRAINT "EmailSendApproval_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
