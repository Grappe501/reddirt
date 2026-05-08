-- Communication Intelligence ingest — Gmail / People / Calendar read models (no sends, no Google writes).

CREATE TYPE "ExternalIngestSource" AS ENUM ('GMAIL_MESSAGES', 'GOOGLE_CONTACTS', 'GOOGLE_CALENDAR_EVENTS');
CREATE TYPE "ExternalIngestRunStatus" AS ENUM ('DRAFT', 'PREVIEWED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED');
CREATE TYPE "ExternalIngestRunMode" AS ENUM ('PREVIEW', 'IMPORT', 'INCREMENTAL');
CREATE TYPE "GmailMessageParticipantRole" AS ENUM ('FROM', 'TO', 'CC', 'BCC', 'REPLY_TO');
CREATE TYPE "CommunicationIdentityReviewStatus" AS ENUM ('AUTO_LINKED', 'NEEDS_REVIEW', 'POSSIBLE_DUPLICATE', 'SUPPRESSED', 'IGNORED');
CREATE TYPE "CommunicationIdentitySignalSource" AS ENUM ('GMAIL_MESSAGE', 'GOOGLE_CONTACT', 'GOOGLE_CALENDAR_EVENT', 'FORM_INTAKE', 'SENDGRID_EVENT', 'MANUAL');
CREATE TYPE "CommunicationMatchTargetType" AS ENUM ('EMAIL_CONTACT_PROFILE', 'RELATIONAL_CONTACT', 'VOTER_RECORD');
CREATE TYPE "CommunicationMatchCandidateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'MERGED');
CREATE TYPE "GoogleContactSourceKind" AS ENUM ('CONTACT', 'OTHER_CONTACT', 'DIRECTORY');
CREATE TYPE "GoogleCalendarEventParticipantRole" AS ENUM ('ORGANIZER', 'CREATOR', 'ATTENDEE');

