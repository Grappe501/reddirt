-- P0-S5 Event Project Manager authentication/RBAC foundation.
-- Reuse the canonical CampaignTenant/CampaignMembership spine created in 20260521140000.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseUserId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseUserId_key" ON "User"("supabaseUserId");

ALTER TYPE "CampaignTenantRole" ADD VALUE IF NOT EXISTS 'EVENT_MANAGER';
ALTER TYPE "CampaignTenantRole" ADD VALUE IF NOT EXISTS 'COMMUNICATIONS';
ALTER TYPE "CampaignTenantRole" ADD VALUE IF NOT EXISTS 'ORGANIZER';
ALTER TYPE "CampaignTenantRole" ADD VALUE IF NOT EXISTS 'VOLUNTEER_COORDINATOR';

DO $$ BEGIN
  CREATE TYPE "CampaignMembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "CampaignMembership"
  ADD COLUMN IF NOT EXISTS "status" "CampaignMembershipStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "invitedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "acceptedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "CampaignMembership_tenantId_status_idx"
  ON "CampaignMembership"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "CampaignMembership_tenantId_role_idx"
  ON "CampaignMembership"("tenantId", "role");

CREATE TABLE IF NOT EXISTS "EventPmAuditLog" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventPmAuditLog_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "CampaignTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "EventPmAuditLog_actorUserId_fkey"
    FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "EventPmAuditLog_tenantId_createdAt_idx"
  ON "EventPmAuditLog"("tenantId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "EventPmAuditLog_actorUserId_createdAt_idx"
  ON "EventPmAuditLog"("actorUserId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "EventPmAuditLog_entityType_entityId_idx"
  ON "EventPmAuditLog"("entityType", "entityId");
