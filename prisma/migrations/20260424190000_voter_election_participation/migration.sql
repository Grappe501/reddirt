-- CreateEnum
CREATE TYPE "VoterParticipationProvenance" AS ENUM ('VENDOR_VOTER_FILE', 'IMPORT_CSV', 'STAFF', 'OTHER');

-- CreateTable
CREATE TABLE "VoterElectionParticipation" (
    "id" TEXT NOT NULL,
    "voterRecordId" TEXT NOT NULL,
    "contestKey" TEXT NOT NULL,
    "participated" BOOLEAN NOT NULL,
    "primaryBallotParty" TEXT,
    "provenance" "VoterParticipationProvenance" NOT NULL DEFAULT 'VENDOR_VOTER_FILE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoterElectionParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoterElectionParticipation_voterRecordId_contestKey_key" ON "VoterElectionParticipation"("voterRecordId", "contestKey");

-- CreateIndex
CREATE INDEX "VoterElectionParticipation_voterRecordId_idx" ON "VoterElectionParticipation"("voterRecordId");

-- CreateIndex
CREATE INDEX "VoterElectionParticipation_contestKey_participated_idx" ON "VoterElectionParticipation"("contestKey", "participated");

-- CreateIndex
CREATE INDEX "VoterElectionParticipation_contestKey_primaryBallotParty_idx" ON "VoterElectionParticipation"("contestKey", "primaryBallotParty");

-- AddForeignKey
ALTER TABLE "VoterElectionParticipation" ADD CONSTRAINT "VoterElectionParticipation_voterRecordId_fkey" FOREIGN KEY ("voterRecordId") REFERENCES "VoterRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
