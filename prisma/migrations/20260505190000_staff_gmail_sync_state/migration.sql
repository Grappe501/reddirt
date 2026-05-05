-- EMAIL-GMAIL-SYNC-1.1: metadata sync / history scaffolding (no message bodies).
ALTER TABLE "StaffGmailAccount" ADD COLUMN "gmailSyncState" JSONB NOT NULL DEFAULT '{}';
