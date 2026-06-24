-- Phase 2 ops work items: extend CampaignTask for ladder signal → task flow.

CREATE TYPE "CampaignTaskOpsSourceType" AS ENUM (
  'field_signal',
  'workflow_intake',
  'leader_gap',
  'lane_ops',
  'event_template',
  'manual'
);

CREATE TYPE "CampaignTaskOpsVisibility" AS ENUM ('admin', 'operators', 'leader');

ALTER TABLE "CampaignTask" ADD COLUMN "opsSourceType" "CampaignTaskOpsSourceType";
ALTER TABLE "CampaignTask" ADD COLUMN "opsSourceSignalId" TEXT;
ALTER TABLE "CampaignTask" ADD COLUMN "leaderSlug" TEXT;
ALTER TABLE "CampaignTask" ADD COLUMN "laneId" TEXT;
ALTER TABLE "CampaignTask" ADD COLUMN "opsVisibility" "CampaignTaskOpsVisibility";
ALTER TABLE "CampaignTask" ADD COLUMN "opsMetadataJson" JSONB;

CREATE INDEX "CampaignTask_opsSourceSignalId_status_idx" ON "CampaignTask"("opsSourceSignalId", "status");
CREATE INDEX "CampaignTask_leaderSlug_status_idx" ON "CampaignTask"("leaderSlug", "status");
CREATE INDEX "CampaignTask_opsVisibility_status_idx" ON "CampaignTask"("opsVisibility", "status");
