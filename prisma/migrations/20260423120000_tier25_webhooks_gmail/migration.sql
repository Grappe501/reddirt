-- AlterEnum
ALTER TYPE "CommsSendProvider" ADD VALUE 'GMAIL';

-- AlterTable
ALTER TABLE "CommunicationMessage" ADD COLUMN     "gmailMessageId" TEXT,
ADD COLUMN "gmailThreadId" TEXT;

CREATE INDEX "CommunicationMessage_gmailMessageId_idx" ON "CommunicationMessage"("gmailMessageId");

-- AlterTable
ALTER TABLE "CommunicationCampaign" ADD COLUMN     "engagementOpenCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "engagementClickCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CommunicationCampaignRecipient" ADD COLUMN     "engagementOpenedAt" TIMESTAMP(3),
ADD COLUMN "engagementClickedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StaffGmailAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sendAsEmail" TEXT NOT NULL,
    "oauthJson" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffGmailAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffGmailAccount_userId_key" ON "StaffGmailAccount"("userId");

ALTER TABLE "StaffGmailAccount" ADD CONSTRAINT "StaffGmailAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
