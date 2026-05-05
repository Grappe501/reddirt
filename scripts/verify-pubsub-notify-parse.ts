/**
 * Offline self-check for Gmail Pub/Sub notification JSON parsing (no real addresses required).
 * Run: npx tsx scripts/verify-pubsub-notify-parse.ts
 */

import assert from "node:assert";
import {
  parseGmailNotificationJsonObject,
  parseGmailNotificationUtf8,
} from "../src/lib/gmail/pubsub-notify-parse";

assert.deepStrictEqual(
  parseGmailNotificationUtf8('{"emailAddress":"Operator@Example.invalid","historyId":12345}'),
  { emailAddress: "operator@example.invalid", historyId: "12345" }
);

assert.strictEqual(parseGmailNotificationUtf8("{}"), null);
assert.strictEqual(parseGmailNotificationUtf8("not-json"), null);

assert.deepStrictEqual(
  parseGmailNotificationJsonObject({ emailAddress: " x@y.Z ", historyId: "" }),
  null
);

console.log("verify-pubsub-notify-parse: ok");
