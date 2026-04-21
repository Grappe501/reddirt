-- CreateEnum
CREATE TYPE "VoterSnapshotChangeType" AS ENUM ('NEW', 'UPDATED', 'REMOVED', 'REACTIVATED');

-- AlterTable: VoterFileSnapshot
ALTER TABLE "VoterFileSnapshot" ADD COLUMN "fileReceivedAt" TIMESTAMP(3);

-- AlterTable: CountyVoterMetrics — new columns (backfill from County before NOT NULL)
ALTER TABLE "CountyVoterMetrics" ADD COLUMN "countySlug" TEXT;
ALTER TABLE "CountyVoterMetrics" ADD COLUMN "totalRegisteredCount" INTEGER;

UPDATE "CountyVoterMetrics" AS m
SET "countySlug" = c."slug"
FROM "County" AS c
WHERE c."id" = m."countyId";

UPDATE "CountyVoterMetrics" SET "countySlug" = 'unknown' WHERE "countySlug" IS NULL;

ALTER TABLE "CountyVoterMetrics" ALTER COLUMN "countySlug" SET NOT NULL;

-- AlterTable: VoterRecord (warehouse hardening) — if table is empty, still safe
ALTER TABLE "VoterRecord" ADD COLUMN "countySlug" TEXT;
ALTER TABLE "VoterRecord" ADD COLUMN "city" TEXT;
ALTER TABLE "VoterRecord" ADD COLUMN "precinct" TEXT;
ALTER TABLE "VoterRecord" ADD COLUMN "updatedFromSnapshotId" TEXT;
ALTER TABLE "VoterRecord" ADD COLUMN "droppedOffAt" TIMESTAMP(3);

UPDATE "VoterRecord" AS v
SET "countySlug" = c."slug"
FROM "County" AS c
WHERE c."id" = v."countyId";

UPDATE "VoterRecord" SET "countySlug" = 'unknown' WHERE "countySlug" IS NULL;

ALTER TABLE "VoterRecord" ALTER COLUMN "countySlug" SET NOT NULL;

-- CreateTable: VoterSnapshotChange
CREATE TABLE "VoterSnapshotChange" (
    "id" TEXT NOT NULL,
    "voterFileSnapshotId" TEXT NOT NULL,
    "voterRecordId" TEXT,
    "voterFileKey" TEXT NOT NULL,
    "changeType" "VoterSnapshotChangeType" NOT NULL,
    "countyId" TEXT NOT NULL,
    "countySlug" TEXT NOT NULL,
    "summaryJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoterSnapshotChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_voterFileSnapshotId_changeType_idx" ON "VoterSnapshotChange"("voterFileSnapshotId", "changeType");

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_countySlug_voterFileSnapshotId_idx" ON "VoterSnapshotChange"("countySlug", "voterFileSnapshotId");

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_voterFileKey_idx" ON "VoterSnapshotChange"("voterFileKey");

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_updatedFromSnapshotId_fkey" FOREIGN KEY ("updatedFromSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_voterFileSnapshotId_fkey" FOREIGN KEY ("voterFileSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VoterRecord indexes
CREATE INDEX "VoterRecord_countySlug_idx" ON "VoterRecord"("countySlug");

-- CountyVoterMetrics index (may duplicate name — skip if exists)
CREATE INDEX IF NOT EXISTS "CountyVoterMetrics_countySlug_asOfDate_idx" ON "CountyVoterMetrics"("countySlug", "asOfDate");
