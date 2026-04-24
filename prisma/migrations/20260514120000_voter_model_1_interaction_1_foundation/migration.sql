-- VOTER-MODEL-1 + INTERACTION-1: voter signals, provisional classifications, interaction log, vote-plan seed

CREATE TYPE "VoterSignalKind" AS ENUM (
  'DONOR',
  'VOLUNTEER',
  'EVENT_ATTENDEE',
  'INITIATIVE_SIGNER',
  'RELATIONAL_CONTACT',
  'CONTACT_LIST',
  'VOTER_HISTORY',
  'POLLING',
  'MANUAL_NOTE',
  'OTHER'
);

CREATE TYPE "VoterSignalSource" AS ENUM (
  'INTERNAL',
  'UPLOADED_FILE',
  'VOTER_FILE',
  'ELECTION_RESULTS',
  'FEC',
  'STATE_DONOR_DATA',
  'RELATIONAL_ORGANIZING',
  'MANUAL',
  'OTHER'
);

CREATE TYPE "VoterSignalStrength" AS ENUM (
  'STRONG',
  'MODERATE',
  'WEAK',
  'NEGATIVE',
  'UNKNOWN'
);

CREATE TYPE "ModelConfidence" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'HUMAN_CONFIRMED'
);

CREATE TYPE "VoterClassification" AS ENUM (
  'STRONG_BASE',
  'LIKELY_SUPPORTER',
  'LEANING_SUPPORTER',
  'PERSUADABLE',
  'LOW_PROPENSITY_SUPPORTER',
  'UNKNOWN',
  'UNLIKELY_OR_OPPOSED'
);

CREATE TYPE "ModelGeneratedBy" AS ENUM (
  'HUMAN',
  'RULE_BASED',
  'AI_ASSISTED',
  'IMPORTED'
);

CREATE TYPE "VoterInteractionType" AS ENUM (
  'INTRODUCTION',
  'REGISTRATION_CHECK',
  'ISSUE_CONVERSATION',
  'SUPPORT_ID',
  'VOLUNTEER_ASK',
  'DONATION_ASK',
  'EVENT_INVITE',
  'GOTV_CONTACT',
  'VOTE_PLAN',
  'FOLLOW_UP',
  'OTHER'
);

CREATE TYPE "VoterInteractionChannel" AS ENUM (
  'IN_PERSON',
  'PHONE',
  'TEXT',
  'EMAIL',
  'SOCIAL_DM',
  'EVENT',
  'DOOR',
  'OTHER'
);

CREATE TYPE "VoterSupportLevel" AS ENUM (
  'STRONG_SUPPORT',
  'LEAN_SUPPORT',
  'PERSUADABLE',
  'UNDECIDED',
  'LEAN_OPPOSE',
  'STRONG_OPPOSE',
  'UNKNOWN'
);

CREATE TYPE "VotePlanStatus" AS ENUM (
  'NOT_STARTED',
  'NEEDS_PLAN',
  'PLAN_CREATED',
  'NEEDS_REMINDER',
  'VOTED_CONFIRMED',
  'UNKNOWN'
);

CREATE TABLE "VoterSignal" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT,
    "userId" TEXT,
    "signalKind" "VoterSignalKind" NOT NULL,
    "signalSource" "VoterSignalSource" NOT NULL,
    "signalStrength" "VoterSignalStrength" NOT NULL,
    "signalDate" TIMESTAMP(3),
    "confidence" "ModelConfidence" NOT NULL,
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterSignal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VoterModelClassification" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT NOT NULL,
    "classification" "VoterClassification" NOT NULL,
    "confidence" "ModelConfidence" NOT NULL,
    "sourceSummary" TEXT,
    "modelVersion" TEXT NOT NULL DEFAULT 'voter-model-v1',
    "generatedBy" "ModelGeneratedBy" NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "overriddenByUserId" TEXT,
    "overriddenAt" TIMESTAMP(3),
    "overrideReason" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterModelClassification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VoterInteraction" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT,
    "contactedByUserId" TEXT,
    "relatedVolunteerUserId" TEXT,
    "interactionType" "VoterInteractionType" NOT NULL,
    "interactionChannel" "VoterInteractionChannel" NOT NULL,
    "interactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supportLevel" "VoterSupportLevel",
    "registrationChecked" BOOLEAN NOT NULL DEFAULT false,
    "registrationStatusAtContact" TEXT,
    "wantsFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpNotes" TEXT,
    "votePlanStatus" "VotePlanStatus",
    "notes" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterInteraction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VoterVotePlan" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "planStatus" "VotePlanStatus" NOT NULL DEFAULT 'NEEDS_PLAN',
    "votingMethod" TEXT,
    "plannedVoteDate" TIMESTAMP(3),
    "pollingPlaceNotes" TEXT,
    "transportationNeeded" BOOLEAN NOT NULL DEFAULT false,
    "reminderNeeded" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterVotePlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VoterSignal_voterRecordId_idx" ON "VoterSignal"("voterRecordId");
CREATE INDEX "VoterSignal_userId_idx" ON "VoterSignal"("userId");
CREATE INDEX "VoterSignal_signalKind_idx" ON "VoterSignal"("signalKind");

CREATE INDEX "VoterModelClassification_voterRecordId_idx" ON "VoterModelClassification"("voterRecordId");
CREATE INDEX "VoterModelClassification_voterRecordId_isCurrent_idx" ON "VoterModelClassification"("voterRecordId", "isCurrent");

CREATE INDEX "VoterInteraction_voterRecordId_idx" ON "VoterInteraction"("voterRecordId");
CREATE INDEX "VoterInteraction_contactedByUserId_idx" ON "VoterInteraction"("contactedByUserId");
CREATE INDEX "VoterInteraction_relatedVolunteerUserId_idx" ON "VoterInteraction"("relatedVolunteerUserId");
CREATE INDEX "VoterInteraction_interactionDate_idx" ON "VoterInteraction"("interactionDate");

CREATE INDEX "VoterVotePlan_voterRecordId_idx" ON "VoterVotePlan"("voterRecordId");

ALTER TABLE "VoterSignal" ADD CONSTRAINT "VoterSignal_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoterSignal" ADD CONSTRAINT "VoterSignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoterModelClassification" ADD CONSTRAINT "VoterModelClassification_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoterModelClassification" ADD CONSTRAINT "VoterModelClassification_overriddenByUserId_fkey" FOREIGN KEY ("overriddenByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoterInteraction" ADD CONSTRAINT "VoterInteraction_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoterInteraction" ADD CONSTRAINT "VoterInteraction_contactedByUserId_fkey" FOREIGN KEY ("contactedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VoterInteraction" ADD CONSTRAINT "VoterInteraction_relatedVolunteerUserId_fkey" FOREIGN KEY ("relatedVolunteerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VoterVotePlan" ADD CONSTRAINT "VoterVotePlan_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VoterVotePlan" ADD CONSTRAINT "VoterVotePlan_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
