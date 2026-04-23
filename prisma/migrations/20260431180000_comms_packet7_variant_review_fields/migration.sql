-- Packet 7: CommunicationVariant review parity with CommunicationDraft + enum values
-- (Enum additions may need to run outside a transaction in some PostgreSQL versions; if migrate fails, run the ALTER TYPE lines manually then re-run migrate.)

-- AlterEnum
ALTER TYPE "CommunicationVariantStatus" ADD VALUE 'READY_FOR_REVIEW';
ALTER TYPE "CommunicationVariantStatus" ADD VALUE 'REJECTED';

-- Data: legacy READY (inbox) → READY_FOR_REVIEW
UPDATE "CommunicationVariant" SET status = 'READY_FOR_REVIEW'::"CommunicationVariantStatus" WHERE status = 'READY'::"CommunicationVariantStatus";

-- AlterTable
ALTER TABLE "CommunicationVariant" ADD COLUMN "reviewRequestedAt" TIMESTAMP(3);
ALTER TABLE "CommunicationVariant" ADD COLUMN "reviewRequestedByUserId" TEXT;
ALTER TABLE "CommunicationVariant" ADD COLUMN "reviewedAt" TIMESTAMP(3);
ALTER TABLE "CommunicationVariant" ADD COLUMN "reviewedByUserId" TEXT;
ALTER TABLE "CommunicationVariant" ADD COLUMN "reviewDecision" "CommunicationReviewDecision";
ALTER TABLE "CommunicationVariant" ADD COLUMN "reviewNotes" TEXT;

-- AddForeignKey
ALTER TABLE "CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_reviewRequestedByUserId_fkey" FOREIGN KEY ("reviewRequestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CommunicationVariant" ADD CONSTRAINT "CommunicationVariant_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "CommunicationVariant_reviewRequestedByUserId_idx" ON "CommunicationVariant"("reviewRequestedByUserId");
CREATE INDEX "CommunicationVariant_reviewedByUserId_idx" ON "CommunicationVariant"("reviewedByUserId");
