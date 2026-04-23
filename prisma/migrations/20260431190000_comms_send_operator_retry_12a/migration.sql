-- Packet 12A: operator retry tracking on CommunicationSend
ALTER TABLE "CommunicationSend" ADD COLUMN "retryCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "CommunicationSend" ADD COLUMN "lastRetriedAt" TIMESTAMP(3);
ALTER TABLE "CommunicationSend" ADD COLUMN "lastRetriedByUserId" TEXT;

-- Foreign key to User (operator who last re-queued a failed send)
ALTER TABLE "CommunicationSend" ADD CONSTRAINT "CommunicationSend_lastRetriedByUserId_fkey" FOREIGN KEY ("lastRetriedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "CommunicationSend_lastRetriedByUserId_idx" ON "CommunicationSend"("lastRetriedByUserId");
