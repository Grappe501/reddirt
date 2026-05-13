-- =============================================================================
-- CORE SCHEMA DRIFT — REPAIR DRAFT (DO NOT RUN AUTOMATICALLY)
-- =============================================================================
-- Source: verbatim excerpts from RedDirt `prisma/migrations/*.sql` for missing
--         core objects: County, VoterRecord stack, User (minimal + follow-ups).
-- Purpose: DBA review only. Skip any block that already exists live (enums,
--          tables, indexes, FKs). Expect conflicts if partial migrations ran.
-- Order:   County → voter file base → voter warehouse hardening → User →
--          User/VoterRecord columns from volunteer signup intake migration.
-- Backup:  Host snapshot / PITR before executing anything.
-- See:     docs/CORE_SCHEMA_DRIFT_REPAIR_PLAN.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1 — SOURCE: prisma/migrations/20260221120000_county_command_pages/migration.sql
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- SECTION 2 — SOURCE: prisma/migrations/20260221143000_voter_file_snapshots_and_metrics/migration.sql
-- -----------------------------------------------------------------------------

-- CreateEnum
CREATE TYPE "VoterFileIngestStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'COMPLETE', 'FAILED');

-- CreateTable
CREATE TABLE "VoterFileSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileAsOfDate" TIMESTAMP(3) NOT NULL,
    "previousSnapshotId" TEXT,
    "sourceFilename" TEXT,
    "sourceFileHash" TEXT,
    "rowCountProcessed" INTEGER,
    "status" "VoterFileIngestStatus" NOT NULL DEFAULT 'RECEIVED',
    "errorMessage" TEXT,
    "operatorNotes" TEXT,

    CONSTRAINT "VoterFileSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountyVoterMetrics" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "voterFileSnapshotId" TEXT NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "registrationBaselineDate" TIMESTAMP(3) NOT NULL,
    "newRegistrationsSinceBaseline" INTEGER NOT NULL DEFAULT 0,
    "newRegistrationsSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "droppedSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "netChangeSincePreviousSnapshot" INTEGER NOT NULL DEFAULT 0,
    "countyGoal" INTEGER,
    "progressPercent" DOUBLE PRECISION,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewStatus" "CountyContentReviewStatus" NOT NULL DEFAULT 'PENDING_REVIEW',

    CONSTRAINT "CountyVoterMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoterRecord" (
    "id" TEXT NOT NULL,
    "voterFileKey" TEXT NOT NULL,
    "countyFips" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3),
    "firstSeenSnapshotId" TEXT NOT NULL,
    "lastSeenSnapshotId" TEXT NOT NULL,
    "droppedAtSnapshotId" TEXT,
    "inLatestCompletedFile" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoterFileSnapshot_sourceFileHash_key" ON "VoterFileSnapshot"("sourceFileHash");

-- CreateIndex
CREATE INDEX "VoterFileSnapshot_fileAsOfDate_idx" ON "VoterFileSnapshot"("fileAsOfDate");

-- CreateIndex
CREATE INDEX "VoterFileSnapshot_status_fileAsOfDate_idx" ON "VoterFileSnapshot"("status", "fileAsOfDate");

-- CreateIndex
CREATE INDEX "CountyVoterMetrics_asOfDate_idx" ON "CountyVoterMetrics"("asOfDate");

-- CreateIndex
CREATE INDEX "CountyVoterMetrics_countyId_asOfDate_idx" ON "CountyVoterMetrics"("countyId", "asOfDate");

