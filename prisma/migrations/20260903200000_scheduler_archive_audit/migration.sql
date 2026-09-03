-- Scheduler archive audit: events leave the public calendar without a hard delete.
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "schedulerArchivedAt" TIMESTAMP(3);
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "schedulerArchivedBy" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "schedulerArchiveReason" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "schedulerArchivePlace" TEXT;
