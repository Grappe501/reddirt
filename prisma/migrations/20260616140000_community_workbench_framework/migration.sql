-- Community Workbench Framework v1 — operational layer for local communities

CREATE TYPE "public"."CommunityWorkbenchKind" AS ENUM (
  'city',
  'campus',
  'program',
  'county_hub',
  'coalition'
);

CREATE TABLE "public"."CommunityWorkbench" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "kind" "public"."CommunityWorkbenchKind" NOT NULL,
  "countySlug" TEXT,
  "citySlug" TEXT,
  "population" INTEGER,
  "tagline" TEXT,
  "kpiTemplate" TEXT NOT NULL DEFAULT 'default_city',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityWorkbench_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityWorkbench_slug_key" ON "public"."CommunityWorkbench"("slug");
CREATE INDEX "CommunityWorkbench_kind_idx" ON "public"."CommunityWorkbench"("kind");
CREATE INDEX "CommunityWorkbench_countySlug_idx" ON "public"."CommunityWorkbench"("countySlug");
CREATE INDEX "CommunityWorkbench_active_idx" ON "public"."CommunityWorkbench"("active");

CREATE TABLE "public"."CommunityWorkbenchLeadership" (
  "id" TEXT NOT NULL,
  "workbenchId" TEXT NOT NULL,
  "roleKey" TEXT NOT NULL,
  "personName" TEXT NOT NULL,
  "contact" TEXT,
  "notes" TEXT,
  "operatorInitials" VARCHAR(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityWorkbenchLeadership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityWorkbenchLeadership_workbenchId_roleKey_key"
  ON "public"."CommunityWorkbenchLeadership"("workbenchId", "roleKey");

CREATE TABLE "public"."CommunityWorkbenchMission" (
  "id" TEXT NOT NULL,
  "workbenchId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "operatorInitials" VARCHAR(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityWorkbenchMission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityWorkbenchMission_workbenchId_status_idx"
  ON "public"."CommunityWorkbenchMission"("workbenchId", "status");

CREATE TABLE "public"."CommunityWorkbenchCommittee" (
  "id" TEXT NOT NULL,
  "workbenchId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "goals" TEXT,
  "membersJson" TEXT,
  "notes" TEXT,
  "operatorInitials" VARCHAR(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityWorkbenchCommittee_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityWorkbenchCommittee_workbenchId_idx" ON "public"."CommunityWorkbenchCommittee"("workbenchId");

CREATE TABLE "public"."CommunityWorkbenchEvent" (
  "id" TEXT NOT NULL,
  "workbenchId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "eventDate" TIMESTAMP(3),
  "location" TEXT,
  "expectedAttendance" INTEGER,
  "leadName" TEXT,
  "status" TEXT NOT NULL DEFAULT 'planning',
  "runOfShowJson" TEXT,
  "assignmentsJson" TEXT,
  "documentsJson" TEXT,
  "operatorInitials" VARCHAR(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityWorkbenchEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityWorkbenchEvent_workbenchId_eventDate_idx"
  ON "public"."CommunityWorkbenchEvent"("workbenchId", "eventDate");

CREATE TABLE "public"."CommunityWorkbenchIntel" (
  "id" TEXT NOT NULL,
  "workbenchId" TEXT NOT NULL,
  "sectionKey" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "operatorInitials" VARCHAR(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityWorkbenchIntel_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CommunityWorkbenchIntel_workbenchId_sectionKey_title_key"
  ON "public"."CommunityWorkbenchIntel"("workbenchId", "sectionKey", "title");
CREATE INDEX "CommunityWorkbenchIntel_workbenchId_sectionKey_idx"
  ON "public"."CommunityWorkbenchIntel"("workbenchId", "sectionKey");

CREATE TABLE "public"."CommunityWorkbenchRelationship" (
  "id" TEXT NOT NULL,
  "workbenchId" TEXT NOT NULL,
  "personName" TEXT NOT NULL,
  "roleLabel" TEXT,
  "strength" INTEGER NOT NULL DEFAULT 50,
  "lastContact" TEXT,
  "nextFollowUp" TEXT,
  "knowsWho" TEXT,
  "notes" TEXT,
  "operatorInitials" VARCHAR(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityWorkbenchRelationship_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityWorkbenchRelationship_workbenchId_idx" ON "public"."CommunityWorkbenchRelationship"("workbenchId");

CREATE TABLE "public"."CommunityWorkbenchNote" (
  "id" TEXT NOT NULL,
  "workbenchId" TEXT NOT NULL,
  "noteType" TEXT NOT NULL DEFAULT 'meeting',
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "operatorInitials" VARCHAR(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CommunityWorkbenchNote_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityWorkbenchNote_workbenchId_noteType_idx"
  ON "public"."CommunityWorkbenchNote"("workbenchId", "noteType");

ALTER TABLE "public"."CommunityWorkbenchLeadership"
  ADD CONSTRAINT "CommunityWorkbenchLeadership_workbenchId_fkey"
  FOREIGN KEY ("workbenchId") REFERENCES "public"."CommunityWorkbench"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."CommunityWorkbenchMission"
  ADD CONSTRAINT "CommunityWorkbenchMission_workbenchId_fkey"
  FOREIGN KEY ("workbenchId") REFERENCES "public"."CommunityWorkbench"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."CommunityWorkbenchCommittee"
  ADD CONSTRAINT "CommunityWorkbenchCommittee_workbenchId_fkey"
  FOREIGN KEY ("workbenchId") REFERENCES "public"."CommunityWorkbench"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."CommunityWorkbenchEvent"
  ADD CONSTRAINT "CommunityWorkbenchEvent_workbenchId_fkey"
  FOREIGN KEY ("workbenchId") REFERENCES "public"."CommunityWorkbench"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."CommunityWorkbenchIntel"
  ADD CONSTRAINT "CommunityWorkbenchIntel_workbenchId_fkey"
  FOREIGN KEY ("workbenchId") REFERENCES "public"."CommunityWorkbench"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."CommunityWorkbenchRelationship"
  ADD CONSTRAINT "CommunityWorkbenchRelationship_workbenchId_fkey"
  FOREIGN KEY ("workbenchId") REFERENCES "public"."CommunityWorkbench"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."CommunityWorkbenchNote"
  ADD CONSTRAINT "CommunityWorkbenchNote_workbenchId_fkey"
  FOREIGN KEY ("workbenchId") REFERENCES "public"."CommunityWorkbench"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Program / coalition workbenches (cities sync at runtime from election plan snapshot)
INSERT INTO "public"."CommunityWorkbench" ("id", "slug", "name", "kind", "countySlug", "citySlug", "kpiTemplate", "tagline", "updatedAt")
VALUES
  ('cwb_election_integrity', 'election-integrity', 'Election Integrity', 'program', NULL, NULL, 'election_integrity', 'Statewide election integrity organizing', CURRENT_TIMESTAMP),
  ('cwb_direct_democracy', 'direct-democracy', 'Direct Democracy', 'program', NULL, NULL, 'direct_democracy', 'Ballot initiative and direct democracy campaigns', CURRENT_TIMESTAMP),
  ('cwb_uca_campus', 'uca-campus', 'UCA Campus', 'campus', 'faulkner', NULL, 'campus', 'University of Central Arkansas campus program', CURRENT_TIMESTAMP),
  ('cwb_county_fair', 'county-fair-circuit', 'County Fair Circuit', 'program', NULL, NULL, 'events', 'Fair circuit outreach and activation', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
