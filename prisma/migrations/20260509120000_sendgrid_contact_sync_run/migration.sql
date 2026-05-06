-- EMAIL-SENDGRID-CONTACT-SYNC-1.1 — operator audit rows for SendGrid contact sync preview/approval (no sends).

CREATE TYPE "SendGridContactSyncRunStatus" AS ENUM ('PREVIEWED', 'APPROVED', 'SYNCED', 'FAILED', 'ARCHIVED');

CREATE TABLE "SendGridContactSyncRun" (
    "id" TEXT NOT NULL,
    "audienceDefinitionId" TEXT,
    "status" "SendGridContactSyncRunStatus" NOT NULL DEFAULT 'PREVIEWED',
    "candidateCount" INTEGER NOT NULL DEFAULT 0,
    "excludedSuppressedCount" INTEGER NOT NULL DEFAULT 0,
    "excludedMissingEmailCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "sendgridListId" VARCHAR(120),
    "sendgridSegmentId" VARCHAR(120),
    "previewJson" JSONB NOT NULL,
    "resultJson" JSONB NOT NULL DEFAULT '{}',
    "createdByUserId" TEXT,
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SendGridContactSyncRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SendGridContactSyncRun_audienceDefinitionId_createdAt_idx" ON "SendGridContactSyncRun"("audienceDefinitionId", "createdAt");

CREATE INDEX "SendGridContactSyncRun_status_createdAt_idx" ON "SendGridContactSyncRun"("status", "createdAt");

ALTER TABLE "SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_audienceDefinitionId_fkey" FOREIGN KEY ("audienceDefinitionId") REFERENCES "EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SendGridContactSyncRun" ADD CONSTRAINT "SendGridContactSyncRun_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
