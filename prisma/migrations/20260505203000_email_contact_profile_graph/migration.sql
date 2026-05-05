-- EMAIL-CONTACT-PROFILE-GRAPH-1.0 — governed contact profile + fact suggestions from email workflow / AI (no auto CRM merge).

CREATE TYPE "EmailContactProfileFactStatus" AS ENUM ('ACTIVE', 'SUPERSEDED', 'REMOVED');

CREATE TYPE "EmailContactProfileFactSuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED');

CREATE TYPE "EmailAudienceHintStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "EmailWorkflowItem" ADD COLUMN "emailContactProfileId" TEXT;

CREATE TABLE "EmailContactProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "relationalContactId" TEXT,
    "primaryEmail" VARCHAR(320),
    "displayName" VARCHAR(500),
    "county" VARCHAR(120),
    "city" VARCHAR(120),
    "state" VARCHAR(32),
    "source" VARCHAR(120) NOT NULL DEFAULT 'email_workflow_queue',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailContactProfileFact" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "factType" VARCHAR(120) NOT NULL,
    "factKey" VARCHAR(200) NOT NULL,
    "factValue" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "sourceType" VARCHAR(120) NOT NULL DEFAULT 'EMAIL_AI_APPROVED',
    "sourceEmailWorkflowItemId" TEXT,
    "sourceMetadataJson" JSONB NOT NULL DEFAULT '{}',
    "status" "EmailContactProfileFactStatus" NOT NULL DEFAULT 'ACTIVE',
    "approvedByUserId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactProfileFact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailContactProfileFactSuggestion" (
    "id" TEXT NOT NULL,
    "profileId" TEXT,
    "emailWorkflowItemId" TEXT NOT NULL,
    "suggestionType" VARCHAR(120) NOT NULL DEFAULT 'EMAIL_AI_V1',
    "factKey" VARCHAR(200) NOT NULL,
    "factValue" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "rationale" TEXT,
    "sourceLimitations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "EmailContactProfileFactSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailContactProfileFactSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailAudienceHint" (
    "id" TEXT NOT NULL,
    "emailWorkflowItemId" TEXT NOT NULL,
    "profileId" TEXT,
    "hintType" VARCHAR(120) NOT NULL DEFAULT 'EMAIL_AI_V1',
    "label" VARCHAR(500) NOT NULL,
    "rationale" TEXT,
    "confidence" DOUBLE PRECISION,
    "status" "EmailAudienceHintStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedByUserId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAudienceHint_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailContactProfile_userId_idx" ON "EmailContactProfile"("userId");
CREATE INDEX "EmailContactProfile_volunteerProfileId_idx" ON "EmailContactProfile"("volunteerProfileId");
CREATE INDEX "EmailContactProfile_relationalContactId_idx" ON "EmailContactProfile"("relationalContactId");
CREATE INDEX "EmailContactProfile_primaryEmail_idx" ON "EmailContactProfile"("primaryEmail");

CREATE INDEX "EmailContactProfileFact_profileId_status_idx" ON "EmailContactProfileFact"("profileId", "status");
CREATE INDEX "EmailContactProfileFact_sourceEmailWorkflowItemId_idx" ON "EmailContactProfileFact"("sourceEmailWorkflowItemId");

CREATE INDEX "EmailContactProfileFactSuggestion_emailWorkflowItemId_status_idx" ON "EmailContactProfileFactSuggestion"("emailWorkflowItemId", "status");
CREATE INDEX "EmailContactProfileFactSuggestion_profileId_status_idx" ON "EmailContactProfileFactSuggestion"("profileId", "status");

CREATE INDEX "EmailAudienceHint_emailWorkflowItemId_status_idx" ON "EmailAudienceHint"("emailWorkflowItemId", "status");
CREATE INDEX "EmailAudienceHint_profileId_status_idx" ON "EmailAudienceHint"("profileId", "status");

CREATE INDEX "EmailWorkflowItem_emailContactProfileId_idx" ON "EmailWorkflowItem"("emailContactProfileId");

ALTER TABLE "EmailWorkflowItem" ADD CONSTRAINT "EmailWorkflowItem_emailContactProfileId_fkey" FOREIGN KEY ("emailContactProfileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailContactProfile" ADD CONSTRAINT "EmailContactProfile_relationalContactId_fkey" FOREIGN KEY ("relationalContactId") REFERENCES "RelationalContact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailContactProfileFact" ADD CONSTRAINT "EmailContactProfileFact_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmailContactProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailContactProfileFact" ADD CONSTRAINT "EmailContactProfileFact_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmailContactProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_emailWorkflowItemId_fkey" FOREIGN KEY ("emailWorkflowItemId") REFERENCES "EmailWorkflowItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailContactProfileFactSuggestion" ADD CONSTRAINT "EmailContactProfileFactSuggestion_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_emailWorkflowItemId_fkey" FOREIGN KEY ("emailWorkflowItemId") REFERENCES "EmailWorkflowItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "EmailContactProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailAudienceHint" ADD CONSTRAINT "EmailAudienceHint_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
