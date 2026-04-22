-- CreateEnum
CREATE TYPE "CommunicationCampaignAutomationStatus" AS ENUM ('NONE', 'SHELL');

-- AlterTable
ALTER TABLE "CommunicationCampaign" ADD COLUMN     "orchestrationIdempotencyKey" TEXT,
ADD COLUMN "triggerSourceType" TEXT,
ADD COLUMN "triggerSourceId" TEXT,
ADD COLUMN "generatedFromTemplateKey" TEXT,
ADD COLUMN "automationStatus" "CommunicationCampaignAutomationStatus" NOT NULL DEFAULT 'NONE';

CREATE UNIQUE INDEX "CommunicationCampaign_orchestrationIdempotencyKey_key" ON "CommunicationCampaign"("orchestrationIdempotencyKey");

CREATE INDEX "CommunicationCampaign_automationStatus_status_idx" ON "CommunicationCampaign"("automationStatus", "status");

CREATE INDEX "CommunicationCampaign_triggerSourceType_triggerSourceId_idx" ON "CommunicationCampaign"("triggerSourceType", "triggerSourceId");
