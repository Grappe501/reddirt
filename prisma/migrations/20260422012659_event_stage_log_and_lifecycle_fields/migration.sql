-- AlterTable
ALTER TABLE "CampaignEvent" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedByUserId" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "submittedForReviewAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "EventStageChangeLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fromState" "EventWorkflowState",
    "toState" "EventWorkflowState" NOT NULL,
    "actorUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventStageChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventStageChangeLog_eventId_createdAt_idx" ON "EventStageChangeLog"("eventId", "createdAt");

-- CreateIndex
CREATE INDEX "EventStageChangeLog_toState_createdAt_idx" ON "EventStageChangeLog"("toState", "createdAt");

-- AddForeignKey
ALTER TABLE "CampaignEvent" ADD CONSTRAINT "CampaignEvent_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStageChangeLog" ADD CONSTRAINT "EventStageChangeLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CampaignEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventStageChangeLog" ADD CONSTRAINT "EventStageChangeLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Slice 2: public calendar now requires PUBLISHED, not APPROVED-only. Preserve prior go-live rows.
UPDATE "CampaignEvent" SET "eventWorkflowState" = 'PUBLISHED' WHERE "isPublicOnWebsite" = true AND "eventWorkflowState" = 'APPROVED';
