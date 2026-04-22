-- CreateEnum
CREATE TYPE "TimeMatrixQuadrant" AS ENUM ('Q1', 'Q2', 'Q3', 'Q4');

-- AlterTable
ALTER TABLE "CampaignEvent" ADD COLUMN     "bigRockOrder" INTEGER,
ADD COLUMN     "campaignIntent" TEXT,
ADD COLUMN     "contentOpportunityNotes" TEXT,
ADD COLUMN     "executionChecklistJson" JSONB DEFAULT '{}',
ADD COLUMN     "isBigRock" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "timeMatrixQuadrant" "TimeMatrixQuadrant" NOT NULL DEFAULT 'Q2';

-- AlterTable
ALTER TABLE "CampaignTask" ADD COLUMN     "timeMatrixQuadrant" "TimeMatrixQuadrant";

-- CreateTable
CREATE TABLE "WeeklyCampaignPlan" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "missionStatement" TEXT,
    "outcome1" TEXT,
    "outcome2" TEXT,
    "outcome3" TEXT,
    "roleCommitmentsJson" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyCampaignPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyBigRock" (
    "id" TEXT NOT NULL,
    "weekPlanId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "eventId" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyBigRock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCampaignPlan_weekStart_key" ON "WeeklyCampaignPlan"("weekStart");

-- CreateIndex
CREATE INDEX "WeeklyCampaignPlan_weekStart_idx" ON "WeeklyCampaignPlan"("weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyBigRock_eventId_key" ON "WeeklyBigRock"("eventId");

-- CreateIndex
CREATE INDEX "WeeklyBigRock_weekPlanId_sortOrder_idx" ON "WeeklyBigRock"("weekPlanId", "sortOrder");

-- AddForeignKey
ALTER TABLE "WeeklyBigRock" ADD CONSTRAINT "WeeklyBigRock_weekPlanId_fkey" FOREIGN KEY ("weekPlanId") REFERENCES "WeeklyCampaignPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyBigRock" ADD CONSTRAINT "WeeklyBigRock_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
