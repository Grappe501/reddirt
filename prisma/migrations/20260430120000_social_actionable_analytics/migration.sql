-- Actionable social analytics: message tone, structured strategic recommendations, learning indexes.

-- CreateEnum
CREATE TYPE "SocialMessageToneMode" AS ENUM (
  'CALM_CLARIFICATION',
  'COMMUNITY_STORYTELLING',
  'FAITH_CENTERED',
  'ISSUE_EDUCATION',
  'BOLD_CONTRAST',
  'INVITATIONAL_CTA'
);

-- CreateEnum
CREATE TYPE "SocialStrategicFollowupType" AS ENUM (
  'NONE',
  'GENERAL_ENGAGEMENT',
  'COUNTY_STORY',
  'VOLUNTEER_PATHWAY',
  'CLARIFICATION'
);

-- AlterTable
ALTER TABLE "SocialContentItem" ADD COLUMN "messageToneMode" "SocialMessageToneMode";

CREATE INDEX "SocialContentItem_messageToneMode_kind_updatedAt_idx" ON "SocialContentItem"("messageToneMode", "kind", "updatedAt");

-- AlterTable
ALTER TABLE "SocialContentStrategicInsight" ADD COLUMN "recommendedNextTone" "SocialMessageToneMode";
ALTER TABLE "SocialContentStrategicInsight" ADD COLUMN "recommendedBestWindow" TEXT;
ALTER TABLE "SocialContentStrategicInsight" ADD COLUMN "recommendedFollowupType" "SocialStrategicFollowupType" NOT NULL DEFAULT 'NONE';
ALTER TABLE "SocialContentStrategicInsight" ADD COLUMN "recommendedCountyFocus" TEXT;
ALTER TABLE "SocialContentStrategicInsight" ADD COLUMN "recommendedCtaType" TEXT;
ALTER TABLE "SocialContentStrategicInsight" ADD COLUMN "confidenceScore" DOUBLE PRECISION;
