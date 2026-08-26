-- P0-S5 Event Project Manager authentication/RBAC foundation.
-- Supabase remains the identity provider. These records bind verified Supabase UUIDs
-- to the existing canonical RedDirt User spine and establish campaign authorization.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseUserId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseUserId_key" ON "User"("supabaseUserId");

DO $$ BEGIN
  CREATE TYPE "CampaignAccessRole" AS ENUM (
    'OWNER', 'ADMIN', 'CAMPAIGN_MANAGER', 'EVENT_MANAGER', 'COMMUNICATIONS',
    'ORGANIZER', 'VOLUNTEER_COORDINATOR', 'VOLUNTEER', 'VIEWER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CampaignMembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "CampaignMembership" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "campaignKey" TEXT NOT NULL DEFAULT 'kelly-grappe-sos',
  "role" "CampaignAccessRole" NOT NULL,
  "status" "CampaignMembershipStatus" NOT NULL DEFAULT 'INVITED',
  "invitedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CampaignMembership_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CampaignMembership_userId_campaignKey_key" UNIQUE ("userId", "campaignKey")
);

CREATE INDEX IF NOT EXISTS "CampaignMembership_campaignKey_status_idx"
  ON "CampaignMembership"("campaignKey", "status");
CREATE INDEX IF NOT EXISTS "CampaignMembership_campaignKey_role_idx"
  ON "CampaignMembership"("campaignKey", "role");
CREATE INDEX IF NOT EXISTS "CampaignMembership_userId_idx"
  ON "CampaignMembership"("userId");

CREATE TABLE IF NOT EXISTS "EventPmAuditLog" (
  "id" TEXT PRIMARY KEY,
  "campaignKey" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventPmAuditLog_actorUserId_fkey"
    FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "EventPmAuditLog_campaignKey_createdAt_idx"
  ON "EventPmAuditLog"("campaignKey", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "EventPmAuditLog_actorUserId_createdAt_idx"
  ON "EventPmAuditLog"("actorUserId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "EventPmAuditLog_entityType_entityId_idx"
  ON "EventPmAuditLog"("entityType", "entityId");
