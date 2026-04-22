-- External press monitoring (earned media / Kelly Grappe campaign)

CREATE TYPE "ExternalMediaSourceType" AS ENUM ('NEWSPAPER', 'NEWS_MAGAZINE', 'DIGITAL_LOCAL', 'TV', 'RADIO', 'BLOG', 'OTHER');

CREATE TYPE "ExternalMediaMentionType" AS ENUM ('NEWS_ARTICLE', 'EDITORIAL', 'OPINION', 'LETTER_TO_EDITOR', 'TV_WEB_STORY', 'CANDIDATE_LISTING', 'EVENT_RECAP', 'ENDORSEMENT', 'OTHER');

CREATE TYPE "ExternalMediaReviewStatus" AS ENUM ('PENDING', 'NEEDS_REVIEW', 'APPROVED', 'REJECTED');

CREATE TYPE "ExternalMediaIngestMethod" AS ENUM ('RSS', 'SITEMAP', 'SEARCH_PAGE', 'MANUAL_SEED', 'HOMEPAGE_SECTION', 'TAG_PAGE', 'CATEGORY_PAGE');

CREATE TYPE "ExternalMediaMatchTier" AS ENUM ('DEFINITE', 'LIKELY', 'UNCERTAIN', 'NOT_RELEVANT');

CREATE TABLE "ExternalMediaSource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceType" "ExternalMediaSourceType" NOT NULL,
    "region" TEXT NOT NULL,
    "coveredCities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "homepage" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "rssUrl" TEXT,
    "sitemapUrl" TEXT,
    "searchUrlTemplate" TEXT,
    "discoveryMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalMediaSource_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExternalMediaSource_slug_key" ON "ExternalMediaSource"("slug");

CREATE INDEX "ExternalMediaSource_isActive_priority_idx" ON "ExternalMediaSource"("isActive", "priority");

CREATE TABLE "ExternalMediaMention" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceType" "ExternalMediaSourceType" NOT NULL,
    "sourceRegion" TEXT,
    "cityCoverage" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "author" TEXT,
    "section" TEXT,
    "summary" TEXT,
    "fullText" TEXT,
    "transcriptText" TEXT,
    "transcriptMissing" BOOLEAN NOT NULL DEFAULT false,
    "mentionType" "ExternalMediaMentionType" NOT NULL DEFAULT 'NEWS_ARTICLE',
    "confidenceScore" DOUBLE PRECISION,
    "matchTier" "ExternalMediaMatchTier" NOT NULL,
    "matchedEntityName" TEXT NOT NULL DEFAULT 'Kelly Grappe',
    "matchedPersonName" TEXT,
    "isOpinion" BOOLEAN NOT NULL DEFAULT false,
    "isEditorial" BOOLEAN NOT NULL DEFAULT false,
    "sentimentHint" TEXT,
    "ingestionMethod" "ExternalMediaIngestMethod" NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL,
    "reviewStatus" "ExternalMediaReviewStatus" NOT NULL DEFAULT 'PENDING',
    "campaignSummary" TEXT,
    "markForSocialShare" BOOLEAN NOT NULL DEFAULT false,
    "markForEmailRoundup" BOOLEAN NOT NULL DEFAULT false,
    "markForSurrogateAmplification" BOOLEAN NOT NULL DEFAULT false,
    "responseNeeded" BOOLEAN NOT NULL DEFAULT false,
    "needsAmplification" BOOLEAN NOT NULL DEFAULT false,
    "showOnPublicSite" BOOLEAN NOT NULL DEFAULT false,
    "relatedEventId" TEXT,
    "relatedCountyId" TEXT,
    "openAiRefined" BOOLEAN NOT NULL DEFAULT false,
    "rawPayload" JSONB,

    CONSTRAINT "ExternalMediaMention_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExternalMediaMention_dedupeKey_key" ON "ExternalMediaMention"("dedupeKey");

CREATE INDEX "ExternalMediaMention_sourceId_publishedAt_idx" ON "ExternalMediaMention"("sourceId", "publishedAt");

CREATE INDEX "ExternalMediaMention_reviewStatus_publishedAt_idx" ON "ExternalMediaMention"("reviewStatus", "publishedAt");

CREATE INDEX "ExternalMediaMention_matchTier_publishedAt_idx" ON "ExternalMediaMention"("matchTier", "publishedAt");

CREATE INDEX "ExternalMediaMention_showOnPublicSite_publishedAt_idx" ON "ExternalMediaMention"("showOnPublicSite", "publishedAt");

CREATE INDEX "ExternalMediaMention_relatedCountyId_idx" ON "ExternalMediaMention"("relatedCountyId");

CREATE INDEX "ExternalMediaMention_relatedEventId_idx" ON "ExternalMediaMention"("relatedEventId");

ALTER TABLE "ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExternalMediaSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_relatedEventId_fkey" FOREIGN KEY ("relatedEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ExternalMediaMention" ADD CONSTRAINT "ExternalMediaMention_relatedCountyId_fkey" FOREIGN KEY ("relatedCountyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ExternalMediaIngestRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "label" TEXT,
    "dryRun" BOOLEAN NOT NULL DEFAULT false,
    "sourceSlug" TEXT,
    "incrementalSince" TIMESTAMP(3),
    "summaryJson" JSONB,
    "itemsDiscovered" INTEGER NOT NULL DEFAULT 0,
    "itemsInserted" INTEGER NOT NULL DEFAULT 0,
    "itemsUpdated" INTEGER NOT NULL DEFAULT 0,
    "errorsJson" JSONB,
    "error" TEXT,

    CONSTRAINT "ExternalMediaIngestRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ExternalMediaIngestRun_startedAt_idx" ON "ExternalMediaIngestRun"("startedAt");
