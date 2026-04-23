-- Additive Media Center fields: canonical filename, review attribution, triage notes.
ALTER TABLE "OwnedMediaAsset" ADD COLUMN IF NOT EXISTS "canonicalFileName" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3);
ALTER TABLE "OwnedMediaAsset" ADD COLUMN IF NOT EXISTS "reviewedByUserId" TEXT;
ALTER TABLE "OwnedMediaAsset" ADD COLUMN IF NOT EXISTS "reviewNotes" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OwnedMediaAsset_reviewedByUserId_fkey'
  ) THEN
    ALTER TABLE "OwnedMediaAsset"
      ADD CONSTRAINT "OwnedMediaAsset_reviewedByUserId_fkey"
      FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "OwnedMediaAsset_reviewedAt_idx" ON "OwnedMediaAsset"("reviewedAt");
CREATE INDEX IF NOT EXISTS "OwnedMediaAsset_reviewedByUserId_idx" ON "OwnedMediaAsset"("reviewedByUserId");
