-- AlterEnum: add source for crowd-sourced community event suggestions
ALTER TYPE "FestivalSourceChannel" ADD VALUE 'PUBLIC_FORM';

-- Optional submitter + link from public /events form
ALTER TABLE "ArkansasFestivalIngest" ADD COLUMN IF NOT EXISTS "submitterInfoUrl" TEXT;
ALTER TABLE "ArkansasFestivalIngest" ADD COLUMN IF NOT EXISTS "submitterName" TEXT;
ALTER TABLE "ArkansasFestivalIngest" ADD COLUMN IF NOT EXISTS "submitterEmail" TEXT;
