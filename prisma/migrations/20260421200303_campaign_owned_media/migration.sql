-- CreateEnum
CREATE TYPE "OwnedMediaKind" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "OwnedMediaRole" AS ENUM ('SPEECH', 'ROAD_CLIP', 'PHOTO', 'EVENT', 'AD_CREATIVE', 'B_ROLL', 'GRAPHIC', 'INTERVIEW', 'OTHER');

-- CreateEnum
CREATE TYPE "OwnedMediaSourceType" AS ENUM ('DIRECT_UPLOAD', 'IMPORT', 'MIGRATED', 'OTHER');

-- CreateEnum
CREATE TYPE "OwnedMediaReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TranscriptionJobStatus" AS ENUM ('NOT_REQUESTED', 'QUEUED', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "TranscriptSource" AS ENUM ('HUMAN', 'ASR', 'ASR_DRAFT', 'IMPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "TranscriptReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_EDIT');

-- CreateEnum
CREATE TYPE "QuoteCandidateType" AS ENUM ('SUGGESTED', 'EDITOR_PICK', 'SOCIAL_CROP', 'PRESS', 'OTHER');

-- CreateEnum
CREATE TYPE "QuoteReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "OwnedMediaAsset" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT,
    "fileName" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "kind" "OwnedMediaKind" NOT NULL,
    "role" "OwnedMediaRole" NOT NULL DEFAULT 'OTHER',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "durationSeconds" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "eventDate" TIMESTAMP(3),
    "countySlug" TEXT,
    "countyFips" TEXT,
    "city" TEXT,
    "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "campaignPhase" TEXT,
    "contentSeries" TEXT,
    "speakerName" TEXT,
    "sourceType" "OwnedMediaSourceType" NOT NULL DEFAULT 'DIRECT_UPLOAD',
    "reviewStatus" "OwnedMediaReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "enrichmentMetadata" JSONB,
    "transcriptJobStatus" "TranscriptionJobStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
    "transcriptionLastError" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedMediaTranscript" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "transcriptText" TEXT NOT NULL,
    "source" "TranscriptSource" NOT NULL,
    "language" TEXT,
    "confidence" DOUBLE PRECISION,
    "segmentsJson" JSONB,
    "reviewStatus" "TranscriptReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaTranscript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedMediaQuoteCandidate" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "transcriptId" TEXT,
    "quoteText" TEXT NOT NULL,
    "startSeconds" DOUBLE PRECISION,
    "endSeconds" DOUBLE PRECISION,
    "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "countySlug" TEXT,
    "quoteType" "QuoteCandidateType" NOT NULL DEFAULT 'SUGGESTED',
    "reviewStatus" "QuoteReviewStatus" NOT NULL DEFAULT 'PENDING',
    "featuredWeight" INTEGER,
    "enrichmentMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaQuoteCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnedMediaAsset_storageKey_key" ON "OwnedMediaAsset"("storageKey");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_countySlug_eventDate_idx" ON "OwnedMediaAsset"("countySlug", "eventDate");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_eventDate_idx" ON "OwnedMediaAsset"("eventDate");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_reviewStatus_idx" ON "OwnedMediaAsset"("reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_transcriptJobStatus_idx" ON "OwnedMediaAsset"("transcriptJobStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_isPublic_reviewStatus_idx" ON "OwnedMediaAsset"("isPublic", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaTranscript_ownedMediaId_reviewStatus_idx" ON "OwnedMediaTranscript"("ownedMediaId", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaQuoteCandidate_ownedMediaId_reviewStatus_idx" ON "OwnedMediaQuoteCandidate"("ownedMediaId", "reviewStatus");

-- CreateIndex
CREATE INDEX "OwnedMediaQuoteCandidate_transcriptId_idx" ON "OwnedMediaQuoteCandidate"("transcriptId");

-- CreateIndex
CREATE INDEX "OwnedMediaQuoteCandidate_countySlug_idx" ON "OwnedMediaQuoteCandidate"("countySlug");

-- AddForeignKey
ALTER TABLE "OwnedMediaTranscript" ADD CONSTRAINT "OwnedMediaTranscript_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedMediaQuoteCandidate" ADD CONSTRAINT "OwnedMediaQuoteCandidate_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedMediaQuoteCandidate" ADD CONSTRAINT "OwnedMediaQuoteCandidate_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "OwnedMediaTranscript"("id") ON DELETE SET NULL ON UPDATE CASCADE;
