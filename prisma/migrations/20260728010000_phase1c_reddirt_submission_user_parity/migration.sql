-- Phase 1C — RedDirt Submission + User schema parity (additive only).
--
-- Ownership evidence (see docs/KELLY_PUBLIC_EXPERIENCE_PHASE_1C_DATABASE_PARITY.md):
--   - Legacy public.submissions (module_id, raw_data) is NOT RedDirt-owned. Leave untouched.
--   - Init migration intended PascalCase "Submission"; baseline markers had applied_steps_count=0.
--   - User.linkedVoterRecordId was marked applied without durable column; VoterRecord table absent.
--
-- Strategy B: create RedDirt-owned "Submission"; add nullable linkedVoterRecordId without inventing voters.
-- FK to VoterRecord is deferred unless that table already exists.

-- 1) RedDirt form submissions (physical name matches Prisma model default; no @@map to legacy).
CREATE TABLE IF NOT EXISTS "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "structuredData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Submission_userId_fkey'
  ) THEN
    ALTER TABLE "Submission"
      ADD CONSTRAINT "Submission_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 2) Restore WorkflowIntake → Submission FK when missing (campaignos migration was baseline-lied).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'WorkflowIntake' AND column_name = 'submissionId'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'WorkflowIntake_submissionId_fkey'
  ) THEN
    ALTER TABLE "WorkflowIntake"
      ADD CONSTRAINT "WorkflowIntake_submissionId_fkey"
      FOREIGN KEY ("submissionId") REFERENCES "Submission"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- 3) Additive nullable User.linkedVoterRecordId (no backfill; null is correct default).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "linkedVoterRecordId" TEXT;

-- 4) FK only when VoterRecord exists (it does not on this shared DB as of Phase 1C).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'VoterRecord'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_linkedVoterRecordId_fkey'
  ) THEN
    ALTER TABLE "User"
      ADD CONSTRAINT "User_linkedVoterRecordId_fkey"
      FOREIGN KEY ("linkedVoterRecordId") REFERENCES "VoterRecord"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
