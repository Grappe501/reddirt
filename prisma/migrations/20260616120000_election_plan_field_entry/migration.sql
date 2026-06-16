-- Election Plan live field entry — operators (initials whitelist) + county/city field log

CREATE TYPE "public"."ElectionPlanFieldCategory" AS ENUM (
  'follower',
  'volunteer',
  'leader',
  'email_contact',
  'conversation',
  'house_party',
  'other'
);

CREATE TYPE "public"."ElectionPlanOperatorCapability" AS ENUM (
  'field_entry',
  'county_scope',
  'manage_operators'
);

CREATE TABLE "public"."ElectionPlanOperator" (
  "id" TEXT NOT NULL,
  "initials" VARCHAR(3) NOT NULL,
  "displayName" TEXT NOT NULL,
  "email" TEXT,
  "countySlug" TEXT,
  "capabilities" "public"."ElectionPlanOperatorCapability"[] DEFAULT ARRAY['field_entry']::"public"."ElectionPlanOperatorCapability"[],
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ElectionPlanOperator_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ElectionPlanOperator_initials_key" ON "public"."ElectionPlanOperator"("initials");
CREATE INDEX "ElectionPlanOperator_active_idx" ON "public"."ElectionPlanOperator"("active");

CREATE TABLE "public"."ElectionPlanFieldEntry" (
  "id" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "operatorInitials" VARCHAR(3) NOT NULL,
  "category" "public"."ElectionPlanFieldCategory" NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "countySlug" TEXT NOT NULL,
  "citySlug" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ElectionPlanFieldEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ElectionPlanFieldEntry_countySlug_citySlug_idx" ON "public"."ElectionPlanFieldEntry"("countySlug", "citySlug");
CREATE INDEX "ElectionPlanFieldEntry_operatorInitials_idx" ON "public"."ElectionPlanFieldEntry"("operatorInitials");
CREATE INDEX "ElectionPlanFieldEntry_category_idx" ON "public"."ElectionPlanFieldEntry"("category");
CREATE INDEX "ElectionPlanFieldEntry_createdAt_idx" ON "public"."ElectionPlanFieldEntry"("createdAt");

ALTER TABLE "public"."ElectionPlanFieldEntry"
  ADD CONSTRAINT "ElectionPlanFieldEntry_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "public"."ElectionPlanOperator"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed leadership operators (initials whitelist). Adjust in /election-plan/operators when live.
INSERT INTO "public"."ElectionPlanOperator" ("id", "initials", "displayName", "capabilities", "active", "updatedAt")
VALUES
  ('epop_kgr', 'KGR', 'Kelly Grappe', ARRAY['field_entry', 'manage_operators']::"public"."ElectionPlanOperatorCapability"[], true, CURRENT_TIMESTAMP),
  ('epop_sgr', 'SGR', 'Steve Grappe', ARRAY['field_entry', 'manage_operators']::"public"."ElectionPlanOperatorCapability"[], true, CURRENT_TIMESTAMP),
  ('epop_ern', 'ERN', 'Ernie', ARRAY['field_entry', 'manage_operators']::"public"."ElectionPlanOperatorCapability"[], true, CURRENT_TIMESTAMP)
ON CONFLICT ("initials") DO NOTHING;