CREATE TABLE "ExternalIngestRun" (
    "id" TEXT NOT NULL,
    "source" "ExternalIngestSource" NOT NULL,
    "providerAccountEmail" VARCHAR(320),
    "staffUserId" TEXT,
    "requestedByUserId" TEXT,
    "status" "ExternalIngestRunStatus" NOT NULL DEFAULT 'DRAFT',
    "mode" "ExternalIngestRunMode" NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorSummary" TEXT,
    "cursorJson" JSONB,
    "statsJson" JSONB NOT NULL DEFAULT '{}',
    "configJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalIngestRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationIdentity" (
    "id" TEXT NOT NULL,
    "primaryEmail" VARCHAR(320),
    "normalizedEmail" VARCHAR(320),
    "displayName" VARCHAR(500),
    "firstName" VARCHAR(200),
    "lastName" VARCHAR(200),
    "primaryPhone" VARCHAR(64),
    "normalizedPhone" VARCHAR(64),
    "county" VARCHAR(120),
    "city" VARCHAR(120),
    "sourceSummaryJson" JSONB NOT NULL DEFAULT '{}',
    "confidenceScore" DOUBLE PRECISION,
    "reviewStatus" "CommunicationIdentityReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
    "emailContactProfileId" TEXT,
    "relationalContactId" TEXT,
    "voterRecordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationIdentity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunicationIdentity_normalizedEmail_key" ON "CommunicationIdentity"("normalizedEmail");

CREATE TABLE "GmailMessageRecord" (
    "id" TEXT NOT NULL,
    "googleMessageId" VARCHAR(180) NOT NULL,
    "googleThreadId" VARCHAR(180),
    "historyId" VARCHAR(64),
    "internalDate" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "subject" TEXT,
    "snippet" TEXT,
    "labelIdsJson" JSONB NOT NULL DEFAULT '[]',
    "fromText" TEXT,
    "toText" TEXT,
    "ccText" TEXT,
    "bccText" TEXT,
    "replyToText" TEXT,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "bodyHash" VARCHAR(128),
    "hasAttachments" BOOLEAN NOT NULL DEFAULT false,
    "attachmentCount" INTEGER NOT NULL DEFAULT 0,
    "sizeEstimate" INTEGER,
    "providerAccountEmail" VARCHAR(320),
    "staffUserId" TEXT,
    "ingestRunId" TEXT,
    "rawHeadersJson" JSONB,
    "normalizedPayloadJson" JSONB,
    "bodyStorageMode" VARCHAR(64) NOT NULL DEFAULT 'METADATA_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GmailMessageRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GmailMessageRecord_staffUserId_googleMessageId_key" ON "GmailMessageRecord"("staffUserId", "googleMessageId");

CREATE TABLE "GmailMessageParticipant" (
    "id" TEXT NOT NULL,
    "gmailMessageRecordId" TEXT NOT NULL,
    "role" "GmailMessageParticipantRole" NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "displayName" VARCHAR(500),
    "domain" VARCHAR(200),
    "normalizedEmail" VARCHAR(320) NOT NULL,
    "profileLinkStatus" VARCHAR(64) NOT NULL DEFAULT 'UNLINKED',
    "emailContactProfileId" TEXT,
    "communicationIdentityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GmailMessageParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GoogleContactRecord" (
    "id" TEXT NOT NULL,
    "googleResourceName" VARCHAR(512) NOT NULL,
    "etag" VARCHAR(180),
    "displayName" VARCHAR(500),
    "givenName" VARCHAR(200),
    "familyName" VARCHAR(200),
    "primaryEmail" VARCHAR(320),
    "emailsJson" JSONB NOT NULL DEFAULT '[]',
    "phonesJson" JSONB NOT NULL DEFAULT '[]',
    "addressesJson" JSONB NOT NULL DEFAULT '[]',
    "organizationsJson" JSONB NOT NULL DEFAULT '[]',
    "biographiesJson" JSONB,
    "membershipsJson" JSONB,
    "sourceType" "GoogleContactSourceKind" NOT NULL DEFAULT 'CONTACT',
    "providerAccountEmail" VARCHAR(320),
    "ingestRunId" TEXT,
    "communicationIdentityId" TEXT,
    "emailContactProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleContactRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GoogleContactRecord_googleResourceName_key" ON "GoogleContactRecord"("googleResourceName");

CREATE TABLE "GoogleCalendarEventRecord" (
    "id" TEXT NOT NULL,
    "calendarSourceId" TEXT NOT NULL,
    "googleEventId" VARCHAR(180) NOT NULL,
    "recurringEventId" VARCHAR(180),
    "iCalUID" VARCHAR(500),
    "status" VARCHAR(64),
    "summary" TEXT,
    "description" TEXT,
    "location" TEXT,
    "organizerEmail" VARCHAR(320),
    "creatorEmail" VARCHAR(320),
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "timezone" VARCHAR(120),
    "attendeesJson" JSONB,
    "conferenceDataJson" JSONB,
    "recurrenceJson" JSONB,
    "visibility" VARCHAR(64),
    "htmlLink" TEXT,
    "updatedGoogleAt" TIMESTAMP(3),
    "providerAccountEmail" VARCHAR(320),
    "ingestRunId" TEXT,
    "campaignEventId" TEXT,
    "privacyRedacted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCalendarEventRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GoogleCalendarEventRecord_calendarSourceId_googleEventId_key" ON "GoogleCalendarEventRecord"("calendarSourceId", "googleEventId");

CREATE TABLE "GoogleCalendarEventParticipant" (
    "id" TEXT NOT NULL,
    "googleCalendarEventRecordId" TEXT NOT NULL,
    "role" "GoogleCalendarEventParticipantRole" NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "displayName" VARCHAR(500),
    "responseStatus" VARCHAR(64),
    "optional" BOOLEAN,
    "normalizedEmail" VARCHAR(320) NOT NULL,
    "communicationIdentityId" TEXT,
    "emailContactProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoogleCalendarEventParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationIdentitySignal" (
    "id" TEXT NOT NULL,
    "communicationIdentityId" TEXT NOT NULL,
    "source" "CommunicationIdentitySignalSource" NOT NULL,
    "signalType" VARCHAR(120) NOT NULL,
    "value" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "evidenceJson" JSONB NOT NULL DEFAULT '{}',
    "approvedForAudienceUse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationIdentitySignal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunicationProfileMatchCandidate" (
    "id" TEXT NOT NULL,
    "communicationIdentityId" TEXT NOT NULL,
    "targetType" "CommunicationMatchTargetType" NOT NULL,
    "targetId" VARCHAR(64) NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reasonsJson" JSONB NOT NULL DEFAULT '{}',
    "status" "CommunicationMatchCandidateStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationProfileMatchCandidate_pkey" PRIMARY KEY ("id")
);

-- FKs
ALTER TABLE "ExternalIngestRun" ADD CONSTRAINT "ExternalIngestRun_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ExternalIngestRun" ADD CONSTRAINT "ExternalIngestRun_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommunicationIdentity" ADD CONSTRAINT "CommunicationIdentity_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationIdentity" ADD CONSTRAINT "CommunicationIdentity_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationIdentity" ADD CONSTRAINT "CommunicationIdentity_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GmailMessageRecord" ADD CONSTRAINT "GmailMessageRecord_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GmailMessageRecord" ADD CONSTRAINT "GmailMessageRecord_ingestRunId_fkey" FOREIGN KEY ("ingestRunId") REFERENCES "ExternalIngestRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GmailMessageParticipant" ADD CONSTRAINT "GmailMessageParticipant_gmailMessageRecordId_fkey" FOREIGN KEY ("gmailMessageRecordId") REFERENCES "GmailMessageRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GmailMessageParticipant" ADD CONSTRAINT "GmailMessageParticipant_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GmailMessageParticipant" ADD CONSTRAINT "GmailMessageParticipant_communicationIdentityId_fkey" FOREIGN KEY ("communicationIdentityId") REFERENCES "CommunicationIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GoogleContactRecord" ADD CONSTRAINT "GoogleContactRecord_ingestRunId_fkey" FOREIGN KEY ("ingestRunId") REFERENCES "ExternalIngestRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoogleContactRecord" ADD CONSTRAINT "GoogleContactRecord_communicationIdentityId_fkey" FOREIGN KEY ("communicationIdentityId") REFERENCES "CommunicationIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoogleContactRecord" ADD CONSTRAINT "GoogleContactRecord_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GoogleCalendarEventRecord" ADD CONSTRAINT "GoogleCalendarEventRecord_calendarSourceId_fkey" FOREIGN KEY ("calendarSourceId") REFERENCES "CalendarSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoogleCalendarEventRecord" ADD CONSTRAINT "GoogleCalendarEventRecord_ingestRunId_fkey" FOREIGN KEY ("ingestRunId") REFERENCES "ExternalIngestRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoogleCalendarEventRecord" ADD CONSTRAINT "GoogleCalendarEventRecord_campaignEventId_fkey" FOREIGN KEY ("campaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "GoogleCalendarEventParticipant" ADD CONSTRAINT "GoogleCalendarEventParticipant_googleCalendarEventRecordId_fkey" FOREIGN KEY ("googleCalendarEventRecordId") REFERENCES "GoogleCalendarEventRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoogleCalendarEventParticipant" ADD CONSTRAINT "GoogleCalendarEventParticipant_communicationIdentityId_fkey" FOREIGN KEY ("communicationIdentityId") REFERENCES "CommunicationIdentity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GoogleCalendarEventParticipant" ADD CONSTRAINT "GoogleCalendarEventParticipant_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CommunicationIdentitySignal" ADD CONSTRAINT "CommunicationIdentitySignal_communicationIdentityId_fkey" FOREIGN KEY ("communicationIdentityId") REFERENCES "CommunicationIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CommunicationProfileMatchCandidate" ADD CONSTRAINT "CommunicationProfileMatchCandidate_communicationIdentityId_fkey" FOREIGN KEY ("communicationIdentityId") REFERENCES "CommunicationIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunicationProfileMatchCandidate" ADD CONSTRAINT "CommunicationProfileMatchCandidate_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "ExternalIngestRun_source_status_createdAt_idx" ON "ExternalIngestRun"("source", "status", "createdAt");
CREATE INDEX "ExternalIngestRun_staffUserId_idx" ON "ExternalIngestRun"("staffUserId");

CREATE INDEX "GmailMessageRecord_ingestRunId_idx" ON "GmailMessageRecord"("ingestRunId");
CREATE INDEX "GmailMessageRecord_staffUserId_internalDate_idx" ON "GmailMessageRecord"("staffUserId", "internalDate");

CREATE INDEX "GmailMessageParticipant_normalizedEmail_idx" ON "GmailMessageParticipant"("normalizedEmail");
CREATE INDEX "GmailMessageParticipant_gmailMessageRecordId_idx" ON "GmailMessageParticipant"("gmailMessageRecordId");

CREATE INDEX "GoogleContactRecord_primaryEmail_idx" ON "GoogleContactRecord"("primaryEmail");
CREATE INDEX "GoogleContactRecord_ingestRunId_idx" ON "GoogleContactRecord"("ingestRunId");

CREATE INDEX "GoogleCalendarEventRecord_startAt_idx" ON "GoogleCalendarEventRecord"("startAt");
CREATE INDEX "GoogleCalendarEventRecord_ingestRunId_idx" ON "GoogleCalendarEventRecord"("ingestRunId");

CREATE INDEX "GoogleCalendarEventParticipant_normalizedEmail_idx" ON "GoogleCalendarEventParticipant"("normalizedEmail");
CREATE INDEX "GoogleCalendarEventParticipant_googleCalendarEventRecordId_idx" ON "GoogleCalendarEventParticipant"("googleCalendarEventRecordId");

CREATE INDEX "CommunicationIdentity_reviewStatus_idx" ON "CommunicationIdentity"("reviewStatus");

CREATE INDEX "CommunicationIdentitySignal_communicationIdentityId_idx" ON "CommunicationIdentitySignal"("communicationIdentityId");

CREATE INDEX "CommunicationProfileMatchCandidate_communicationIdentityId_status_idx" ON "CommunicationProfileMatchCandidate"("communicationIdentityId", "status");
