-- AlterTable
ALTER TABLE "OwnedMediaAsset" ADD COLUMN IF NOT EXISTS "focalX" DOUBLE PRECISION;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN IF NOT EXISTS "focalY" DOUBLE PRECISION;

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "PublicMediaPlacementKind" AS ENUM ('IMAGE', 'VIDEO', 'GALLERY', 'BACKGROUND', 'PORTRAIT', 'POSTER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PublicMediaPlacement" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "slotKey" TEXT NOT NULL,
    "ownedMediaAssetId" TEXT NOT NULL,
    "placementKind" "PublicMediaPlacementKind" NOT NULL DEFAULT 'IMAGE',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "focalXOverride" DOUBLE PRECISION,
    "focalYOverride" DOUBLE PRECISION,
    "headlineOverride" TEXT,
    "captionOverride" TEXT,
    "altTextOverride" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicMediaPlacement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PublicMediaPlacement_pageKey_slotKey_key" ON "PublicMediaPlacement"("pageKey", "slotKey");
CREATE INDEX IF NOT EXISTS "PublicMediaPlacement_ownedMediaAssetId_idx" ON "PublicMediaPlacement"("ownedMediaAssetId");
CREATE INDEX IF NOT EXISTS "PublicMediaPlacement_enabled_pageKey_idx" ON "PublicMediaPlacement"("enabled", "pageKey");
CREATE INDEX IF NOT EXISTS "PublicMediaPlacement_createdByUserId_idx" ON "PublicMediaPlacement"("createdByUserId");

DO $$ BEGIN
  ALTER TABLE "PublicMediaPlacement" ADD CONSTRAINT "PublicMediaPlacement_ownedMediaAssetId_fkey" FOREIGN KEY ("ownedMediaAssetId") REFERENCES "OwnedMediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "PublicMediaPlacement" ADD CONSTRAINT "PublicMediaPlacement_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
