-- Social Workbench: OwnedMedia extensions + SocialContentMediaRef join table.
-- Indexing from disk uses OwnedMediaSourceType.LOCAL_INDEXED; API exposes ids + /api/... routes only.

CREATE TYPE "SocialContentMediaRefPurpose" AS ENUM ('SOCIAL_PLAN', 'VIDEO_REPURPOSE', 'VISUAL', 'PLATFORM_VARIANT');

ALTER TYPE "OwnedMediaSourceType" ADD VALUE 'LOCAL_INDEXED';

ALTER TABLE "OwnedMediaAsset" ADD COLUMN "countyId" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "indexSourceLabel" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN "approvedForSocial" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "OwnedMediaAsset" ADD CONSTRAINT "OwnedMediaAsset_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "OwnedMediaAsset_countyId_capturedAt_idx" ON "OwnedMediaAsset"("countyId", "capturedAt");
CREATE INDEX "OwnedMediaAsset_approvedForSocial_kind_idx" ON "OwnedMediaAsset"("approvedForSocial", "kind");

CREATE TABLE "SocialContentMediaRef" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownedMediaId" TEXT NOT NULL,
    "socialContentItemId" TEXT NOT NULL,
    "socialPlatformVariantId" TEXT,
    "purpose" "SocialContentMediaRefPurpose" NOT NULL,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    CONSTRAINT "SocialContentMediaRef_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialContentMediaRef_socialContentItemId_purpose_sortOrder_idx" ON "SocialContentMediaRef"("socialContentItemId", "purpose", "sortOrder");
CREATE INDEX "SocialContentMediaRef_ownedMediaId_idx" ON "SocialContentMediaRef"("ownedMediaId");
CREATE INDEX "SocialContentMediaRef_socialPlatformVariantId_idx" ON "SocialContentMediaRef"("socialPlatformVariantId");
CREATE INDEX "SocialContentMediaRef_createdAt_idx" ON "SocialContentMediaRef"("createdAt");

ALTER TABLE "SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_ownedMediaId_fkey" FOREIGN KEY ("ownedMediaId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_socialPlatformVariantId_fkey" FOREIGN KEY ("socialPlatformVariantId") REFERENCES "SocialPlatformVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SocialContentMediaRef" ADD CONSTRAINT "SocialContentMediaRef_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
