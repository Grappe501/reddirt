-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('IMAGE', 'VIDEO_EMBED');

-- CreateEnum
CREATE TYPE "ContentCollection" AS ENUM ('STORY', 'EDITORIAL', 'EXPLAINER');

-- CreateEnum
CREATE TYPE "BlogDisplayMode" AS ENUM ('SUMMARY_LINK', 'EXCERPT_LINK', 'INTERNAL_MIRROR_TODO');

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL DEFAULT 'IMAGE',
    "alt" TEXT,
    "caption" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "usageNotes" TEXT,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncedPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'substack',
    "feedGuid" TEXT,
    "slug" TEXT NOT NULL,
    "canonicalUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "featuredImageUrl" TEXT,
    "tagsFromFeed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "localCategories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "localTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "teaserOverride" TEXT,
    "heroMediaId" TEXT,
    "displayMode" "BlogDisplayMode" NOT NULL DEFAULT 'SUMMARY_LINK',
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
    "showOnBlogLanding" BOOLEAN NOT NULL DEFAULT true,
    "rawItem" JSONB,

    CONSTRAINT "SyncedPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminContentBlock" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pageKey" TEXT NOT NULL,
    "blockKey" TEXT NOT NULL,
    "blockType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "label" TEXT,

    CONSTRAINT "AdminContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "hero" JSONB,
    "sectionOrder" JSONB,
    "heardItems" JSONB,
    "movementBeliefs" JSONB,
    "pathwayCards" JSONB,
    "splitDemocracy" JSONB,
    "splitLabor" JSONB,
    "arkansasBand" JSONB,
    "quoteBand" JSONB,
    "finalCta" JSONB,
    "featuredStorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredSyncedPostSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "featuredExplainerSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItemOverride" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "collection" "ContentCollection" NOT NULL,
    "slug" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "teaserOverride" TEXT,
    "summaryOverride" TEXT,
    "heroMediaId" TEXT,

    CONSTRAINT "ContentItemOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "substackFeedUrl" TEXT,
    "canonicalSiteUrlNote" TEXT,
    "adminNotes" TEXT,
    "lastSubstackSyncAt" TIMESTAMP(3),
    "lastSubstackSyncOk" BOOLEAN,
    "lastSubstackSyncError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SyncedPost_feedGuid_key" ON "SyncedPost"("feedGuid");

-- CreateIndex
CREATE UNIQUE INDEX "SyncedPost_slug_key" ON "SyncedPost"("slug");

-- CreateIndex
CREATE INDEX "SyncedPost_publishedAt_idx" ON "SyncedPost"("publishedAt");

-- CreateIndex
CREATE INDEX "SyncedPost_hidden_featured_idx" ON "SyncedPost"("hidden", "featured");

-- CreateIndex
CREATE INDEX "AdminContentBlock_pageKey_idx" ON "AdminContentBlock"("pageKey");

-- CreateIndex
CREATE UNIQUE INDEX "AdminContentBlock_pageKey_blockKey_key" ON "AdminContentBlock"("pageKey", "blockKey");

-- CreateIndex
CREATE UNIQUE INDEX "ContentItemOverride_collection_slug_key" ON "ContentItemOverride"("collection", "slug");

-- AddForeignKey
ALTER TABLE "SyncedPost" ADD CONSTRAINT "SyncedPost_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItemOverride" ADD CONSTRAINT "ContentItemOverride_heroMediaId_fkey" FOREIGN KEY ("heroMediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
