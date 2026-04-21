-- CreateEnum
CREATE TYPE "CountyContentReviewStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED');

-- CreateEnum
CREATE TYPE "ElectedJurisdiction" AS ENUM ('FEDERAL', 'STATE', 'COUNTY', 'LOCAL');

-- CreateEnum
CREATE TYPE "PublicDemographicsSource" AS ENUM ('CENSUS_ACS', 'CENSUS_DECENNIAL', 'MANUAL', 'OTHER');

-- CreateTable
CREATE TABLE "County" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fips" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "regionLabel" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "heroEyebrow" TEXT,
    "heroIntro" TEXT,
    "leadName" TEXT,
    "leadTitle" TEXT,
    "leadBio" TEXT,
    "leadPhotoUrl" TEXT,
    "featuredEventSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "showOnStatewideMap" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "County_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountyCampaignStats" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "registrationGoal" INTEGER,
    "newRegistrationsSinceBaseline" INTEGER,
    "registrationBaselineDate" TIMESTAMP(3),
    "volunteerTarget" INTEGER,
    "volunteerCount" INTEGER,
    "campaignVisits" INTEGER,
    "dataPipelineSource" TEXT,
    "pipelineLastSyncAt" TIMESTAMP(3),
    "pipelineError" TEXT,
    "reviewStatus" "CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountyCampaignStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountyPublicDemographics" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "population" INTEGER,
    "votingAgePopulation" INTEGER,
    "medianHouseholdIncome" INTEGER,
    "povertyRatePercent" DOUBLE PRECISION,
    "bachelorsOrHigherPercent" DOUBLE PRECISION,
    "laborEmploymentNote" TEXT,
    "source" "PublicDemographicsSource" NOT NULL DEFAULT 'CENSUS_ACS',
    "sourceDetail" TEXT,
    "asOfYear" INTEGER,
    "fetchedAt" TIMESTAMP(3),
    "reviewStatus" "CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountyPublicDemographics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountyElectedOfficial" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "jurisdiction" "ElectedJurisdiction" NOT NULL,
    "officeTitle" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party" TEXT,
    "termEnd" TEXT,
    "sourceUrl" TEXT,
    "sourceLabel" TEXT,
    "externalId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "reviewStatus" "CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountyElectedOfficial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "County_slug_key" ON "County"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "County_fips_key" ON "County"("fips");

-- CreateIndex
CREATE INDEX "County_published_sortOrder_idx" ON "County"("published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CountyCampaignStats_countyId_key" ON "CountyCampaignStats"("countyId");

-- CreateIndex
CREATE UNIQUE INDEX "CountyPublicDemographics_countyId_key" ON "CountyPublicDemographics"("countyId");

-- CreateIndex
CREATE INDEX "CountyElectedOfficial_countyId_jurisdiction_sortOrder_idx" ON "CountyElectedOfficial"("countyId", "jurisdiction", "sortOrder");

-- AddForeignKey
ALTER TABLE "CountyCampaignStats" ADD CONSTRAINT "CountyCampaignStats_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountyPublicDemographics" ADD CONSTRAINT "CountyPublicDemographics_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountyElectedOfficial" ADD CONSTRAINT "CountyElectedOfficial_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;
