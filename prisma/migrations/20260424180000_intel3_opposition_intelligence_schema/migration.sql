-- INTEL-3: Opposition intelligence schema (source-backed rows; human review; no voter-level / no AI conclusion fields)

CREATE TYPE "OppositionEntityType" AS ENUM (
  'CANDIDATE',
  'OFFICEHOLDER',
  'PAC',
  'ORGANIZATION',
  'DONOR',
  'INFLUENCER',
  'MEDIA_OUTLET',
  'OTHER'
);

CREATE TYPE "OppositionConfidence" AS ENUM ('VERIFIED', 'LIKELY', 'UNVERIFIED', 'DISPUTED');

CREATE TYPE "OppositionReviewStatus" AS ENUM ('DRAFT', 'NEEDS_REVIEW', 'REVIEWED', 'APPROVED', 'ARCHIVED');

CREATE TYPE "OppositionSourceType" AS ENUM (
  'PUBLIC_FILING',
  'LEGISLATIVE_RECORD',
  'VIDEO',
  'NEWS',
  'WEBSITE',
  'SOCIAL_MEDIA',
  'USER_PROVIDED_DOCUMENT',
  'OTHER'
);

CREATE TABLE "OppositionEntity" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "OppositionEntityType" NOT NULL,
  "description" TEXT,
  "currentOffice" TEXT,
  "party" TEXT,
  "geography" TEXT,
  "tagsJson" JSONB NOT NULL DEFAULT '[]',
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionEntity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionEntity_name_idx" ON "OppositionEntity"("name");
CREATE INDEX "OppositionEntity_type_idx" ON "OppositionEntity"("type");

CREATE TABLE "OppositionSource" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "sourceType" "OppositionSourceType" NOT NULL,
  "sourceUrl" TEXT,
  "sourcePath" TEXT,
  "publisher" TEXT,
  "publishedAt" TIMESTAMP(3),
  "accessedAt" TIMESTAMP(3),
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionSource_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionSource_sourceType_idx" ON "OppositionSource"("sourceType");
CREATE INDEX "OppositionSource_reviewStatus_idx" ON "OppositionSource"("reviewStatus");
CREATE INDEX "OppositionSource_publishedAt_idx" ON "OppositionSource"("publishedAt");

