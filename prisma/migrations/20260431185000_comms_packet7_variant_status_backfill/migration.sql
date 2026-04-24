-- Packet 7 follow-up: backfill after enum values are committed (PG cannot UPDATE to new enum in same txn as ADD VALUE).
UPDATE "CommunicationVariant" SET status = 'READY_FOR_REVIEW'::"CommunicationVariantStatus" WHERE status = 'READY'::"CommunicationVariantStatus";
