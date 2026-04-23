-- Contact Engagement + Segmentation (Packet CE-1) — workbench, campaign-local (message plan scoped).
-- Distinct from broadcast `AudienceSegment` + `CommunicationCampaign`.

-- CreateEnum
CREATE TYPE "CommunicationRecipientStatus" AS ENUM (
  'PLANNED', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED', 'CANCELED'
);
CREATE TYPE "CommunicationRecipientEventType" AS ENUM (
  'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'FAILED', 'BOUNCED', 'UNSUBSCRIBED', 'OPTED_OUT_SMS', 'WEB_VISIT', 'FORM_SUBMITTED'
);
CREATE TYPE "CommsDeliveryHealthStatus" AS ENUM (
  'HEALTHY', 'SUPPRESSED', 'UNSUBSCRIBED', 'INVALID_EMAIL', 'INVALID_PHONE', 'HARD_BOUNCED', 'SMS_OPT_OUT', 'UNKNOWN'
);
CREATE TYPE "CommsPlanAudienceSegmentType" AS ENUM ('STATIC', 'DYNAMIC', 'SYSTEM');
CREATE TYPE "CommsPlanAudienceSegmentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "CommsPlanAudienceSegmentMemberSource" AS ENUM (
  'MANUAL', 'IMPORT', 'DYNAMIC_SNAPSHOT', 'API', 'OTHER'
);