-- CreateIndex
CREATE UNIQUE INDEX "CountyVoterMetrics_countyId_voterFileSnapshotId_key" ON "CountyVoterMetrics"("countyId", "voterFileSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "VoterRecord_voterFileKey_key" ON "VoterRecord"("voterFileKey");

-- CreateIndex
CREATE INDEX "VoterRecord_countyId_inLatestCompletedFile_idx" ON "VoterRecord"("countyId", "inLatestCompletedFile");

-- CreateIndex
CREATE INDEX "VoterRecord_countyFips_idx" ON "VoterRecord"("countyFips");

-- CreateIndex
CREATE INDEX "VoterRecord_registrationDate_idx" ON "VoterRecord"("registrationDate");

-- AddForeignKey
ALTER TABLE "VoterFileSnapshot" ADD CONSTRAINT "VoterFileSnapshot_previousSnapshotId_fkey" FOREIGN KEY ("previousSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountyVoterMetrics" ADD CONSTRAINT "CountyVoterMetrics_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountyVoterMetrics" ADD CONSTRAINT "CountyVoterMetrics_voterFileSnapshotId_fkey" FOREIGN KEY ("voterFileSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_firstSeenSnapshotId_fkey" FOREIGN KEY ("firstSeenSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_lastSeenSnapshotId_fkey" FOREIGN KEY ("lastSeenSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_droppedAtSnapshotId_fkey" FOREIGN KEY ("droppedAtSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- SECTION 3 — SOURCE: prisma/migrations/20260221180000_voter_warehouse_hardening/migration.sql
-- (Run only after Section 1–2 objects exist; contains UPDATEs touching County / VoterRecord)
-- -----------------------------------------------------------------------------

-- CreateEnum
CREATE TYPE "VoterSnapshotChangeType" AS ENUM ('NEW', 'UPDATED', 'REMOVED', 'REACTIVATED');

-- AlterTable: VoterFileSnapshot
ALTER TABLE "VoterFileSnapshot" ADD COLUMN "fileReceivedAt" TIMESTAMP(3);

-- AlterTable: CountyVoterMetrics — new columns (backfill from County before NOT NULL)
ALTER TABLE "CountyVoterMetrics" ADD COLUMN "countySlug" TEXT;
ALTER TABLE "CountyVoterMetrics" ADD COLUMN "totalRegisteredCount" INTEGER;

UPDATE "CountyVoterMetrics" AS m
SET "countySlug" = c."slug"
FROM "County" AS c
WHERE c."id" = m."countyId";

UPDATE "CountyVoterMetrics" SET "countySlug" = 'unknown' WHERE "countySlug" IS NULL;

ALTER TABLE "CountyVoterMetrics" ALTER COLUMN "countySlug" SET NOT NULL;

-- AlterTable: VoterRecord (warehouse hardening) — if table is empty, still safe
ALTER TABLE "VoterRecord" ADD COLUMN "countySlug" TEXT;
ALTER TABLE "VoterRecord" ADD COLUMN "city" TEXT;
ALTER TABLE "VoterRecord" ADD COLUMN "precinct" TEXT;
ALTER TABLE "VoterRecord" ADD COLUMN "updatedFromSnapshotId" TEXT;
ALTER TABLE "VoterRecord" ADD COLUMN "droppedOffAt" TIMESTAMP(3);

UPDATE "VoterRecord" AS v
SET "countySlug" = c."slug"
FROM "County" AS c
WHERE c."id" = v."countyId";

UPDATE "VoterRecord" SET "countySlug" = 'unknown' WHERE "countySlug" IS NULL;

ALTER TABLE "VoterRecord" ALTER COLUMN "countySlug" SET NOT NULL;

-- CreateTable: VoterSnapshotChange
CREATE TABLE "VoterSnapshotChange" (
    "id" TEXT NOT NULL,
    "voterFileSnapshotId" TEXT NOT NULL,
    "voterRecordId" TEXT,
    "voterFileKey" TEXT NOT NULL,
    "changeType" "VoterSnapshotChangeType" NOT NULL,
    "countyId" TEXT NOT NULL,
    "countySlug" TEXT NOT NULL,
    "summaryJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoterSnapshotChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_voterFileSnapshotId_changeType_idx" ON "VoterSnapshotChange"("voterFileSnapshotId", "changeType");

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_countySlug_voterFileSnapshotId_idx" ON "VoterSnapshotChange"("countySlug", "voterFileSnapshotId");

-- CreateIndex
CREATE INDEX "VoterSnapshotChange_voterFileKey_idx" ON "VoterSnapshotChange"("voterFileKey");

-- AddForeignKey
ALTER TABLE "VoterRecord" ADD CONSTRAINT "VoterRecord_updatedFromSnapshotId_fkey" FOREIGN KEY ("updatedFromSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_voterFileSnapshotId_fkey" FOREIGN KEY ("voterFileSnapshotId") REFERENCES "VoterFileSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterSnapshotChange" ADD CONSTRAINT "VoterSnapshotChange_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- VoterRecord indexes
CREATE INDEX "VoterRecord_countySlug_idx" ON "VoterRecord"("countySlug");

-- CountyVoterMetrics index (may duplicate name — skip if exists)
CREATE INDEX IF NOT EXISTS "CountyVoterMetrics_countySlug_asOfDate_idx" ON "CountyVoterMetrics"("countySlug", "asOfDate");

-- -----------------------------------------------------------------------------
-- SECTION 4 — SOURCE: prisma/migrations/20260421120000_init/migration.sql
-- (`User` only — VolunteerProfile already reported present in drift scenario;
--  re-add FK between VolunteerProfile and User in a separate manual step if missing.)
-- -----------------------------------------------------------------------------

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "zip" TEXT,
    "county" TEXT,
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- -----------------------------------------------------------------------------
-- SECTION 5 — SOURCE: prisma/migrations/20260421221514_volunteer_signup_sheet_intake/migration.sql
-- (User / VoterRecord extensions required for current Prisma schema —
--  run only if those columns/FK are absent.)
-- -----------------------------------------------------------------------------

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "linkedVoterRecordId" TEXT;

-- AlterTable
ALTER TABLE "VoterRecord" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone10" TEXT;

-- CreateIndex
CREATE INDEX "VoterRecord_countyId_lastName_firstName_idx" ON "VoterRecord"("countyId", "lastName", "firstName");

-- CreateIndex
CREATE INDEX "VoterRecord_phone10_idx" ON "VoterRecord"("phone10");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_linkedVoterRecordId_fkey" FOREIGN KEY ("linkedVoterRecordId") REFERENCES "VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- -----------------------------------------------------------------------------
-- OPTIONAL — If VolunteerProfile exists without FK to User (drift repair):
-- -----------------------------------------------------------------------------
-- ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_userId_fkey"
--   FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- (Omit if constraint already exists; ensure every userId exists in User first.)

-- =============================================================================
-- END DRAFT — reconcile with `npm run inspect:core-schema-drift` before any EXECUTE
-- =============================================================================
