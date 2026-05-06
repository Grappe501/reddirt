-- EMAIL-CONTACT-IMPORT-STAGING-1.0 — governed CSV staging (no SendGrid, no sends).

CREATE TYPE "EmailContactImportBatchStatus" AS ENUM (
  'UPLOADED',
  'PARSED',
  'VALIDATED',
  'READY_FOR_APPROVAL',
  'APPROVED',
  'COMMITTED',
  'FAILED',
  'ARCHIVED'
);

CREATE TYPE "EmailContactImportRowValidationStatus" AS ENUM (
  'VALID',
  'WARNING',
  'INVALID',
  'DUPLICATE',
  'EXISTING_MATCH'
);

CREATE TYPE "EmailContactImportDecisionType" AS ENUM (
  'APPROVE_BATCH',
  'REJECT_BATCH',
  'SKIP_ROW',
  'INCLUDE_ROW',
  'MERGE_WITH_EXISTING',
  'CREATE_PROFILE'
);

CREATE TABLE "EmailContactImportBatch" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "sourceLabel" VARCHAR(320),
    "originalFilename" VARCHAR(500) NOT NULL,
    "status" "EmailContactImportBatchStatus" NOT NULL DEFAULT 'UPLOADED',
    "rowCount" INTEGER NOT NULL DEFAULT 0,
    "validRowCount" INTEGER NOT NULL DEFAULT 0,
    "invalidRowCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateRowCount" INTEGER NOT NULL DEFAULT 0,
    "existingProfileMatchCount" INTEGER NOT NULL DEFAULT 0,
    "consentWarningCount" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "committedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactImportBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailContactImportRow" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawJson" JSONB NOT NULL DEFAULT '{}',
    "normalizedEmail" VARCHAR(320),
    "firstName" VARCHAR(200),
    "lastName" VARCHAR(200),
    "phone" VARCHAR(80),
    "county" VARCHAR(120),
    "city" VARCHAR(120),
    "state" VARCHAR(32),
    "sourceList" VARCHAR(320),
    "sourceDate" VARCHAR(80),
    "consentStatus" VARCHAR(120),
    "tagsJson" JSONB NOT NULL DEFAULT '[]',
    "organization" VARCHAR(320),
    "role" VARCHAR(200),
    "notes" TEXT,
    "volunteerInterest" VARCHAR(320),
    "donorInterest" VARCHAR(320),
    "issueInterest" VARCHAR(320),
    "validationStatus" "EmailContactImportRowValidationStatus" NOT NULL DEFAULT 'VALID',
    "validationMessagesJson" JSONB NOT NULL DEFAULT '[]',
    "matchedProfileId" TEXT,
    "committedProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactImportRow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailContactImportDecision" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowId" TEXT,
    "decisionType" "EmailContactImportDecisionType" NOT NULL,
    "reason" TEXT NOT NULL,
    "decidedByUserId" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EmailContactImportDecision_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailContactImportBatch_status_createdAt_idx" ON "EmailContactImportBatch"("status", "createdAt");
CREATE INDEX "EmailContactImportBatch_createdByUserId_idx" ON "EmailContactImportBatch"("createdByUserId");

CREATE INDEX "EmailContactImportRow_batchId_rowNumber_idx" ON "EmailContactImportRow"("batchId", "rowNumber");
CREATE INDEX "EmailContactImportRow_batchId_normalizedEmail_idx" ON "EmailContactImportRow"("batchId", "normalizedEmail");
CREATE INDEX "EmailContactImportRow_matchedProfileId_idx" ON "EmailContactImportRow"("matchedProfileId");
CREATE INDEX "EmailContactImportRow_committedProfileId_idx" ON "EmailContactImportRow"("committedProfileId");

CREATE INDEX "EmailContactImportDecision_batchId_decidedAt_idx" ON "EmailContactImportDecision"("batchId", "decidedAt");

ALTER TABLE "EmailContactImportBatch" ADD CONSTRAINT "EmailContactImportBatch_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailContactImportBatch" ADD CONSTRAINT "EmailContactImportBatch_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "EmailContactImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_matchedProfileId_fkey" FOREIGN KEY ("matchedProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailContactImportRow" ADD CONSTRAINT "EmailContactImportRow_committedProfileId_fkey" FOREIGN KEY ("committedProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "EmailContactImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "EmailContactImportRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailContactImportDecision" ADD CONSTRAINT "EmailContactImportDecision_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
