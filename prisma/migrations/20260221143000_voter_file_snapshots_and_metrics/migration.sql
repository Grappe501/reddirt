-- Voter file pipeline: snapshots, per-county rollups, canonical voter keys for diffs

-- CreateEnum
CREATE TYPE "VoterFileIngestStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateTable
CREATE TABLE "VoterFileSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileAsOfDate" TIMESTAMP(3) NOT NULL,
    "previousSnapshotId" TEXT,
    "sourceFilename" TEXT,
    "sourceFileHash" TEXT,
    "rowCountProcessed" INTEGER,
    "status" "VoterFileIngestStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "operatorNotes" TEXT,

    CONSTRAINT "VoterFileSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountyVoterMetrics" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "voterFileSnapshotId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "registrationBaselineDate" TIMESTAMP(3) NOT NULL,
    "newRegistrationsSinceBaseline" INTEGER NOT NULL DEFAULT 0,
    "newRegistrationsSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "droppedSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "netChangeSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "countyGoal" INTEGER,
    "progressPercent" DOUBLE PRECISION,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',

    CONSTRAINT "CountyVoterMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterRecord" (
    "id" TEXT NOT NULL,
    "voterFileKey" TEXT NOT NULL,
    "countyFips" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3),
    "firstSeenSnapshotId" TEXT NOT NULL,
    "lastSeenSnapshotId" TEXT NOT NULL,
    "droppedAtSnapshotId" TEXT,
    "inLatestCompletedFile" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoterFileSnapshot_sourceFileHash_key" ON "VoterFileSnapshot"("sourceFileHash");

-- CreateIndex
CREATE INDEX "VoterFileSnapshot_fileAsOfDate_idx" ON "VoterFileSnapshot"("fileAsOfDate");

-- CreateIndex
CREATE INDEX "VoterFileSnapshot_status_fileAsOfDate_idx" ON "VoterFileSnapshot"("status", "fileAsOfDate");

-- CreateIndex
CREATE INDEX "CountyVoterMetrics_asOfDate_idx" ON "CountyVoterMetrics"("asOfDate");

-- CreateIndex
CREATE INDEX "CountyVoterMetrics_countyId_asOfDate_idx" ON "CountyVoterMetrics"("countyId", "asOfDate");

-- CreateIndex
CREATE UNIQUE INDEX "CountyVoterMetrics_countyId_voterFileSnapshotId_key" ON "CountyVoterMetrics"("countyId", "voterFileSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterRecord_voterFileKey_key" ON "VoterRecord"("voterFileKey");

-- CreateIndex
CREATE INDEX "VoterRecord_countyId_inLatestCompletedFile_idx" ON "VoterRecord"("countyId", "inLatestCompletedFile");

-- CreateIndex
CREATE INDEX "VoterRecord_countyFips_idx" ON "VoterRecord"("countyFips");

-- CreateIndex
CREATE INDEX "VoterRecord_registrationDate_idx" ON "VoterRecord"("registrationDate");

-- AddForeignKey
ALTER TABLE "VoterFileSnapshot" ADD CONSTRAINT "VoterFileSnapshot_previousSnapshotId_fkey" FOREIGN KEY ("previousSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountyVoterMetrics" ADD CONSTRAINT "CountyVoterMetrics_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountyVoterMetrics" ADD CONSTRAINT "CountyVoterMetrics_voterFileSnapshotId_fkey" FOREIGN KEY ("voterFileSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_firstSeenSnapshotId_fkey" FOREIGN KEY ("firstSeenSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_lastSeenSnapshotId_fkey" FOREIGN KEY ("lastSeenSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_droppedAtSnapshotId_fkey" FOREIGN KEY ("droppedAtSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
