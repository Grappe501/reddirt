-- Canonical public/CampaignOS event lifecycle fields (additive).
-- Tentative + travel legs stay off the public site; attendance/purposes are structured.

CREATE TYPE "CampaignEventAttendanceType" AS ENUM (
  'PUBLIC_OPEN',
  'PUBLIC_REGISTRATION',
  'INVITATION',
  'CAMPAIGN_APPEARANCE',
  'PRIVATE'
);

CREATE TYPE "CampaignEventPurpose" AS ENUM (
  'LISTEN',
  'RELATIONSHIP',
  'VISIBILITY',
  'VOLUNTEER',
  'FUNDRAISING',
  'MEDIA',
  'GOTV',
  'VOTER_REGISTRATION'
);

ALTER TYPE "CampaignEventStatus" ADD VALUE IF NOT EXISTS 'TENTATIVE';

ALTER TYPE "CampaignEventType" ADD VALUE IF NOT EXISTS 'COMMUNITY';
ALTER TYPE "CampaignEventType" ADD VALUE IF NOT EXISTS 'COUNTY_PARTY';
ALTER TYPE "CampaignEventType" ADD VALUE IF NOT EXISTS 'FORUM';
ALTER TYPE "CampaignEventType" ADD VALUE IF NOT EXISTS 'YOUTH';
ALTER TYPE "CampaignEventType" ADD VALUE IF NOT EXISTS 'CIVIC';
ALTER TYPE "CampaignEventType" ADD VALUE IF NOT EXISTS 'SPEAKING';
ALTER TYPE "CampaignEventType" ADD VALUE IF NOT EXISTS 'LISTENING';

ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "isTravelLeg" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "attendanceType" "CampaignEventAttendanceType" NOT NULL DEFAULT 'CAMPAIGN_APPEARANCE';
ALTER TABLE "CampaignEvent" ADD COLUMN IF NOT EXISTS "campaignPurposes" "CampaignEventPurpose"[] DEFAULT ARRAY[]::"CampaignEventPurpose"[];

CREATE INDEX IF NOT EXISTS "CampaignEvent_isTravelLeg_isPublicOnWebsite_idx"
  ON "CampaignEvent" ("isTravelLeg", "isPublicOnWebsite");
