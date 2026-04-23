-- CE-3: Enforce a single workbench recipient row per send + channel + address (idempotent expansion).
-- Pre-clean duplicates if re-running against dev data; keeps the row with the greater id.
DELETE FROM "CommunicationRecipient" r1
USING "CommunicationRecipient" r2
WHERE r1."communicationSendId" = r2."communicationSendId"
  AND r1."channel" = r2."channel"
  AND r1."addressUsed" = r2."addressUsed"
  AND r1."id" < r2."id";

CREATE UNIQUE INDEX "CommunicationRecipient_communicationSendId_channel_addressUsed_key"
  ON "CommunicationRecipient" ("communicationSendId", "channel", "addressUsed");
