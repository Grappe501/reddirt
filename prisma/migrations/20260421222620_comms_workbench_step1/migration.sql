-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "CommunicationThreadStatus" AS ENUM ('ACTIVE', 'NEEDS_REPLY', 'FOLLOW_UP', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CommsSendProvider" AS ENUM ('TWILIO', 'SENDGRID', 'MANUAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageDeliveryStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'OPENED', 'CLICKED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "CommunicationActionType" AS ENUM ('SEND_SMS', 'SEND_EMAIL', 'SEND_REMINDER', 'AI_SUGGEST_FOLLOWUP');

-- CreateEnum
CREATE TYPE "CommsQueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETE', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "CommunicationThread" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "volunteerProfileId" TEXT,
    "primaryEmail" TEXT,
    "primaryPhone" TEXT,
    "preferredChannel" "CommunicationChannel",
    "threadStatus" "CommunicationThreadStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastInboundAt" TIMESTAMP(3),
    "lastOutboundAt" TIMESTAMP(3),
    "lastMessageAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "priorityScore" INTEGER NOT NULL DEFAULT 0,
    "countyId" TEXT,
    "assignedUserId" TEXT,
    "assignedRoleKey" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationThread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationMessage" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "provider" "CommsSendProvider" NOT NULL,
    "providerMessageId" TEXT,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "subject" TEXT,
    "bodyText" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "deliveryStatus" "MessageDeliveryStatus" NOT NULL DEFAULT 'QUEUED',
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "aiPromptSummary" TEXT,
    "sentByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationActionQueue" (
    "id" TEXT NOT NULL,
    "actionType" "CommunicationActionType" NOT NULL,
    "threadId" TEXT,
    "targetUserId" TEXT,
    "targetVolunteerProfileId" TEXT,
    "payloadJson" JSONB NOT NULL DEFAULT '{}',
    "queueStatus" "CommsQueueStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationActionQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationTag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationThreadTag" (
    "threadId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationThreadTag_pkey" PRIMARY KEY ("threadId","tagId")
);

-- CreateIndex
CREATE INDEX "CommunicationThread_threadStatus_lastMessageAt_idx" ON "CommunicationThread"("threadStatus", "lastMessageAt");

-- CreateIndex
CREATE INDEX "CommunicationThread_unreadCount_priorityScore_idx" ON "CommunicationThread"("unreadCount", "priorityScore");

-- CreateIndex
CREATE INDEX "CommunicationThread_countyId_threadStatus_idx" ON "CommunicationThread"("countyId", "threadStatus");

-- CreateIndex
CREATE INDEX "CommunicationThread_userId_idx" ON "CommunicationThread"("userId");

-- CreateIndex
CREATE INDEX "CommunicationThread_lastMessageAt_idx" ON "CommunicationThread"("lastMessageAt");

-- CreateIndex
CREATE INDEX "CommunicationMessage_threadId_createdAt_idx" ON "CommunicationMessage"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "CommunicationMessage_provider_providerMessageId_idx" ON "CommunicationMessage"("provider", "providerMessageId");

-- CreateIndex
CREATE INDEX "CommunicationActionQueue_queueStatus_scheduledAt_idx" ON "CommunicationActionQueue"("queueStatus", "scheduledAt");

-- CreateIndex
CREATE INDEX "CommunicationActionQueue_threadId_idx" ON "CommunicationActionQueue"("threadId");

-- CreateIndex
CREATE INDEX "CommunicationActionQueue_queueStatus_createdAt_idx" ON "CommunicationActionQueue"("queueStatus", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationTag_key_key" ON "CommunicationTag"("key");

-- CreateIndex
CREATE INDEX "CommunicationThreadTag_tagId_idx" ON "CommunicationThreadTag"("tagId");

-- AddForeignKey
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_volunteerProfileId_fkey" FOREIGN KEY ("volunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "County"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationThread" ADD CONSTRAINT "CommunicationThread_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationMessage" ADD CONSTRAINT "CommunicationMessage_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CommunicationThread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_targetVolunteerProfileId_fkey" FOREIGN KEY ("targetVolunteerProfileId") REFERENCES "VolunteerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationActionQueue" ADD CONSTRAINT "CommunicationActionQueue_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationThreadTag" ADD CONSTRAINT "CommunicationThreadTag_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "CommunicationThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationThreadTag" ADD CONSTRAINT "CommunicationThreadTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "CommunicationTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
