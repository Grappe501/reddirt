-- CreateEnum
CREATE TYPE "EventReadinessStatus" AS ENUM ('UNKNOWN', 'NOT_STARTED', 'IN_PROGRESS', 'READY', 'AT_RISK', 'N_A');

-- AlterTable
ALTER TABLE "CampaignEvent" ADD COLUMN "internalSummary" TEXT,
ADD COLUMN "cancellationReason" TEXT,
ADD COLUMN "commsReadiness" "EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "staffingReadiness" "EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "prepReadiness" "EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN "followupReadiness" "EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN';
