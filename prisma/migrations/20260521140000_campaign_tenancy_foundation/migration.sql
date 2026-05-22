-- Sprint 10: multi-campaign tenancy foundation (isolated campaign config)

CREATE TYPE "CampaignArchetype" AS ENUM (
  'CANDIDATE_CAMPAIGN',
  'PAC',
  'COUNTY_PARTY',
  'ADVOCACY_ORG',
  'BALLOT_ISSUE'
);

CREATE TYPE "CampaignTenantRole" AS ENUM (
  'OWNER',
  'ADMIN',
  'CAMPAIGN_MANAGER',
  'TREASURER',
  'OPERATOR',
  'VOLUNTEER',
  'VIEWER'
);

CREATE TABLE "CampaignTenant" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "archetype" "CampaignArchetype" NOT NULL,
  "electionType" TEXT,
  "geography" TEXT,
  "timelineStart" TIMESTAMP(3),
  "timelineEnd" TIMESTAMP(3),
  "staffSizeBand" TEXT,
  "budgetLevel" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CampaignTenant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CampaignTenant_slug_key" ON "CampaignTenant"("slug");
CREATE INDEX "CampaignTenant_isActive_updatedAt_idx" ON "CampaignTenant"("isActive", "updatedAt");

CREATE TABLE "CampaignMembership" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" "CampaignTenantRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CampaignMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CampaignMembership_tenantId_userId_key" ON "CampaignMembership"("tenantId", "userId");
CREATE INDEX "CampaignMembership_userId_idx" ON "CampaignMembership"("userId");

ALTER TABLE "CampaignMembership" ADD CONSTRAINT "CampaignMembership_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "CampaignTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CampaignSettings" (
  "tenantId" TEXT NOT NULL,
  "prioritiesJson" JSONB NOT NULL DEFAULT '[]',
  "fieldGoalsJson" JSONB NOT NULL DEFAULT '[]',
  "communicationGoalsJson" JSONB NOT NULL DEFAULT '[]',
  "complianceNeedsJson" JSONB NOT NULL DEFAULT '[]',
  "defaultReviewMonth" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CampaignSettings_pkey" PRIMARY KEY ("tenantId")
);

ALTER TABLE "CampaignSettings" ADD CONSTRAINT "CampaignSettings_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "CampaignTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CampaignBranding" (
  "tenantId" TEXT NOT NULL,
  "logoUrl" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#1a365d',
  "accentColor" TEXT NOT NULL DEFAULT '#c9a227',
  "domainScaffold" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CampaignBranding_pkey" PRIMARY KEY ("tenantId")
);

ALTER TABLE "CampaignBranding" ADD CONSTRAINT "CampaignBranding_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "CampaignTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CampaignFeatureFlags" (
  "tenantId" TEXT NOT NULL,
  "reimbursementPortal" BOOLEAN NOT NULL DEFAULT true,
  "eventIntakePortal" BOOLEAN NOT NULL DEFAULT true,
  "volunteerPortal" BOOLEAN NOT NULL DEFAULT true,
  "coalitionPortal" BOOLEAN NOT NULL DEFAULT false,
  "hotWashIntelligence" BOOLEAN NOT NULL DEFAULT true,
  "financeIntelligenceV2" BOOLEAN NOT NULL DEFAULT true,
  "strategicIntelligence" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CampaignFeatureFlags_pkey" PRIMARY KEY ("tenantId")
);

ALTER TABLE "CampaignFeatureFlags" ADD CONSTRAINT "CampaignFeatureFlags_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "CampaignTenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
