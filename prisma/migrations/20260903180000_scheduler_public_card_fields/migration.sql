-- Scheduler Dashboard public-card fields on CampaignEvent (additive).
-- Strings are validated in app code so Netlify generate stays aligned with this schema.

ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "publicFieldAttendance" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "publicKellyRole" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "publicTabling" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "publicVolunteers" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "publicMobilize" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "publicMobilizeHref" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "publicVolunteerHref" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "schedulerNeedsMoreInfo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "schedulerPublishedBy" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "schedulerPublishedAt" TIMESTAMP(3);
