-- Extend follow-up enum (campaign-safe lanes) + message tactic for learning.

-- New enum: framing distinct from tone
CREATE TYPE "SocialMessageTacticMode" AS ENUM (
  'NARRATIVE',
  'ISSUE_BRIEF',
  'VALUES_STORY',
  'INVITE_ACTION',
  'RUMOR_CLARIFY',
  'OTHER'
);

ALTER TABLE "SocialContentItem" ADD COLUMN "messageTacticMode" "SocialMessageTacticMode";

CREATE INDEX "SocialContentItem_messageTacticMode_kind_updatedAt_idx" ON "SocialContentItem"("messageTacticMode", "kind", "updatedAt");

-- Append to existing enum (order of ADD VALUE is canonical in PG)
ALTER TYPE "SocialStrategicFollowupType" ADD VALUE 'RAPID_RESPONSE';
ALTER TYPE "SocialStrategicFollowupType" ADD VALUE 'CLARIFICATION_POST';
ALTER TYPE "SocialStrategicFollowupType" ADD VALUE 'COUNTY_VARIANT';
ALTER TYPE "SocialStrategicFollowupType" ADD VALUE 'VOLUNTEER_CTA';
ALTER TYPE "SocialStrategicFollowupType" ADD VALUE 'EVENT_PROMO';
ALTER TYPE "SocialStrategicFollowupType" ADD VALUE 'POST_EVENT_RECAP';
ALTER TYPE "SocialStrategicFollowupType" ADD VALUE 'NO_ACTION';
