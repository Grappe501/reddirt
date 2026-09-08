CREATE SCHEMA IF NOT EXISTS "marketlab";

CREATE TYPE "marketlab"."CompetitionStatus" AS ENUM ('DRAFT', 'OPEN', 'ACTIVE', 'CLOSED', 'ARCHIVED');
CREATE TYPE "marketlab"."CompetitionMemberRole" AS ENUM ('PLAYER', 'ADMIN', 'INSTRUCTOR');
CREATE TYPE "marketlab"."CashLedgerEntryType" AS ENUM ('OPENING_BALANCE', 'TRADE_SETTLEMENT', 'FEE', 'DIVIDEND', 'ADJUSTMENT', 'REVERSAL');

CREATE TABLE "marketlab"."MarketLabSystemRecord" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketLabSystemRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketlab"."Player" (
  "id" TEXT NOT NULL,
  "authSubject" TEXT NOT NULL,
  "email" TEXT,
  "displayName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketlab"."Competition" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "marketlab"."CompetitionStatus" NOT NULL DEFAULT 'DRAFT',
  "startingCash" DECIMAL(18,2) NOT NULL DEFAULT 1000,
  "currencyCode" TEXT NOT NULL DEFAULT 'USD',
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Competition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketlab"."CompetitionMember" (
  "id" TEXT NOT NULL,
  "competitionId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "role" "marketlab"."CompetitionMemberRole" NOT NULL DEFAULT 'PLAYER',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CompetitionMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketlab"."Portfolio" (
  "id" TEXT NOT NULL,
  "competitionId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "currencyCode" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "marketlab"."CashLedgerEntry" (
  "id" TEXT NOT NULL,
  "portfolioId" TEXT NOT NULL,
  "entryType" "marketlab"."CashLedgerEntryType" NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "currencyCode" TEXT NOT NULL DEFAULT 'USD',
  "memo" TEXT,
  "sourceType" TEXT,
  "sourceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CashLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MarketLabSystemRecord_key_key" ON "marketlab"."MarketLabSystemRecord"("key");
CREATE UNIQUE INDEX "Player_authSubject_key" ON "marketlab"."Player"("authSubject");
CREATE UNIQUE INDEX "Player_email_key" ON "marketlab"."Player"("email");
CREATE UNIQUE INDEX "Competition_slug_key" ON "marketlab"."Competition"("slug");
CREATE INDEX "Competition_status_idx" ON "marketlab"."Competition"("status");
CREATE UNIQUE INDEX "CompetitionMember_competitionId_playerId_key" ON "marketlab"."CompetitionMember"("competitionId", "playerId");
CREATE INDEX "CompetitionMember_playerId_idx" ON "marketlab"."CompetitionMember"("playerId");
CREATE UNIQUE INDEX "Portfolio_competitionId_playerId_key" ON "marketlab"."Portfolio"("competitionId", "playerId");
CREATE INDEX "Portfolio_playerId_idx" ON "marketlab"."Portfolio"("playerId");
CREATE INDEX "CashLedgerEntry_portfolioId_createdAt_idx" ON "marketlab"."CashLedgerEntry"("portfolioId", "createdAt");
CREATE INDEX "CashLedgerEntry_sourceType_sourceId_idx" ON "marketlab"."CashLedgerEntry"("sourceType", "sourceId");

ALTER TABLE "marketlab"."CompetitionMember"
  ADD CONSTRAINT "CompetitionMember_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "marketlab"."Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "CompetitionMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "marketlab"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketlab"."Portfolio"
  ADD CONSTRAINT "Portfolio_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "marketlab"."Competition"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "Portfolio_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "marketlab"."Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "marketlab"."CashLedgerEntry"
  ADD CONSTRAINT "CashLedgerEntry_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "marketlab"."Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
