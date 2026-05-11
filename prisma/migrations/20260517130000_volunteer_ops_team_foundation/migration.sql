-- VOS-1: Volunteer Operating System — solo team provisioning + private invitations + Power of 5 rollups anchor.

CREATE TYPE "VolunteerOpsTeamStatus" AS ENUM ('BUILDING', 'ACTIVE', 'EXPANDING', 'DORMANT', 'ARCHIVED');

CREATE TYPE "VolunteerOpsTeamInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'IGNORED', 'EXPIRED');

CREATE TYPE "VolunteerOpsTeamMemberRole" AS ENUM ('EVENTS', 'SOCIAL_MEDIA', 'POWER_OF_FIVE', 'GENERAL');

CREATE TABLE "VolunteerOpsTeam" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "teamCode" TEXT,
    "geographyLabel" TEXT,
    "level" TEXT NOT NULL DEFAULT 'county',
    "status" "VolunteerOpsTeamStatus" NOT NULL DEFAULT 'BUILDING',
    "upstreamContactUserId" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "adminUserIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "powerOfFiveSummary" JSONB,
    "weeklyBriefing" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerOpsTeam_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VolunteerOpsTeam_slug_key" ON "VolunteerOpsTeam"("slug");

CREATE INDEX "VolunteerOpsTeam_status_createdAt_idx" ON "VolunteerOpsTeam"("status", "createdAt");

CREATE INDEX "VolunteerOpsTeam_createdByUserId_idx" ON "VolunteerOpsTeam"("createdByUserId");

ALTER TABLE "VolunteerOpsTeam" ADD CONSTRAINT "VolunteerOpsTeam_upstreamContactUserId_fkey" FOREIGN KEY ("upstreamContactUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "VolunteerOpsTeam" ADD CONSTRAINT "VolunteerOpsTeam_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "VolunteerOpsTeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "VolunteerOpsTeamMemberRole" NOT NULL,
    "isTemporaryUpstream" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteerOpsTeamMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VolunteerOpsTeamMember_teamId_userId_key" ON "VolunteerOpsTeamMember"("teamId", "userId");

CREATE INDEX "VolunteerOpsTeamMember_teamId_idx" ON "VolunteerOpsTeamMember"("teamId");

CREATE INDEX "VolunteerOpsTeamMember_userId_idx" ON "VolunteerOpsTeamMember"("userId");

ALTER TABLE "VolunteerOpsTeamMember" ADD CONSTRAINT "VolunteerOpsTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "VolunteerOpsTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VolunteerOpsTeamMember" ADD CONSTRAINT "VolunteerOpsTeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "VolunteerOpsTeamInvitation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "role" "VolunteerOpsTeamMemberRole" NOT NULL,
    "status" "VolunteerOpsTeamInviteStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "VolunteerOpsTeamInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VolunteerOpsTeamInvitation_tokenHash_key" ON "VolunteerOpsTeamInvitation"("tokenHash");

CREATE INDEX "VolunteerOpsTeamInvitation_teamId_status_idx" ON "VolunteerOpsTeamInvitation"("teamId", "status");

CREATE INDEX "VolunteerOpsTeamInvitation_emailNormalized_idx" ON "VolunteerOpsTeamInvitation"("emailNormalized");

ALTER TABLE "VolunteerOpsTeamInvitation" ADD CONSTRAINT "VolunteerOpsTeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "VolunteerOpsTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VolunteerOpsTeamInvitation" ADD CONSTRAINT "VolunteerOpsTeamInvitation_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
