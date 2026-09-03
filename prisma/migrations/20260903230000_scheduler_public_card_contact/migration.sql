-- Public card city + contact for Scheduler publish-to-/events.
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "publicContact" TEXT;
