-- CampaignOS Phase 1: WorkflowIntake + EventRequest + WorkflowAction (additive only).

-- CreateEnum
CREATE TYPE "WorkflowIntakeStatus" AS ENUM (
  'PENDING',
  'IN_REVIEW',
  'AWAITING_INFO',
  'READY_FOR_CALENDAR',
  'CONVERTED',
  'DECLINED',
  'ARCHIVED'
);

-- CreateEnum
CREATE TYPE "WorkflowActionKind" AS ENUM (
  'STATUS_CHANGE',
  'ASSIGNMENT',
  'NOTE',
  'DECISION',
  'EVENT_LINKED',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "EventRequestStatus" AS ENUM ('OPEN', 'FULFILLED', 'CANCELLED');

-- CreateTable
CREATE TABLE "WorkflowIntake" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT,
  "assignedUserId" TEXT,
  "countyId" TEXT,
  "status" "WorkflowIntakeStatus" NOT NULL DEFAULT 'PENDING',
  "title" TEXT,
  "source" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkflowIntake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRequest" (
  "id" TEXT NOT NULL,
  "workflowIntakeId" TEXT NOT NULL,
  "campaignEventId" TEXT,
  "status" "EventRequestStatus" NOT NULL DEFAULT 'OPEN',
  "requestedStartAt" TIMESTAMP(3),
  "requestedEndAt" TIMESTAMP(3),
  "timezone" TEXT NOT NULL DEFAULT 'America/Chicago',
  "locationName" TEXT,
  "address" TEXT,
  "requestDetails" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EventRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkflowAction" (
  "id" TEXT NOT NULL,
  "workflowIntakeId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "kind" "WorkflowActionKind" NOT NULL DEFAULT 'OTHER',
  "fromStatus" "WorkflowIntakeStatus",
  "toStatus" "WorkflowIntakeStatus",
  "summary" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkflowAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowIntake_submissionId_key" ON "WorkflowIntake"("submissionId");

-- CreateIndex
CREATE INDEX "WorkflowIntake_status_createdAt_idx" ON "WorkflowIntake"("status", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowIntake_assignedUserId_status_idx" ON "WorkflowIntake"("assignedUserId", "status");

-- CreateIndex
CREATE INDEX "WorkflowIntake_countyId_status_idx" ON "WorkflowIntake"("countyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EventRequest_workflowIntakeId_key" ON "EventRequest"("workflowIntakeId");

-- CreateIndex
CREATE INDEX "EventRequest_status_createdAt_idx" ON "EventRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "EventRequest_campaignEventId_idx" ON "EventRequest"("campaignEventId");

-- CreateIndex
CREATE INDEX "WorkflowAction_workflowIntakeId_createdAt_idx" ON "WorkflowAction"("workflowIntakeId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkflowAction_actorUserId_createdAt_idx" ON "WorkflowAction"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRequest" ADD CONSTRAINT "EventRequest_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "WorkflowIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRequest" ADD CONSTRAINT "EventRequest_campaignEventId_fkey" FOREIGN KEY ("campaignEventId") REFERENCES "CampaignEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_workflowIntakeId_fkey" FOREIGN KEY ("workflowIntakeId") REFERENCES "WorkflowIntake"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkflowAction" ADD CONSTRAINT "WorkflowAction_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