-- CreateTable: message-plan audience (not broadcast `AudienceSegment`)
CREATE TABLE "CommsPlanAudienceSegment" (
  "id" TEXT NOT NULL,
  "communicationPlanId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "segmentType" "CommsPlanAudienceSegmentType" NOT NULL DEFAULT 'STATIC',
  "status" "CommsPlanAudienceSegmentStatus" NOT NULL DEFAULT 'ACTIVE',
  "ruleDefinitionJson" JSONB NOT NULL DEFAULT '{}',
  "isDynamic" BOOLEAN NOT NULL DEFAULT false,
  "createdByUserId" TEXT,
  "updatedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommsPlanAudienceSegment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationRecipient" (
  "id" TEXT NOT NULL,
  "communicationSendId" TEXT NOT NULL,
  "comsPlanAudienceSegmentId" TEXT,
  "channel" "CommsWorkbenchChannel" NOT NULL,
  "addressUsed" TEXT NOT NULL,
  "crmContactKey" TEXT,
  "userId" TEXT,
  "volunteerProfileId" TEXT,
  "communicationThreadId" TEXT,
  "targetSegmentId" TEXT,
  "targetSegmentLabel" TEXT,
  "status" "CommunicationRecipientStatus" NOT NULL DEFAULT 'PLANNED',
  "providerRecipientId" TEXT,
  "deliveryHealthStatus" "CommsDeliveryHealthStatus" NOT NULL DEFAULT 'UNKNOWN',
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CommunicationRecipient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationRecipientEvent" (
  "id" TEXT NOT NULL,
  "communicationRecipientId" TEXT NOT NULL,
  "eventType" "CommunicationRecipientEventType" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "providerEventId" TEXT,
  "providerName" TEXT,
  "linkUrl" TEXT,
  "linkLabel" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunicationRecipientEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationLinkDefinition" (
  "id" TEXT NOT NULL,
  "communicationSendId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "trackingKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunicationLinkDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommsPlanAudienceSegmentMember" (
  "id" TEXT NOT NULL,
  "comsPlanAudienceSegmentId" TEXT NOT NULL,
  "userId" TEXT,
  "volunteerProfileId" TEXT,
  "crmContactKey" TEXT,
  "sourceType" "CommsPlanAudienceSegmentMemberSource" NOT NULL DEFAULT 'MANUAL',
  "addedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommsPlanAudienceSegmentMember_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_communicationPlanId_fkey"
  FOREIGN KEY ("communicationPlanId") REFERENCES "CommunicationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommsPlanAudienceSegment" ADD CONSTRAINT "CommsPlanAudienceSegment_updatedByUserId_fkey"
  FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_communicationSendId_fkey"
  FOREIGN KEY ("communicationSendId") REFERENCES "CommunicationSend"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_comsPlanAudienceSegmentId_fkey"
  FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "CommsPlanAudienceSegment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_volunteerProfileId_fkey"
  FOREIGN KEY ("volunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationRecipient" ADD CONSTRAINT "CommunicationRecipient_communicationThreadId_fkey"
  FOREIGN KEY ("communicationThreadId") REFERENCES "CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommunicationRecipientEvent" ADD CONSTRAINT "CommunicationRecipientEvent_communicationRecipientId_fkey"
  FOREIGN KEY ("communicationRecipientId") REFERENCES "CommunicationRecipient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommunicationLinkDefinition" ADD CONSTRAINT "CommunicationLinkDefinition_communicationSendId_fkey"
  FOREIGN KEY ("communicationSendId") REFERENCES "CommunicationSend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_comsPlanAudienceSegmentId_fkey"
  FOREIGN KEY ("comsPlanAudienceSegmentId") REFERENCES "CommsPlanAudienceSegment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_volunteerProfileId_fkey"
  FOREIGN KEY ("volunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommsPlanAudienceSegmentMember" ADD CONSTRAINT "CommsPlanAudienceSegmentMember_addedByUserId_fkey"
  FOREIGN KEY ("addedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "CommsPlanAudienceSegment_communicationPlanId_idx" ON "CommsPlanAudienceSegment"("communicationPlanId");
CREATE INDEX "CommsPlanAudienceSegment_status_idx" ON "CommsPlanAudienceSegment"("status");
CREATE INDEX "CommsPlanAudienceSegment_segmentType_idx" ON "CommsPlanAudienceSegment"("segmentType");
CREATE INDEX "CommsPlanAudienceSegment_createdByUserId_idx" ON "CommsPlanAudienceSegment"("createdByUserId");

CREATE INDEX "CommunicationRecipient_communicationSendId_idx" ON "CommunicationRecipient"("communicationSendId");
CREATE INDEX "CommunicationRecipient_comsPlanAudienceSegmentId_idx" ON "CommunicationRecipient"("comsPlanAudienceSegmentId");
CREATE INDEX "CommunicationRecipient_userId_idx" ON "CommunicationRecipient"("userId");
CREATE INDEX "CommunicationRecipient_volunteerProfileId_idx" ON "CommunicationRecipient"("volunteerProfileId");
CREATE INDEX "CommunicationRecipient_communicationThreadId_idx" ON "CommunicationRecipient"("communicationThreadId");
CREATE INDEX "CommunicationRecipient_status_updatedAt_idx" ON "CommunicationRecipient"("status", "updatedAt");
CREATE INDEX "CommunicationRecipient_crmContactKey_idx" ON "CommunicationRecipient"("crmContactKey");

CREATE INDEX "CommunicationRecipientEvent_communicationRecipientId_occurredAt_idx" ON "CommunicationRecipientEvent"("communicationRecipientId", "occurredAt");
CREATE INDEX "CommunicationRecipientEvent_eventType_occurredAt_idx" ON "CommunicationRecipientEvent"("eventType", "occurredAt");
CREATE INDEX "CommunicationRecipientEvent_providerEventId_idx" ON "CommunicationRecipientEvent"("providerEventId");

CREATE INDEX "CommunicationLinkDefinition_communicationSendId_idx" ON "CommunicationLinkDefinition"("communicationSendId");
CREATE UNIQUE INDEX "CommunicationLinkDefinition_communicationSendId_trackingKey_key" ON "CommunicationLinkDefinition"("communicationSendId", "trackingKey");

CREATE INDEX "CommsPlanAudienceSegmentMember_comsPlanAudienceSegmentId_idx" ON "CommsPlanAudienceSegmentMember"("comsPlanAudienceSegmentId");
CREATE INDEX "CommsPlanAudienceSegmentMember_userId_idx" ON "CommsPlanAudienceSegmentMember"("userId");
CREATE INDEX "CommsPlanAudienceSegmentMember_volunteerProfileId_idx" ON "CommsPlanAudienceSegmentMember"("volunteerProfileId");
CREATE INDEX "CommsPlanAudienceSegmentMember_crmContactKey_idx" ON "CommsPlanAudienceSegmentMember"("crmContactKey");
