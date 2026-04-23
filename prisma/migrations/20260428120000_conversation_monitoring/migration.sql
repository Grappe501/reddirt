-- Public conversation monitoring (additive). Signals only — not private individual tracking.

CREATE TYPE "ConversationSourceKind" AS ENUM (
  'SOCIAL_PLATFORM', 'NEWS_SITE', 'RSS', 'PRESS_RELEASE', 'MANUAL_ENTRY', 'API_IMPORT'
);
CREATE TYPE "ConversationSignalActorType" AS ENUM (
  'OFFICIAL_ORG', 'PRESS', 'ELECTED_OR_COMMENTARY', 'COMMUNITY_THREAD', 'UNKNOWN'
);
CREATE TYPE "ConversationItemStatus" AS ENUM (
  'NEW', 'ENRICHED', 'CLUSTERED', 'DISMISSED', 'ARCHIVED'
);
CREATE TYPE "ConversationClassification" AS ENUM (
  'ISSUE_ECONOMY', 'ISSUE_HEALTH', 'ISSUE_EDUCATION', 'ISSUE_INFRA', 'ISSUE_VOTING', 'ISSUE_LOCAL',
  'MISINFO_RISK', 'QUESTION', 'SUPPORT', 'CRITIQUE', 'NEUTRAL_REPORT', 'OTHER', 'UNKNOWN'
);
CREATE TYPE "ConversationSentimentLabel" AS ENUM (
  'POSITIVE', 'NEUTRAL', 'MIXED', 'NEGATIVE', 'UNKNOWN'
);
CREATE TYPE "ConversationUrgency" AS ENUM (
  'LOW', 'MEDIUM', 'HIGH', 'BREAKING'
);
CREATE TYPE "ConversationSuggestedTone" AS ENUM (
  'CALM', 'FACTUAL', 'EMPATHETIC', 'FIRM', 'CELEBRATORY', 'DEFERRING', 'OTHER'
);
CREATE TYPE "ConversationWatchlistStatus" AS ENUM (
  'ACTIVE', 'PAUSED', 'ARCHIVED'
);
CREATE TYPE "ConversationClusterStatus" AS ENUM (
  'ACTIVE', 'MERGED', 'ARCHIVED'
);
CREATE TYPE "ConversationOpportunityStatus" AS ENUM (
  'OPEN', 'ROUTED', 'CONVERTED', 'DISMISSED'
);

