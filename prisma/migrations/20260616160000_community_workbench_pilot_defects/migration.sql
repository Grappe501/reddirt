-- Community Workbench v1.3 — pilot defect log for live field validation

CREATE TABLE "CommunityWorkbenchPilotDefect" (
    "id" TEXT NOT NULL,
    "workbenchSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "operatorInitials" VARCHAR(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityWorkbenchPilotDefect_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityWorkbenchPilotDefect_workbenchSlug_status_idx" ON "CommunityWorkbenchPilotDefect"("workbenchSlug", "status");
