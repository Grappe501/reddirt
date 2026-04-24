-- AlterTable
ALTER TABLE "CountyPublicDemographics" ADD COLUMN     "ageBandsJson" JSONB,
ADD COLUMN     "raceEthnicityJson" JSONB,
ADD COLUMN     "educationJson" JSONB,
ADD COLUMN     "employmentJson" JSONB,
ADD COLUMN     "unemploymentRatePercent" DOUBLE PRECISION,
ADD COLUMN     "blsIndustryMixJson" JSONB;

-- CreateTable
CREATE TABLE "CountyRegistrationSnapshot" (
    "id" TEXT NOT NULL,
    "countyId" TEXT NOT NULL,
    "sourceFile" TEXT,
    "snapshotDate" TIMESTAMP(3) NOT NULL,
    "totalRegistered" INTEGER NOT NULL,
    "activeRegistered" INTEGER,
    "inactiveRegistered" INTEGER,
    "metadataJson" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CountyRegistrationSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CountyRegistrationSnapshot_countyId_snapshotDate_idx" ON "CountyRegistrationSnapshot"("countyId", "snapshotDate");

-- AddForeignKey
ALTER TABLE "CountyRegistrationSnapshot" ADD CONSTRAINT "CountyRegistrationSnapshot_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CountyStrategyKpi" (
    "id" TEXT NOT NULL,
    "countyId" TEXT,
    "countyName" TEXT,
    "metricKey" TEXT NOT NULL,
    "metricValue" TEXT,
    "metricNumber" DOUBLE PRECISION,
    "metricLabel" TEXT,
    "source" TEXT,
    "confidence" TEXT,
    "metadataJson" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountyStrategyKpi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CountyStrategyKpi_countyId_metricKey_idx" ON "CountyStrategyKpi"("countyId", "metricKey");

-- CreateIndex
CREATE INDEX "CountyStrategyKpi_metricKey_idx" ON "CountyStrategyKpi"("metricKey");

-- AddForeignKey
ALTER TABLE "CountyStrategyKpi" ADD CONSTRAINT "CountyStrategyKpi_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;
