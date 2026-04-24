-- DATA-4 + ELECTION-INGEST-1: election results provenance + tabulation tables

CREATE TYPE "ElectionResultSourceType" AS ENUM ('JSON_FILE', 'MANUAL_UPLOAD', 'OFFICIAL_EXPORT', 'UNKNOWN');

CREATE TABLE "ElectionResultSource" (
    "id" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "sourceType" "ElectionResultSourceType" NOT NULL DEFAULT 'UNKNOWN',
    "electionName" TEXT NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "electionIdExternal" TEXT,
    "isOfficial" BOOLEAN,
    "parserVariant" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionResultSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ElectionContestResult" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contestName" TEXT NOT NULL,
    "contestType" TEXT,
    "jurisdictionLevel" TEXT,
    "totalVotes" INTEGER,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionContestResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ElectionCountyResult" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contestId" TEXT,
    "countyId" TEXT,
    "countyNameRaw" TEXT NOT NULL,
    "countyFips" TEXT,
    "totalVotes" INTEGER,
    "registeredVoters" INTEGER,
    "ballotsCast" INTEGER,
    "votePercent" DECIMAL(9,4),
    "reportingPercent" DECIMAL(9,4),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionCountyResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ElectionCandidateResult" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "countyResultId" TEXT,
    "candidateName" TEXT NOT NULL,
    "partyName" TEXT,
    "totalVotes" INTEGER NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionCandidateResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ElectionPrecinctResult" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "contestId" TEXT,
    "countyId" TEXT,
    "countyNameRaw" TEXT,
    "countyFips" TEXT,
    "precinctNameRaw" TEXT,
    "precinctExternalId" TEXT,
    "totalVotes" INTEGER,
    "registeredVoters" INTEGER,
    "ballotsCast" INTEGER,
    "votePercent" DECIMAL(9,4),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionPrecinctResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ElectionPrecinctCandidateResult" (
    "id" TEXT NOT NULL,
    "precinctResultId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "partyName" TEXT,
    "totalVotes" INTEGER NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElectionPrecinctCandidateResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ElectionResultSource_electionDate_idx" ON "ElectionResultSource"("electionDate");
CREATE INDEX "ElectionResultSource_sourcePath_idx" ON "ElectionResultSource"("sourcePath");

CREATE INDEX "ElectionContestResult_sourceId_idx" ON "ElectionContestResult"("sourceId");

CREATE INDEX "ElectionCountyResult_sourceId_idx" ON "ElectionCountyResult"("sourceId");
CREATE INDEX "ElectionCountyResult_contestId_idx" ON "ElectionCountyResult"("contestId");
CREATE INDEX "ElectionCountyResult_countyId_idx" ON "ElectionCountyResult"("countyId");

CREATE INDEX "ElectionCandidateResult_contestId_idx" ON "ElectionCandidateResult"("contestId");
CREATE INDEX "ElectionCandidateResult_countyResultId_idx" ON "ElectionCandidateResult"("countyResultId");

CREATE INDEX "ElectionPrecinctResult_sourceId_idx" ON "ElectionPrecinctResult"("sourceId");
CREATE INDEX "ElectionPrecinctResult_contestId_idx" ON "ElectionPrecinctResult"("contestId");
CREATE INDEX "ElectionPrecinctResult_countyId_idx" ON "ElectionPrecinctResult"("countyId");

CREATE INDEX "ElectionPrecinctCandidateResult_precinctResultId_idx" ON "ElectionPrecinctCandidateResult"("precinctResultId");

ALTER TABLE "ElectionContestResult" ADD CONSTRAINT "ElectionContestResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElectionCountyResult" ADD CONSTRAINT "ElectionCountyResult_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ElectionCandidateResult" ADD CONSTRAINT "ElectionCandidateResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElectionCandidateResult" ADD CONSTRAINT "ElectionCandidateResult_countyResultId_fkey" FOREIGN KEY ("countyResultId") REFERENCES "ElectionCountyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ElectionResultSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "ElectionContestResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ElectionPrecinctResult" ADD CONSTRAINT "ElectionPrecinctResult_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ElectionPrecinctCandidateResult" ADD CONSTRAINT "ElectionPrecinctCandidateResult_precinctResultId_fkey" FOREIGN KEY ("precinctResultId") REFERENCES "ElectionPrecinctResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
