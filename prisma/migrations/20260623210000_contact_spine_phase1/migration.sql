-- Phase 1 contact spine: link intake, field log, and roster to RelationalContact.

ALTER TABLE "WorkflowIntake" ADD COLUMN "relationalContactId" TEXT;

ALTER TABLE "ElectionPlanFieldEntry" ADD COLUMN "relationalContactId" TEXT;

ALTER TABLE "VolunteerLeaderRosterPerson" ADD COLUMN "relationalContactId" TEXT;

CREATE INDEX "WorkflowIntake_relationalContactId_idx" ON "WorkflowIntake"("relationalContactId");
CREATE INDEX "ElectionPlanFieldEntry_relationalContactId_idx" ON "ElectionPlanFieldEntry"("relationalContactId");
CREATE INDEX "VolunteerLeaderRosterPerson_relationalContactId_idx" ON "VolunteerLeaderRosterPerson"("relationalContactId");

ALTER TABLE "WorkflowIntake" ADD CONSTRAINT "WorkflowIntake_relationalContactId_fkey"
  FOREIGN KEY ("relationalContactId") REFERENCES "RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ElectionPlanFieldEntry" ADD CONSTRAINT "ElectionPlanFieldEntry_relationalContactId_fkey"
  FOREIGN KEY ("relationalContactId") REFERENCES "RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VolunteerLeaderRosterPerson" ADD CONSTRAINT "VolunteerLeaderRosterPerson_relationalContactId_fkey"
  FOREIGN KEY ("relationalContactId") REFERENCES "RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
