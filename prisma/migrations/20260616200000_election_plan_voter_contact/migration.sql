-- Election Plan voter contact capture — field intake with photo for workbench conversion paths

CREATE TYPE "public"."ElectionPlanVoterContactStatus" AS ENUM (
  'new_contact',
  'follow_up',
  'converted_volunteer',
  'converted_donor',
  'converted_leader'
);

CREATE TABLE "public"."ElectionPlanVoterContact" (
  "id" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "operatorInitials" VARCHAR(3) NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "interestVolunteer" BOOLEAN NOT NULL DEFAULT false,
  "interestDonor" BOOLEAN NOT NULL DEFAULT false,
  "interestLeadership" BOOLEAN NOT NULL DEFAULT false,
  "interestHost" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "photoDataUrl" TEXT,
  "countySlug" TEXT NOT NULL,
  "citySlug" TEXT,
  "workbenchSlug" TEXT,
  "eventSlug" TEXT,
  "eventLabel" TEXT,
  "status" "public"."ElectionPlanVoterContactStatus" NOT NULL DEFAULT 'new_contact',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ElectionPlanVoterContact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ElectionPlanVoterContact_countySlug_citySlug_idx" ON "public"."ElectionPlanVoterContact"("countySlug", "citySlug");
CREATE INDEX "ElectionPlanVoterContact_workbenchSlug_idx" ON "public"."ElectionPlanVoterContact"("workbenchSlug");
CREATE INDEX "ElectionPlanVoterContact_status_idx" ON "public"."ElectionPlanVoterContact"("status");
CREATE INDEX "ElectionPlanVoterContact_createdAt_idx" ON "public"."ElectionPlanVoterContact"("createdAt");

ALTER TABLE "public"."ElectionPlanVoterContact"
  ADD CONSTRAINT "ElectionPlanVoterContact_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "public"."ElectionPlanOperator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
