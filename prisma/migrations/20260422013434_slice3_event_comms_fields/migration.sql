-- AlterTable
ALTER TABLE "CampaignEvent" ADD COLUMN     "attendeeCommsStatus" "EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "followupCommsStatus" "EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "lastAttendeeNoticeAt" TIMESTAMP(3),
ADD COLUMN     "lastCancellationNoticeAt" TIMESTAMP(3),
ADD COLUMN     "lastReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "nextReminderDueAt" TIMESTAMP(3),
ADD COLUMN     "reminderPlanStatus" "EventReadinessStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "thankYouQueuedAt" TIMESTAMP(3);
