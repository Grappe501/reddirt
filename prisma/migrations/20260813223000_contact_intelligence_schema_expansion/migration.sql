-- CONTACT-INTEL-1.0 Phase 5 — addresses, tags, governed custom fields.
-- Additive only. Does not alter ContactIntelMethod uniqueness or other identity tables.

CREATE TYPE "ContactIntelCustomFieldType" AS ENUM ('TEXT');

ALTER TABLE "ContactIntelSourceRow"
ADD COLUMN "enrichmentJson" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE "ContactIntelAddress" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "line" VARCHAR(500),
  "city" VARCHAR(200),
  "state" VARCHAR(80),
  "postalCode" VARCHAR(20),
  "originalJson" JSONB NOT NULL DEFAULT '{}',
  "fingerprint" VARCHAR(64) NOT NULL,
  "sourceRowId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelAddress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactIntelTag" (
  "id" TEXT NOT NULL,
  "name" VARCHAR(200) NOT NULL,
  "key" VARCHAR(200) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactIntelPersonTag" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  "sourceRowId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ContactIntelPersonTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactIntelCustomFieldDefinition" (
  "id" TEXT NOT NULL,
  "key" VARCHAR(80) NOT NULL,
  "label" VARCHAR(200) NOT NULL,
  "type" "ContactIntelCustomFieldType" NOT NULL DEFAULT 'TEXT',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelCustomFieldDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactIntelCustomFieldValue" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "definitionId" TEXT NOT NULL,
  "originalValue" TEXT NOT NULL,
  "normalizedValue" VARCHAR(500) NOT NULL,
  "sourceRowId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelCustomFieldValue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContactIntelAddress_personId_fingerprint_key" ON "ContactIntelAddress"("personId", "fingerprint");
CREATE INDEX "ContactIntelAddress_personId_idx" ON "ContactIntelAddress"("personId");
CREATE INDEX "ContactIntelAddress_fingerprint_idx" ON "ContactIntelAddress"("fingerprint");
CREATE INDEX "ContactIntelAddress_sourceRowId_idx" ON "ContactIntelAddress"("sourceRowId");

CREATE UNIQUE INDEX "ContactIntelTag_key_key" ON "ContactIntelTag"("key");

CREATE UNIQUE INDEX "ContactIntelPersonTag_personId_tagId_key" ON "ContactIntelPersonTag"("personId", "tagId");
CREATE INDEX "ContactIntelPersonTag_tagId_idx" ON "ContactIntelPersonTag"("tagId");
CREATE INDEX "ContactIntelPersonTag_sourceRowId_idx" ON "ContactIntelPersonTag"("sourceRowId");

CREATE UNIQUE INDEX "ContactIntelCustomFieldDefinition_key_key" ON "ContactIntelCustomFieldDefinition"("key");

CREATE UNIQUE INDEX "ContactIntelCustomFieldValue_personId_definitionId_key" ON "ContactIntelCustomFieldValue"("personId", "definitionId");
CREATE INDEX "ContactIntelCustomFieldValue_definitionId_idx" ON "ContactIntelCustomFieldValue"("definitionId");
CREATE INDEX "ContactIntelCustomFieldValue_normalizedValue_idx" ON "ContactIntelCustomFieldValue"("normalizedValue");
CREATE INDEX "ContactIntelCustomFieldValue_sourceRowId_idx" ON "ContactIntelCustomFieldValue"("sourceRowId");

ALTER TABLE "ContactIntelAddress"
ADD CONSTRAINT "ContactIntelAddress_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "ContactIntelPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelAddress"
ADD CONSTRAINT "ContactIntelAddress_sourceRowId_fkey"
FOREIGN KEY ("sourceRowId") REFERENCES "ContactIntelSourceRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContactIntelPersonTag"
ADD CONSTRAINT "ContactIntelPersonTag_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "ContactIntelPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelPersonTag"
ADD CONSTRAINT "ContactIntelPersonTag_tagId_fkey"
FOREIGN KEY ("tagId") REFERENCES "ContactIntelTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelPersonTag"
ADD CONSTRAINT "ContactIntelPersonTag_sourceRowId_fkey"
FOREIGN KEY ("sourceRowId") REFERENCES "ContactIntelSourceRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ContactIntelCustomFieldValue"
ADD CONSTRAINT "ContactIntelCustomFieldValue_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "ContactIntelPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelCustomFieldValue"
ADD CONSTRAINT "ContactIntelCustomFieldValue_definitionId_fkey"
FOREIGN KEY ("definitionId") REFERENCES "ContactIntelCustomFieldDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContactIntelCustomFieldValue"
ADD CONSTRAINT "ContactIntelCustomFieldValue_sourceRowId_fkey"
FOREIGN KEY ("sourceRowId") REFERENCES "ContactIntelSourceRow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
