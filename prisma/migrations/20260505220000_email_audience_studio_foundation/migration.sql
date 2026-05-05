-- EMAIL-AUDIENCE-STUDIO-1.0 — saved audience definitions + preview audit rows (no SendGrid).

CREATE TYPE "EmailAudienceDefinitionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

CREATE TABLE "EmailAudienceDefinition" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(240) NOT NULL,
    "description" TEXT,
    "status" "EmailAudienceDefinitionStatus" NOT NULL DEFAULT 'DRAFT',
    "criteriaJson" JSONB NOT NULL DEFAULT '{}',
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailAudienceDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailAudiencePreviewRun" (
    "id" TEXT NOT NULL,
    "audienceDefinitionId" TEXT,
    "criteriaJson" JSONB NOT NULL DEFAULT '{}',
    "matchCount" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedByUserId" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "EmailAudiencePreviewRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EmailAudienceDefinition_status_updatedAt_idx" ON "EmailAudienceDefinition"("status", "updatedAt");

CREATE INDEX "EmailAudiencePreviewRun_generatedAt_idx" ON "EmailAudiencePreviewRun"("generatedAt");
CREATE INDEX "EmailAudiencePreviewRun_audienceDefinitionId_idx" ON "EmailAudiencePreviewRun"("audienceDefinitionId");

ALTER TABLE "EmailAudienceDefinition" ADD CONSTRAINT "EmailAudienceDefinition_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailAudienceDefinition" ADD CONSTRAINT "EmailAudienceDefinition_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "EmailAudiencePreviewRun" ADD CONSTRAINT "EmailAudiencePreviewRun_audienceDefinitionId_fkey" FOREIGN KEY ("audienceDefinitionId") REFERENCES "EmailAudienceDefinition"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmailAudiencePreviewRun" ADD CONSTRAINT "EmailAudiencePreviewRun_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
