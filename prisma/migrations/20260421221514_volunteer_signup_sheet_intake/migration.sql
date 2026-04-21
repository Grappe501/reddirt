-- CreateEnum
CREATE TYPE "SignupSheetDocumentStatus" AS ENUM ('DRAFT', 'QUEUED', 'EXTRACTING', 'EXTRACTED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "SignupSheetExtractionStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "SignupSheetEntryStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SKIPPED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkedVoterRecordId" TEXT;

-- AlterTable
ALTER TABLE "VoterRecord" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone10" TEXT;

-- CreateTable
CREATE TABLE "SignupSheetDocument" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "status" "SignupSheetDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "lastExtractionId" TEXT,
    "notes" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignupSheetDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupSheetExtraction" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "status" "SignupSheetExtractionStatus" NOT NULL DEFAULT 'PENDING',
    "model" TEXT,
    "rawOcrText" TEXT,
    "parsedOutputJson" JSONB,
    "errorMessage" TEXT,
    "avgConfidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignupSheetExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignupSheetEntry" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "extractionId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "countyText" TEXT,
    "countyId" TEXT,
    "rawRowText" TEXT NOT NULL,
    "parsedJson" JSONB,
    "confidenceScore" DOUBLE PRECISION,
    "approvalStatus" "SignupSheetEntryStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "matchedVoterRecordId" TEXT,
    "matchedUserId" TEXT,
    "notes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,

    CONSTRAINT "SignupSheetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerMatchCandidate" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "voterRecordId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasonJson" JSONB NOT NULL DEFAULT '{}',
    "rank" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerMatchCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SignupSheetDocument_ownedMediaId_key" ON "SignupSheetDocument"("ownedMediaId");

-- CreateIndex
CREATE INDEX "SignupSheetDocument_status_updatedAt_idx" ON "SignupSheetDocument"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "SignupSheetExtraction_documentId_createdAt_idx" ON "SignupSheetExtraction"("documentId", "createdAt");

-- CreateIndex
CREATE INDEX "SignupSheetEntry_documentId_approvalStatus_idx" ON "SignupSheetEntry"("documentId", "approvalStatus");

-- CreateIndex
CREATE INDEX "SignupSheetEntry_extractionId_rowIndex_idx" ON "SignupSheetEntry"("extractionId", "rowIndex");

-- CreateIndex
CREATE INDEX "SignupSheetEntry_approvalStatus_confidenceScore_idx" ON "SignupSheetEntry"("approvalStatus", "confidenceScore");

-- CreateIndex
CREATE INDEX "VolunteerMatchCandidate_entryId_score_idx" ON "VolunteerMatchCandidate"("entryId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerMatchCandidate_entryId_voterRecordId_key" ON "VolunteerMatchCandidate"("entryId", "voterRecordId");

-- CreateIndex
CREATE INDEX "VoterRecord_countyId_lastName_firstName_idx" ON "VoterRecord"("countyId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "VoterRecord_phone10_idx" ON "VoterRecord"("phone10");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedVoterRecordId_fkey" FOREIGN KEY ("linkedVoterRecordId") REFERENCES "VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_lastExtractionId_fkey" FOREIGN KEY ("lastExtractionId") REFERENCES "SignupSheetExtraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetDocument" ADD CONSTRAINT "SignupSheetDocument_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetExtraction" ADD CONSTRAINT "SignupSheetExtraction_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SignupSheetDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "SignupSheetDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "SignupSheetExtraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_matchedVoterRecordId_fkey" FOREIGN KEY ("matchedVoterRecordId") REFERENCES "VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignupSheetEntry" ADD CONSTRAINT "SignupSheetEntry_matchedUserId_fkey" FOREIGN KEY ("matchedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerMatchCandidate" ADD CONSTRAINT "VolunteerMatchCandidate_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "SignupSheetEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerMatchCandidate" ADD CONSTRAINT "VolunteerMatchCandidate_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
