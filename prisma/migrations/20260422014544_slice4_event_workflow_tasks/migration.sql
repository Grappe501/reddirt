-- AlterTable
ALTER TABLE "CampaignTask" ADD COLUMN     "blocksReadiness" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceTemplateTaskKey" TEXT;

-- AlterTable
ALTER TABLE "WorkflowTemplate" ADD COLUMN     "campaignEventType" "CampaignEventType";

-- AlterTable
ALTER TABLE "WorkflowTemplateTask" ADD COLUMN     "blocksReadiness" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "minEventStage" "EventWorkflowState";

-- CreateIndex
CREATE INDEX "CampaignTask_eventId_sourceTemplateTaskKey_idx" ON "CampaignTask"("eventId", "sourceTemplateTaskKey");

-- CreateIndex
CREATE INDEX "WorkflowTemplate_campaignEventType_idx" ON "WorkflowTemplate"("campaignEventType");