CREATE TABLE "OppositionBillRecord" (
  "id" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceId" TEXT,
  "billNumber" TEXT,
  "title" TEXT,
  "summary" TEXT,
  "role" TEXT,
  "policyArea" TEXT,
  "impactArea" TEXT,
  "session" TEXT,
  "status" TEXT,
  "introducedAt" TIMESTAMP(3),
  "lastActionAt" TIMESTAMP(3),
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionBillRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionBillRecord_entityId_idx" ON "OppositionBillRecord"("entityId");
CREATE INDEX "OppositionBillRecord_sourceId_idx" ON "OppositionBillRecord"("sourceId");

CREATE TABLE "OppositionVoteRecord" (
  "id" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceId" TEXT,
  "billNumber" TEXT,
  "vote" TEXT,
  "voteDate" TIMESTAMP(3),
  "chamber" TEXT,
  "category" TEXT,
  "impactGroup" TEXT,
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionVoteRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionVoteRecord_entityId_idx" ON "OppositionVoteRecord"("entityId");
CREATE INDEX "OppositionVoteRecord_sourceId_idx" ON "OppositionVoteRecord"("sourceId");

CREATE TABLE "OppositionFinanceRecord" (
  "id" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceId" TEXT,
  "donorName" TEXT,
  "donorType" TEXT,
  "amount" DECIMAL(14, 2),
  "date" TIMESTAMP(3),
  "employer" TEXT,
  "industry" TEXT,
  "geography" TEXT,
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionFinanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionFinanceRecord_entityId_idx" ON "OppositionFinanceRecord"("entityId");
CREATE INDEX "OppositionFinanceRecord_sourceId_idx" ON "OppositionFinanceRecord"("sourceId");

CREATE TABLE "OppositionMessageRecord" (
  "id" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceId" TEXT,
  "messageType" TEXT,
  "topic" TEXT,
  "summary" TEXT,
  "tone" TEXT,
  "messageDate" TIMESTAMP(3),
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionMessageRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionMessageRecord_entityId_idx" ON "OppositionMessageRecord"("entityId");
CREATE INDEX "OppositionMessageRecord_sourceId_idx" ON "OppositionMessageRecord"("sourceId");

CREATE TABLE "OppositionVideoRecord" (
  "id" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceId" TEXT,
  "eventType" TEXT,
  "topic" TEXT,
  "billNumber" TEXT,
  "videoDate" TIMESTAMP(3),
  "timestampLabel" TEXT,
  "transcriptStatus" TEXT,
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionVideoRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionVideoRecord_entityId_idx" ON "OppositionVideoRecord"("entityId");
CREATE INDEX "OppositionVideoRecord_sourceId_idx" ON "OppositionVideoRecord"("sourceId");

CREATE TABLE "OppositionNewsMention" (
  "id" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceId" TEXT,
  "outlet" TEXT,
  "headline" TEXT,
  "topic" TEXT,
  "sentiment" TEXT,
  "mentionDate" TIMESTAMP(3),
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionNewsMention_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionNewsMention_entityId_idx" ON "OppositionNewsMention"("entityId");
CREATE INDEX "OppositionNewsMention_sourceId_idx" ON "OppositionNewsMention"("sourceId");

CREATE TABLE "OppositionElectionPattern" (
  "id" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceId" TEXT,
  "electionYear" INTEGER,
  "county" TEXT,
  "voteShare" DOUBLE PRECISION,
  "turnout" DOUBLE PRECISION,
  "comparisonGroup" TEXT,
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionElectionPattern_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionElectionPattern_entityId_idx" ON "OppositionElectionPattern"("entityId");
CREATE INDEX "OppositionElectionPattern_sourceId_idx" ON "OppositionElectionPattern"("sourceId");

CREATE TABLE "OppositionAccountabilityItem" (
  "id" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "sourceId" TEXT,
  "title" TEXT,
  "category" TEXT,
  "description" TEXT,
  "impact" TEXT,
  "billNumber" TEXT,
  "actionDate" TIMESTAMP(3),
  "confidence" "OppositionConfidence" NOT NULL DEFAULT 'UNVERIFIED',
  "reviewStatus" "OppositionReviewStatus" NOT NULL DEFAULT 'NEEDS_REVIEW',
  "notes" TEXT,
  "metadataJson" JSONB NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OppositionAccountabilityItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OppositionAccountabilityItem_entityId_idx" ON "OppositionAccountabilityItem"("entityId");
CREATE INDEX "OppositionAccountabilityItem_sourceId_idx" ON "OppositionAccountabilityItem"("sourceId");

ALTER TABLE "OppositionBillRecord"
  ADD CONSTRAINT "OppositionBillRecord_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OppositionBillRecord"
  ADD CONSTRAINT "OppositionBillRecord_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OppositionVoteRecord"
  ADD CONSTRAINT "OppositionVoteRecord_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OppositionVoteRecord"
  ADD CONSTRAINT "OppositionVoteRecord_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OppositionFinanceRecord"
  ADD CONSTRAINT "OppositionFinanceRecord_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OppositionFinanceRecord"
  ADD CONSTRAINT "OppositionFinanceRecord_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OppositionMessageRecord"
  ADD CONSTRAINT "OppositionMessageRecord_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OppositionMessageRecord"
  ADD CONSTRAINT "OppositionMessageRecord_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OppositionVideoRecord"
  ADD CONSTRAINT "OppositionVideoRecord_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OppositionVideoRecord"
  ADD CONSTRAINT "OppositionVideoRecord_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OppositionNewsMention"
  ADD CONSTRAINT "OppositionNewsMention_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OppositionNewsMention"
  ADD CONSTRAINT "OppositionNewsMention_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OppositionElectionPattern"
  ADD CONSTRAINT "OppositionElectionPattern_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OppositionElectionPattern"
  ADD CONSTRAINT "OppositionElectionPattern_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "OppositionAccountabilityItem"
  ADD CONSTRAINT "OppositionAccountabilityItem_entityId_fkey"
  FOREIGN KEY ("entityId") REFERENCES "OppositionEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OppositionAccountabilityItem"
  ADD CONSTRAINT "OppositionAccountabilityItem_sourceId_fkey"
  FOREIGN KEY ("sourceId") REFERENCES "OppositionSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