CREATE TABLE "ConversationWatchlist" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "ConversationWatchlistStatus" NOT NULL DEFAULT 'ACTIVE',
  "filterSpec" JSONB NOT NULL DEFAULT '{}',
  "countyId" TEXT,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationWatchlist_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ConversationItem" (
  "id" TEXT NOT NULL,
  "sourceKind" "ConversationSourceKind" NOT NULL,
  "externalKey" TEXT,
  "publicPermalink" TEXT,
  "channel" TEXT NOT NULL,
  "title" TEXT,
  "bodyText" TEXT NOT NULL,
  "signalActorType" "ConversationSignalActorType" NOT NULL DEFAULT 'UNKNOWN',
  "publishedAt" TIMESTAMP(3),
  "countyId" TEXT,
  "watchlistId" TEXT,
  "status" "ConversationItemStatus" NOT NULL DEFAULT 'NEW',
  "rawMetadata" JSONB DEFAULT '{}',
  "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ConversationAnalysis" (
  "id" TEXT NOT NULL,
  "conversationItemId" TEXT NOT NULL,
  "summary" TEXT,
  "classification" "ConversationClassification" NOT NULL DEFAULT 'UNKNOWN',
  "sentiment" "ConversationSentimentLabel" NOT NULL DEFAULT 'UNKNOWN',
  "urgency" "ConversationUrgency" NOT NULL DEFAULT 'MEDIUM',
  "suggestedTone" "ConversationSuggestedTone" NOT NULL DEFAULT 'FACTUAL',
  "issueTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "countyInferenceNote" TEXT,
  "suggestedAction" TEXT,
  "confidenceJson" JSONB DEFAULT '{}',
  "analyzerVersion" TEXT,
  "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationAnalysis_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ConversationCluster" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "status" "ConversationClusterStatus" NOT NULL DEFAULT 'ACTIVE',
  "clusterKey" TEXT,
  "countyId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationCluster_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ConversationClusterItem" (
  "id" TEXT NOT NULL,
  "clusterId" TEXT NOT NULL,
  "conversationItemId" TEXT NOT NULL,
  "similarity" DOUBLE PRECISION,
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConversationClusterItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ConversationOpportunity" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT,
  "status" "ConversationOpportunityStatus" NOT NULL DEFAULT 'OPEN',
  "urgency" "ConversationUrgency" NOT NULL DEFAULT 'MEDIUM',
  "suggestedTone" "ConversationSuggestedTone" NOT NULL DEFAULT 'FACTUAL',
  "actionTemplate" TEXT,
  "countyId" TEXT,
  "primaryConversationItemId" TEXT,
  "clusterId" TEXT,
  "workflowIntakeId" TEXT,
  "socialContentItemId" TEXT,
  "createdByUserId" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "convertedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConversationOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConversationItem_sourceKind_externalKey_key" ON "ConversationItem"("sourceKind", "externalKey");
CREATE UNIQUE INDEX "ConversationAnalysis_conversationItemId_key" ON "ConversationAnalysis"("conversationItemId");
CREATE UNIQUE INDEX "ConversationClusterItem_clusterId_conversationItemId_key" ON "ConversationClusterItem"("clusterId", "conversationItemId");
CREATE UNIQUE INDEX "ConversationOpportunity_primaryConversationItemId_key" ON "ConversationOpportunity"("primaryConversationItemId");

CREATE INDEX "ConversationWatchlist_countyId_status_idx" ON "ConversationWatchlist"("countyId", "status");
CREATE INDEX "ConversationWatchlist_status_updatedAt_idx" ON "ConversationWatchlist"("status", "updatedAt");
CREATE INDEX "ConversationItem_sourceKind_publishedAt_idx" ON "ConversationItem"("sourceKind", "publishedAt");
CREATE INDEX "ConversationItem_countyId_status_idx" ON "ConversationItem"("countyId", "status");
CREATE INDEX "ConversationItem_status_createdAt_idx" ON "ConversationItem"("status", "createdAt");
CREATE INDEX "ConversationItem_watchlistId_createdAt_idx" ON "ConversationItem"("watchlistId", "createdAt");
CREATE INDEX "ConversationAnalysis_classification_urgency_idx" ON "ConversationAnalysis"("classification", "urgency");
CREATE INDEX "ConversationAnalysis_analyzedAt_idx" ON "ConversationAnalysis"("analyzedAt");
CREATE INDEX "ConversationCluster_countyId_status_idx" ON "ConversationCluster"("countyId", "status");
CREATE INDEX "ConversationCluster_status_updatedAt_idx" ON "ConversationCluster"("status", "updatedAt");
CREATE INDEX "ConversationClusterItem_conversationItemId_idx" ON "ConversationClusterItem"("conversationItemId");
CREATE INDEX "ConversationOpportunity_status_urgency_idx" ON "ConversationOpportunity"("status", "urgency");
CREATE INDEX "ConversationOpportunity_countyId_status_idx" ON "ConversationOpportunity"("countyId", "status");
CREATE INDEX "ConversationOpportunity_workflowIntakeId_idx" ON "ConversationOpportunity"("workflowIntakeId");
CREATE INDEX "ConversationOpportunity_socialContentItemId_idx" ON "ConversationOpportunity"("socialContentItemId");
CREATE INDEX "ConversationOpportunity_clusterId_idx" ON "ConversationOpportunity"("clusterId");

ALTER TABLE "ConversationWatchlist" ADD CONSTRAINT "ConversationWatchlist_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationWatchlist" ADD CONSTRAINT "ConversationWatchlist_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationItem" ADD CONSTRAINT "ConversationItem_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationItem" ADD CONSTRAINT "ConversationItem_watchlistId_fkey" FOREIGN KEY ("watchlistId") REFERENCES "ConversationWatchlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationAnalysis" ADD CONSTRAINT "ConversationAnalysis_conversationItemId_fkey" FOREIGN KEY ("conversationItemId") REFERENCES "ConversationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationCluster" ADD CONSTRAINT "ConversationCluster_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationClusterItem" ADD CONSTRAINT "ConversationClusterItem_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "ConversationCluster"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationClusterItem" ADD CONSTRAINT "ConversationClusterItem_conversationItemId_fkey" FOREIGN KEY ("conversationItemId") REFERENCES "ConversationItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_primaryConversationItemId_fkey" FOREIGN KEY ("primaryConversationItemId") REFERENCES "ConversationItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "ConversationCluster"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "WorkflowIntake"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_socialContentItemId_fkey" FOREIGN KEY ("socialContentItemId") REFERENCES "SocialContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ConversationOpportunity" ADD CONSTRAINT "ConversationOpportunity_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
