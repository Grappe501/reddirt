-- Community Workbench v1.1 — event ops (status enum, committee link, AAR, attendance)

CREATE TYPE "public"."CommunityWorkbenchEventStatus" AS ENUM (
  'idea',
  'planned',
  'confirmed',
  'executed',
  'aar_complete',
  'cancelled'
);

ALTER TABLE "public"."CommunityWorkbenchEvent"
  ADD COLUMN "committeeId" TEXT,
  ADD COLUMN "actualAttendance" INTEGER,
  ADD COLUMN "aarBody" TEXT;

ALTER TABLE "public"."CommunityWorkbenchEvent"
  ADD COLUMN "statusNew" "public"."CommunityWorkbenchEventStatus" NOT NULL DEFAULT 'idea';

UPDATE "public"."CommunityWorkbenchEvent"
SET "statusNew" = CASE
  WHEN "status" IN ('planning', 'planned') THEN 'planned'::"public"."CommunityWorkbenchEventStatus"
  WHEN "status" = 'confirmed' THEN 'confirmed'::"public"."CommunityWorkbenchEventStatus"
  WHEN "status" = 'executed' THEN 'executed'::"public"."CommunityWorkbenchEventStatus"
  WHEN "status" = 'cancelled' THEN 'cancelled'::"public"."CommunityWorkbenchEventStatus"
  ELSE 'idea'::"public"."CommunityWorkbenchEventStatus"
END;

ALTER TABLE "public"."CommunityWorkbenchEvent" DROP COLUMN "status";
ALTER TABLE "public"."CommunityWorkbenchEvent" RENAME COLUMN "statusNew" TO "status";

CREATE INDEX "CommunityWorkbenchEvent_workbenchId_status_idx"
  ON "public"."CommunityWorkbenchEvent"("workbenchId", "status");
CREATE INDEX "CommunityWorkbenchEvent_committeeId_idx"
  ON "public"."CommunityWorkbenchEvent"("committeeId");

ALTER TABLE "public"."CommunityWorkbenchEvent"
  ADD CONSTRAINT "CommunityWorkbenchEvent_committeeId_fkey"
  FOREIGN KEY ("committeeId") REFERENCES "public"."CommunityWorkbenchCommittee"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
