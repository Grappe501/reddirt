-- EMAIL-SENDGRID-FOUNDATION-1.0 — SendGrid readiness tables (no send execution).

CREATE TYPE "SendGridContactSyncStatus" AS ENUM ('NOT_SYNCED', 'READY', 'SYNCED', 'ERROR', 'SUPPRESSED');
CREATE TYPE "SendGridAudienceSyncStatus" AS ENUM ('NOT_SYNCED', 'READY', 'SYNCED', 'ERROR');
CREATE TYPE "SendGridSuppressionType" AS ENUM ('UNSUBSCRIBE', 'GROUP_UNSUBSCRIBE', 'BOUNCE', 'SPAM_REPORT', 'MANUAL', 'INVALID');

CREATE TABLE "SendGridContactMap" (
    "id" TEXT NOT NULL,
    "emailContactProfileId" TEXT,
    "emailAudienceDefinitionId" TEXT,
    "email" VARCHAR(320) NOT NULL,
    "sendgridContactId" VARCHAR(120),
    "syncStatus" "SendGridContactSyncStatus" NOT NULL DEFAULT 'NOT_SYNCED',
    "lastSyncAt" TIMESTAMP(3),
    "lastErrorSafe" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SendGridContactMap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SendGridAudienceMap" (
    "id" TEXT NOT NULL,
    "emailAudienceDefinitionId" TEXT NOT NULL,
    "sendgridListId" VARCHAR(120),
    "sendgridSegmentId" VARCHAR(120),
    "syncStatus" "SendGridAudienceSyncStatus" NOT NULL DEFAULT 'NOT_SYNCED',
    "lastPreviewAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SendGridAudienceMap_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SendGridAudienceMap_emailAudienceDefinitionId_key" ON "SendGridAudienceMap"("emailAudienceDefinitionId");

CREATE TABLE "SendGridSuppression" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "suppressionType" "SendGridSuppressionType" NOT NULL,
    "sendgridEventId" VARCHAR(200),
    "source" VARCHAR(120) NOT NULL DEFAULT 'sendgrid_webhook',
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SendGridSuppression_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SendGridEvent" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320),
    "eventType" VARCHAR(80) NOT NULL,
    "sendgridEventId" VARCHAR(200),
    "sendgridMessageId" VARCHAR(240),
    "sendgridMarketingCampaignId" VARCHAR(120),
    "emailAudienceDefinitionId" TEXT,
    "emailContactProfileId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "rawEventJson" JSONB NOT NULL DEFAULT '{}',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SendGridEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SendGridEvent_sendgridEventId_key" ON "SendGridEvent"("sendgridEventId");

CREATE INDEX "SendGridContactMap_email_idx" ON "SendGridContactMap"("email");
CREATE INDEX "SendGridContactMap_syncStatus_idx" ON "SendGridContactMap"("syncStatus");
CREATE INDEX "SendGridContactMap_emailContactProfileId_idx" ON "SendGridContactMap"("emailContactProfileId");
CREATE INDEX "SendGridContactMap_emailAudienceDefinitionId_idx" ON "SendGridContactMap"("emailAudienceDefinitionId");

CREATE INDEX "SendGridSuppression_email_idx" ON "SendGridSuppression"("email");
CREATE INDEX "SendGridSuppression_suppressionType_occurredAt_idx" ON "SendGridSuppression"("suppressionType", "occurredAt");
CREATE INDEX "SendGridSuppression_occurredAt_idx" ON "SendGridSuppression"("occurredAt");

CREATE INDEX "SendGridEvent_eventType_occurredAt_idx" ON "SendGridEvent"("eventType", "occurredAt");
CREATE INDEX "SendGridEvent_occurredAt_idx" ON "SendGridEvent"("occurredAt");
CREATE INDEX "SendGridEvent_email_idx" ON "SendGridEvent"("email");

ALTER TABLE "SendGridContactMap" ADD CONSTRAINT "SendGridContactMap_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SendGridContactMap" ADD CONSTRAINT "SendGridContactMap_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SendGridAudienceMap" ADD CONSTRAINT "SendGridAudienceMap_emailAudienceDefinitionId_fkey" FOREIGN KEY ("emailAudienceDefinitionId") REFERENCES "EmailAudienceDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
