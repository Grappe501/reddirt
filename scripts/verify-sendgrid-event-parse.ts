/**
 * Offline parse check for SendGrid-shaped events (fake data only — example.com).
 * npm run email:sendgrid:event-parse-check
 */

import {
  mapSendGridEventToSuppressionType,
  normalizeSendGridEventItem,
  parseSendGridEventWebhookJson,
  shouldCreateSuppressionForEvent,
} from "../src/lib/sendgrid/event-parser";

const samples = [
  { event: "delivered", email: "a@example.com", timestamp: 1710000000, sg_event_id: "evt-del-1" },
  { event: "bounce", email: "b@example.com", timestamp: 1710000001, sg_event_id: "evt-bnc-1", reason: "550 5.1.1" },
  { event: "open", email: "c@example.com", timestamp: 1710000002, sg_event_id: "evt-opn-1" },
  { event: "click", email: "d@example.com", timestamp: 1710000003, sg_event_id: "evt-clk-1", url: "https://example.com/x" },
  { event: "unsubscribe", email: "e@example.com", timestamp: 1710000004, sg_event_id: "evt-uns-1" },
  { event: "group_unsubscribe", email: "f@example.com", timestamp: 1710000005, sg_event_id: "evt-gu-1" },
  { event: "spamreport", email: "g@example.com", timestamp: 1710000006, sg_event_id: "evt-spm-1" },
  {
    event: "dropped",
    email: "h@example.com",
    timestamp: 1710000007,
    sg_event_id: "evt-dr-1",
    reason: "Unsubscribed Address",
  },
];

function main() {
  const raw = JSON.stringify(samples);
  const arr = parseSendGridEventWebhookJson(raw);
  if (arr.length !== samples.length) {
    console.error("parse length mismatch");
    process.exit(1);
  }
  for (const item of arr) {
    const n = normalizeSendGridEventItem(item);
    if (!n) {
      console.error("normalize failed", item);
      process.exit(1);
    }
    const sup = shouldCreateSuppressionForEvent(n.eventType, (item as { reason?: string }).reason);
    const st = mapSendGridEventToSuppressionType(n.eventType, (item as { reason?: string }).reason);
    console.log(n.eventType, "suppression?", sup, "map", st ?? "—", "email", n.email);
  }
  console.log("verify-sendgrid-event-parse: OK");
}

main();
