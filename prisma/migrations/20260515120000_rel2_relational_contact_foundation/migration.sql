-- REL-2: Relational contact + power-of-5 foundation; optional links on VoterInteraction / VoterSignal

CREATE TYPE "RelationalRelationshipType" AS ENUM (
  'FAMILY',
  'FRIEND',
  'NEIGHBOR',
  'COWORKER',
  'CHURCH_COMMUNITY',
  'SCHOOL_COMMUNITY',
  'COMMUNITY_GROUP',
  'ONLINE',
  'OTHER',
  'UNKNOWN'
);

CREATE TYPE "RelationalRelationshipCloseness" AS ENUM (
  'VERY_CLOSE',
  'CLOSE',
  'FAMILIAR',
  'WEAK_TIE',
  'UNKNOWN'
);

CREATE TYPE "RelationalMatchStatus" AS ENUM (
  'UNMATCHED',
  'POSSIBLE_MATCH',
  'MATCHED',
  'CONFLICT',
  'NOT_REGISTERED',
  'NEEDS_REVIEW'
);

CREATE TYPE "RelationalOrganizingStatus" AS ENUM (
  'IDENTIFIED',
  'NEEDS_REGISTRATION_CHECK',
  'REGISTRATION_CHECKED',
  'CONTACTED',
  'ENGAGED',
  'SUPPORT_ASSESSED',
  'FOLLOW_UP_NEEDED',
  'VOTE_PLAN_NEEDED',
  'VOTE_PLAN_CREATED',
  'INVITED_TO_POWER_OF_FIVE',
  'INVITED_TO_VOLUNTEER',
  'NOT_INTERESTED',
  'DO_NOT_CONTACT',
  'UNKNOWN'
);

CREATE TABLE "RelationalContact" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "matchedVoterRecordId" TEXT,
    "countyId" TEXT,
    "fieldUnitId" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "relationshipType" "RelationalRelationshipType" NOT NULL,
    "relationshipCloseness" "RelationalRelationshipCloseness",
    "matchStatus" "RelationalMatchStatus" NOT NULL DEFAULT 'UNMATCHED',
    "matchConfidence" "ModelConfidence",
    "organizingStatus" "RelationalOrganizingStatus" NOT NULL DEFAULT 'IDENTIFIED',
    "supportLevel" "VoterSupportLevel",
    "isCoreFive" BOOLEAN NOT NULL DEFAULT false,
    "powerOfFiveSlot" INTEGER,
    "lastContactedAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelationalContact_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RelationalContact_ownerUserId_idx" ON "RelationalContact"("ownerUserId");
CREATE INDEX "RelationalContact_matchedVoterRecordId_idx" ON "RelationalContact"("matchedVoterRecordId");
CREATE INDEX "RelationalContact_countyId_idx" ON "RelationalContact"("countyId");
CREATE INDEX "RelationalContact_fieldUnitId_idx" ON "RelationalContact"("fieldUnitId");
CREATE INDEX "RelationalContact_matchStatus_organizingStatus_idx" ON "RelationalContact"("matchStatus", "organizingStatus");

ALTER TABLE "RelationalContact" ADD CONSTRAINT "RelationalContact_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RelationalContact" ADD CONSTRAINT "RelationalContact_matchedVoterRecordId_fkey" FOREIGN KEY ("matchedVoterRecordId") REFERENCES "VoterRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RelationalContact" ADD CONSTRAINT "RelationalContact_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RelationalContact" ADD CONSTRAINT "RelationalContact_fieldUnitId_fkey" FOREIGN KEY ("fieldUnitId") REFERENCES "FieldUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoterInteraction" ADD COLUMN     "relationalContactId" TEXT;
CREATE INDEX "VoterInteraction_relationalContactId_idx" ON "VoterInteraction"("relationalContactId");
ALTER TABLE "VoterInteraction" ADD CONSTRAINT "VoterInteraction_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoterSignal" ADD COLUMN     "relationalContactId" TEXT;
CREATE INDEX "VoterSignal_relationalContactId_idx" ON "VoterSignal"("relationalContactId");
ALTER TABLE "VoterSignal" ADD CONSTRAINT "VoterSignal_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
