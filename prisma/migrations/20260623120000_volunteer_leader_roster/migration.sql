-- Volunteer leader roster — My Five slots, Power of 5 branches, and team members (Operators v3.3)

CREATE TYPE "public"."VolunteerLeaderRosterLayer" AS ENUM ('my_five', 'branch', 'team');

CREATE TYPE "public"."VolunteerLeaderRosterStatus" AS ENUM ('open', 'mapped', 'contacted', 'invited', 'committed');

CREATE TABLE "public"."VolunteerLeaderRosterPerson" (
  "id" TEXT NOT NULL,
  "leaderInitials" VARCHAR(3) NOT NULL,
  "leaderSlug" TEXT NOT NULL,
  "layer" "public"."VolunteerLeaderRosterLayer" NOT NULL,
  "parentId" TEXT,
  "slotIndex" INTEGER,
  "displayName" TEXT NOT NULL,
  "category" TEXT,
  "status" "public"."VolunteerLeaderRosterStatus" NOT NULL DEFAULT 'mapped',
  "notes" TEXT,
  "lastTouchNote" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "VolunteerLeaderRosterPerson_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VolunteerLeaderRosterPerson_leaderInitials_layer_idx"
  ON "public"."VolunteerLeaderRosterPerson"("leaderInitials", "layer");

CREATE INDEX "VolunteerLeaderRosterPerson_leaderSlug_idx"
  ON "public"."VolunteerLeaderRosterPerson"("leaderSlug");

CREATE INDEX "VolunteerLeaderRosterPerson_parentId_idx"
  ON "public"."VolunteerLeaderRosterPerson"("parentId");

CREATE INDEX "VolunteerLeaderRosterPerson_leaderInitials_layer_slotIndex_idx"
  ON "public"."VolunteerLeaderRosterPerson"("leaderInitials", "layer", "slotIndex");

CREATE UNIQUE INDEX "VolunteerLeaderRosterPerson_my_five_slot_key"
  ON "public"."VolunteerLeaderRosterPerson"("leaderInitials", "slotIndex")
  WHERE "layer" = 'my_five' AND "parentId" IS NULL;

CREATE UNIQUE INDEX "VolunteerLeaderRosterPerson_branch_slot_key"
  ON "public"."VolunteerLeaderRosterPerson"("parentId", "slotIndex")
  WHERE "layer" = 'branch' AND "parentId" IS NOT NULL AND "slotIndex" IS NOT NULL;

ALTER TABLE "public"."VolunteerLeaderRosterPerson"
  ADD CONSTRAINT "VolunteerLeaderRosterPerson_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "public"."VolunteerLeaderRosterPerson"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
