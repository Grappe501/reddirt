-- CreateEnum
CREATE TYPE "CommunicationCampaignChannel" AS ENUM ('SMS', 'EMAIL', 'MIXED');

-- CreateEnum
CREATE TYPE "CommunicationCampaignType" AS ENUM ('BROADCAST', 'EVENT_REMINDER', 'FOLLOW_UP', 'FUNDRAISING', 'VOLUNTEER_RECRUITMENT', 'INTERNAL', 'EVENT_CANCELLATION', 'EVENT_THANK_YOU', 'RSVP_FOLLOWUP');

-- CreateEnum
CREATE TYPE "CommunicationCampaignStatus" AS ENUM ('DRAFT', 'APPROVAL_NEEDED', 'APPROVED', 'QUEUED', 'SENDING', 'PAUSED', 'COMPLETE', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "CommunicationTemplateType" AS ENUM ('BROADCAST', 'EVENT_REMINDER', 'QUICK_REPLY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "CampaignRecipientSendStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED_SUPPRESSION', 'SKIPPED_NO_ADDRESS', 'CANCELED', 'BOUNCED');

-- EventSignup: link to User (was nullable without FK)
ALTER TABLE "EventSignup" ADD CONSTRAINT "EventSignup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CommunicationTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "templateType" "CommunicationTemplateType" NOT NULL DEFAULT 'BROADCAST',
    "subjectTemplate" TEXT,
    "bodyTemplate" TEXT NOT NULL,
    "tone" TEXT,
    "isAiSeeded" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "eventType" "CampaignEventType",
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudienceSegment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "definitionJson" JSONB NOT NULL DEFAULT '{}',
    "estimatedCount" INTEGER,
    "isDynamic" BOOLEAN NOT NULL DEFAULT true,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AudienceSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationCampaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" "CommunicationCampaignChannel" NOT NULL,
    "campaignType" "CommunicationCampaignType" NOT NULL DEFAULT 'BROADCAST',
    "status" "CommunicationCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "templateId" TEXT,
    "audienceDefinitionJson" JSONB NOT NULL DEFAULT '{}',
    "audienceSegmentId" TEXT,
    "subjectText" TEXT,
    "bodyText" TEXT,
    "eventId" TEXT,
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "suppressedCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "replyCount" INTEGER NOT NULL DEFAULT 0,
    "optOutCount" INTEGER NOT NULL DEFAULT 0,
    "statsJson" JSONB DEFAULT '{}',
    "notes" TEXT,
    "lastProcessError" TEXT,
    "processingLockUntil" TIMESTAMP(3),
    "lastProcessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationCampaignRecipient" (
    "id" TEXT NOT NULL,
    "communicationCampaignId" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "communicationThreadId" TEXT,
    "channel" "CommunicationChannel" NOT NULL,
    "recipientEmail" TEXT,
    "recipientPhone" TEXT,
    "personalizationJson" JSONB NOT NULL DEFAULT '{}',
    "sendStatus" "CampaignRecipientSendStatus" NOT NULL DEFAULT 'PENDING',
    "providerMessageId" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "responseAt" TIMESTAMP(3),
    "unsubscribeStateSnapshot" JSONB DEFAULT '{}',
    "lastError" TEXT,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationCampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "CommunicationMessage" ADD COLUMN     "communicationCampaignId" TEXT,
ADD COLUMN     "communicationCampaignRecipientId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationMessage_communicationCampaignRecipientId_key" ON "CommunicationMessage"("communicationCampaignRecipientId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationCampaignRecipient_idempotencyKey_key" ON "CommunicationCampaignRecipient"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "CommunicationTemplate" ADD CONSTRAINT "CommunicationTemplate_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudienceSegment" ADD CONSTRAINT "AudienceSegment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CommunicationTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_audienceSegmentId_fkey" FOREIGN KEY ("audienceSegmentId") REFERENCES "AudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaign" ADD CONSTRAINT "CommunicationCampaign_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_communicationCampaignId_fkey" FOREIGN KEY ("communicationCampaignId") REFERENCES "CommunicationCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationCampaignRecipient" ADD CONSTRAINT "CommunicationCampaignRecipient_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_communicationCampaignId_fkey" FOREIGN KEY ("communicationCampaignId") REFERENCES "CommunicationCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_communicationCampaignRecipientId_fkey" FOREIGN KEY ("communicationCampaignRecipientId") REFERENCES "CommunicationCampaignRecipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "CommunicationTemplate_templateType_channel_idx" ON "CommunicationTemplate"("templateType", "channel");

-- CreateIndex
CREATE INDEX "AudienceSegment_name_idx" ON "AudienceSegment"("name");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_status_scheduledAt_idx" ON "CommunicationCampaign"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_eventId_status_idx" ON "CommunicationCampaign"("eventId", "status");

-- CreateIndex
CREATE INDEX "CommunicationCampaign_status_createdAt_idx" ON "CommunicationCampaign"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CommunicationCampaignRecipient_communicationCampaignId_sendStatus_idx" ON "CommunicationCampaignRecipient"("communicationCampaignId", "sendStatus");

-- CreateIndex
CREATE INDEX "CommunicationCampaignRecipient_communicationCampaignId_id_idx" ON "CommunicationCampaignRecipient"("communicationCampaignId", "id");

-- CreateIndex
CREATE INDEX "CommunicationCampaignRecipient_userId_idx" ON "CommunicationCampaignRecipient"("userId");

-- CreateIndex
CREATE INDEX "CommunicationCampaignRecipient_sendStatus_updatedAt_idx" ON "CommunicationCampaignRecipient"("sendStatus", "updatedAt");

-- CreateIndex
CREATE INDEX "CommunicationMessage_communicationCampaignId_createdAt_idx" ON "CommunicationMessage"("communicationCampaignId", "createdAt");
