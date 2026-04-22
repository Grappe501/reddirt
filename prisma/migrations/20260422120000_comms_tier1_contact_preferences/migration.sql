-- CreateEnum
CREATE TYPE "EmailOptInStatus" AS ENUM ('UNKNOWN', 'OPT_IN', 'OPT_OUT');

-- CreateEnum
CREATE TYPE "SmsOptInStatus" AS ENUM ('UNKNOWN', 'OPT_IN', 'OPT_OUT');

-- AlterTable
ALTER TABLE "CommunicationThread" ADD COLUMN     "aiThreadSummary" TEXT,
ADD COLUMN     "aiNextBestAction" TEXT,
ADD COLUMN     "lastTouchedAt" TIMESTAMP(3),
ADD COLUMN     "nextActionDueAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ContactPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "communicationThreadId" TEXT,
    "emailOptInStatus" "EmailOptInStatus" NOT NULL DEFAULT 'UNKNOWN',
    "smsOptInStatus" "SmsOptInStatus" NOT NULL DEFAULT 'UNKNOWN',
    "globalUnsubscribeAt" TIMESTAMP(3),
    "smsOptOutAt" TIMESTAMP(3),
    "sendgridSuppressionState" JSONB DEFAULT '{}',
    "twilioOptOutState" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContactPreference_userId_key" ON "ContactPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactPreference_volunteerProfileId_key" ON "ContactPreference"("volunteerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactPreference_communicationThreadId_key" ON "ContactPreference"("communicationThreadId");

-- AddForeignKey
ALTER TABLE "ContactPreference" ADD CONSTRAINT "ContactPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPreference" ADD CONSTRAINT "ContactPreference_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPreference" ADD CONSTRAINT "ContactPreference_communicationThreadId_fkey" FOREIGN KEY ("communicationThreadId") REFERENCES "CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
