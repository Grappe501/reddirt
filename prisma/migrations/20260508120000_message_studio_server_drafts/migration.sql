-- EMAIL-MESSAGE-STUDIO-SERVER-DRAFTS-1.0 — shared campaign drafts (persistence/review only; no execution).

CREATE TYPE "MessageStudioDraftStatus" AS ENUM (
  'DRAFT',
  'NEEDS_REVIEW',
  'IN_REVIEW',
  'APPROVED_FOR_SEND_GOVERNANCE',
  'ARCHIVED'
);

CREATE TABLE "MessageStudioDraft" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "draftType" VARCHAR(240) NOT NULL DEFAULT '',
    "status" "MessageStudioDraftStatus" NOT NULL DEFAULT 'DRAFT',
    "subject" TEXT NOT NULL DEFAULT '',
    "preheader" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "audienceNote" TEXT NOT NULL DEFAULT '',
    "primaryCta" VARCHAR(500) NOT NULL DEFAULT '',
    "tone" VARCHAR(240) NOT NULL DEFAULT '',
    "approvalStatus" VARCHAR(64) NOT NULL DEFAULT 'draft',
    "approvalNotes" TEXT NOT NULL DEFAULT '',
    "complianceNotes" TEXT NOT NULL DEFAULT '',
    "campaignVoiceJson" JSONB NOT NULL DEFAULT '{}',
    "qualityChecklistJson" JSONB NOT NULL DEFAULT '{}',
    "editorialReviewJson" JSONB NOT NULL DEFAULT '{}',
    "templateJson" JSONB NOT NULL DEFAULT '{}',
    "sendPacketJson" JSONB,
    "sourceContextJson" JSONB NOT NULL DEFAULT '{}',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "assignedReviewerUserId" TEXT,
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageStudioDraft_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MessageStudioDraftRevision" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "revisionNumber" INTEGER NOT NULL,
    "snapshotJson" JSONB NOT NULL,
    "note" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageStudioDraftRevision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MessageStudioDraftRevision_draftId_revisionNumber_key" ON "MessageStudioDraftRevision"("draftId", "revisionNumber");

CREATE INDEX "MessageStudioDraft_status_updatedAt_idx" ON "MessageStudioDraft"("status", "updatedAt");

CREATE INDEX "MessageStudioDraft_updatedAt_idx" ON "MessageStudioDraft"("updatedAt");

CREATE INDEX "MessageStudioDraftRevision_draftId_createdAt_idx" ON "MessageStudioDraftRevision"("draftId", "createdAt");

ALTER TABLE "MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_assignedReviewerUserId_fkey" FOREIGN KEY ("assignedReviewerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MessageStudioDraft" ADD CONSTRAINT "MessageStudioDraft_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MessageStudioDraftRevision" ADD CONSTRAINT "MessageStudioDraftRevision_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "MessageStudioDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MessageStudioDraftRevision" ADD CONSTRAINT "MessageStudioDraftRevision_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
