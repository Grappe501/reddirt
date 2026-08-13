-- CONTACT-INTEL-1.0 — unified email/phone contact library (spreadsheet ingest).
-- Additive only. Does not alter EmailContactProfile, RelationalContact, or User identity.

CREATE TYPE "ContactIntelMethodKind" AS ENUM ('EMAIL', 'PHONE');

CREATE TYPE "ContactIntelImportJobStatus" AS ENUM (
  'UPLOADED',
  'PREVIEWED',
  'COMMITTED',
  'FAILED'
);

CREATE TYPE "ContactIntelSourceRowStatus" AS ENUM (
  'PENDING',
  'INVALID',
  'NEW',
  'UPDATE',
  'CONFLICT',
  'SKIPPED',
  'COMMITTED'
);

CREATE TYPE "ContactIntelConflictStatus" AS ENUM ('OPEN', 'DISMISSED');

CREATE TABLE "ContactIntelPerson" (
  "id" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "firstName" VARCHAR(200),
  "lastName" VARCHAR(200),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelPerson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactIntelMethod" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "kind" "ContactIntelMethodKind" NOT NULL,
  "originalValue" TEXT NOT NULL,
  "normalizedValue" VARCHAR(320) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ContactIntelMethod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactIntelImportJob" (
  "id" TEXT NOT NULL,
  "originalFilename" VARCHAR(500) NOT NULL,
  "fileHash" VARCHAR(64) NOT NULL,
  "sourceLabel" VARCHAR(320),
  "status" "ContactIntelImportJobStatus" NOT NULL DEFAULT 'UPLOADED',
  "mappingJson" JSONB NOT NULL DEFAULT '{}',
  "headerJson" JSONB NOT NULL DEFAULT '[]',
  "statsJson" JSONB NOT NULL DEFAULT '{}',
  "previewJson" JSONB NOT NULL DEFAULT '{}',
  "errorSummary" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "committedAt" TIMESTAMP(3),

  CONSTRAINT "ContactIntelImportJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactIntelSourceRow" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "rowNumber" INTEGER NOT NULL,
  "rawJson" JSONB NOT NULL DEFAULT '{}',
  "rowHash" VARCHAR(64) NOT NULL,
  "status" "ContactIntelSourceRowStatus" NOT NULL DEFAULT 'PENDING',
  "displayName" TEXT,
  "firstName" VARCHAR(200),
  "lastName" VARCHAR(200),
  "emailsJson" JSONB NOT NULL DEFAULT '[]',
  "phonesJson" JSONB NOT NULL DEFAULT '[]',
  "personId" TEXT,
  "messagesJson" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelSourceRow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactIntelConflict" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "sourceRowId" TEXT NOT NULL,
  "leftPersonId" TEXT NOT NULL,
  "rightPersonId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" "ContactIntelConflictStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelConflict_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactIntelPerson_displayName_idx" ON "ContactIntelPerson"("displayName");
CREATE INDEX "ContactIntelPerson_updatedAt_idx" ON "ContactIntelPerson"("updatedAt");

CREATE UNIQUE INDEX "ContactIntelMethod_kind_normalizedValue_key" ON "ContactIntelMethod"("kind", "normalizedValue");
CREATE INDEX "ContactIntelMethod_personId_idx" ON "ContactIntelMethod"("personId");
CREATE INDEX "ContactIntelMethod_normalizedValue_idx" ON "ContactIntelMethod"("normalizedValue");

CREATE INDEX "ContactIntelImportJob_fileHash_idx" ON "ContactIntelImportJob"("fileHash");
CREATE INDEX "ContactIntelImportJob_status_createdAt_idx" ON "ContactIntelImportJob"("status", "createdAt");
CREATE INDEX "ContactIntelImportJob_createdByUserId_idx" ON "ContactIntelImportJob"("createdByUserId");

CREATE UNIQUE INDEX "ContactIntelSourceRow_jobId_rowNumber_key" ON "ContactIntelSourceRow"("jobId", "rowNumber");
CREATE INDEX "ContactIntelSourceRow_jobId_status_idx" ON "ContactIntelSourceRow"("jobId", "status");
CREATE INDEX "ContactIntelSourceRow_rowHash_idx" ON "ContactIntelSourceRow"("rowHash");
CREATE INDEX "ContactIntelSourceRow_personId_idx" ON "ContactIntelSourceRow"("personId");

CREATE INDEX "ContactIntelConflict_jobId_status_idx" ON "ContactIntelConflict"("jobId", "status");
CREATE INDEX "ContactIntelConflict_sourceRowId_idx" ON "ContactIntelConflict"("sourceRowId");

ALTER TABLE "ContactIntelMethod"
  ADD CONSTRAINT "ContactIntelMethod_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "ContactIntelPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelImportJob"
  ADD CONSTRAINT "ContactIntelImportJob_createdByUserId_fkey"
  FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContactIntelSourceRow"
  ADD CONSTRAINT "ContactIntelSourceRow_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "ContactIntelImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelSourceRow"
  ADD CONSTRAINT "ContactIntelSourceRow_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "ContactIntelPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContactIntelConflict"
  ADD CONSTRAINT "ContactIntelConflict_jobId_fkey"
  FOREIGN KEY ("jobId") REFERENCES "ContactIntelImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelConflict"
  ADD CONSTRAINT "ContactIntelConflict_sourceRowId_fkey"
  FOREIGN KEY ("sourceRowId") REFERENCES "ContactIntelSourceRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelConflict"
  ADD CONSTRAINT "ContactIntelConflict_leftPersonId_fkey"
  FOREIGN KEY ("leftPersonId") REFERENCES "ContactIntelPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelConflict"
  ADD CONSTRAINT "ContactIntelConflict_rightPersonId_fkey"
  FOREIGN KEY ("rightPersonId") REFERENCES "ContactIntelPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
