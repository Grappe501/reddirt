-- Local vote-target cushions for Community Workbench field planning (does not alter global snapshot)

CREATE TABLE "CommunityWorkbenchVoteCushion" (
    "id" TEXT NOT NULL,
    "workbenchSlug" TEXT NOT NULL,
    "label" TEXT,
    "targetIncreasePct" DOUBLE PRECISION,
    "targetVotes" INTEGER,
    "notes" TEXT,
    "operatorInitials" VARCHAR(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityWorkbenchVoteCushion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityWorkbenchVoteCushion_workbenchSlug_key" ON "CommunityWorkbenchVoteCushion"("workbenchSlug");

CREATE INDEX "CommunityWorkbenchVoteCushion_workbenchSlug_idx" ON "CommunityWorkbenchVoteCushion"("workbenchSlug");
