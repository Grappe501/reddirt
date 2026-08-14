-- CONTACT-INTEL dossier queues — voter ID match state only.
-- Does not create, update, or reference VoterRecord / voter-file tables.

CREATE TYPE "ContactIntelVoterMatchStatus" AS ENUM ('UNMATCHED', 'NEEDS_REVIEW', 'MATCHED', 'NO_MATCH');
CREATE TYPE "ContactIntelVoterMatchMethod" AS ENUM ('MANUAL', 'OSCAR', 'GEO');

CREATE TABLE "ContactIntelVoterMatch" (
  "id" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "status" "ContactIntelVoterMatchStatus" NOT NULL DEFAULT 'UNMATCHED',
  "voterId" VARCHAR(80),
  "confidence" INTEGER NOT NULL DEFAULT 0,
  "method" "ContactIntelVoterMatchMethod" NOT NULL DEFAULT 'MANUAL',
  "ladderJson" JSONB NOT NULL DEFAULT '{}',
  "oscarNote" TEXT,
  "evidenceJson" JSONB NOT NULL DEFAULT '{}',
  "matchedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactIntelVoterMatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContactIntelVoterMatch_personId_key" ON "ContactIntelVoterMatch"("personId");
CREATE INDEX "ContactIntelVoterMatch_status_updatedAt_idx" ON "ContactIntelVoterMatch"("status", "updatedAt");
CREATE INDEX "ContactIntelVoterMatch_voterId_idx" ON "ContactIntelVoterMatch"("voterId");

ALTER TABLE "ContactIntelVoterMatch"
ADD CONSTRAINT "ContactIntelVoterMatch_personId_fkey"
FOREIGN KEY ("personId") REFERENCES "ContactIntelPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
