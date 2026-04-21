-- CreateEnum
CREATE TYPE "OwnedMediaNoteType" AS ENUM ('DESCRIPTION', 'PEOPLE', 'LOCATION', 'EVENT_CONTEXT', 'MESSAGE_ANGLE', 'CAPTION', 'TRANSCRIPT_CORRECTION', 'INTERNAL_NOTE');

-- AlterTable
ALTER TABLE "OwnedMediaAsset" ADD COLUMN     "captionDraft" TEXT,
ADD COLUMN     "linkedCampaignEventId" TEXT,
ADD COLUMN     "operatorNotes" TEXT,
ADD COLUMN     "shootDateOverride" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OwnedMediaAnnotation" (
    "id" TEXT NOT NULL,
    "ownedMediaId" TEXT NOT NULL,
    "authorUserId" TEXT,
    "noteType" "OwnedMediaNoteType" NOT NULL,
    "noteText" TEXT NOT NULL,
    "tagsJson" JSONB,
    "isSearchable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedMediaAnnotation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OwnedMediaAnnotation_ownedMediaId_createdAt_idx" ON "OwnedMediaAnnotation"("ownedMediaId", "createdAt");

-- CreateIndex
CREATE INDEX "OwnedMediaAnnotation_ownedMediaId_noteType_idx" ON "OwnedMediaAnnotation"("ownedMediaId", "noteType");

-- CreateIndex
CREATE INDEX "OwnedMediaAnnotation_isSearchable_idx" ON "OwnedMediaAnnotation"("isSearchable");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_linkedCampaignEventId_idx" ON "OwnedMediaAsset"("linkedCampaignEventId");

-- CreateIndex
CREATE INDEX "OwnedMediaAsset_mediaIngestBatchId_reviewStatus_idx" ON "OwnedMediaAsset"("mediaIngestBatchId", "reviewStatus");

-- AddForeignKey
ALTER TABLE "OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_linkedCampaignEventId_fkey" FOREIGN KEY ("linkedCampaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedMediaAnnotation" ADD CONSTRAINT "OwnedMediaAnnotation_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedMediaAnnotation" ADD CONSTRAINT "OwnedMediaAnnotation_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
