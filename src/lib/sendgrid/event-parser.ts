/**
 * SendGrid Event Webhook JSON parsing + normalization (no network, no secrets).
 */

import type { SendGridSuppressionType } from "@prisma/client";

export type NormalizedSendGridEvent = {
  eventType: string;
  email: string | null;
  sendgridEventId: string | null;
  sendgridMessageId: string | null;
  sendgridMarketingCampaignId: string | null;
  occurredAt: Date;
  /** JSON-safe, stripped of common secret-bearing keys (one level + shallow nested). */
  sanitizedPayload: Record<string, unknown>;
};

const SECRET_KEY_RE = /^(.*)(secret|password|api[_-]?key|token|authorization)(.*)$/i;

function isSecretishKey(k: string): boolean {
  return SECRET_KEY_RE.test(k);
}

/** Remove keys that commonly carry credentials; keep operational fields for audits. */
export function sanitizeSendGridEventObject(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (isSecretishKey(k)) continue;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner: Record<string, unknown> = {};
      for (const [ik, iv] of Object.entries(v as Record<string, unknown>)) {
        if (!isSecretishKey(ik)) inner[ik] = iv;
      }
      out[k] = inner;
    } else {
      out[k] = v;
    }
  }
  return out;
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function pickString(r: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function pickNumber(r: Record<string, unknown>, key: string): number | null {
  const v = r[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

export function parseSendGridEventWebhookJson(raw: string): unknown[] {
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("expected_json_array");
  return parsed;
}

export function normalizeSendGridEventItem(raw: unknown): NormalizedSendGridEvent | null {
  const r = asRecord(raw);
  if (!r) return null;
  const eventType = pickString(r, "event", "event_type") ?? "unknown";
  const email = pickString(r, "email", "recipient");
  const sendgridEventId = pickString(r, "sg_event_id", "sgEventId");
  const sendgridMessageId = pickString(r, "sg_message_id", "smtp-id", "internal_message_id");
  const sendgridMarketingCampaignId = pickString(r, "marketing_campaign_id");
  const ts = pickNumber(r, "timestamp");
  const occurredAt =
    ts != null && ts > 0
      ? new Date(ts * 1000)
      : new Date();
  const sanitizedPayload = sanitizeSendGridEventObject(r);
  return {
    eventType: eventType.toLowerCase(),
    email,
    sendgridEventId,
    sendgridMessageId,
    sendgridMarketingCampaignId,
    occurredAt,
    sanitizedPayload,
  };
}

export function shouldCreateSuppressionForEvent(eventType: string, reason?: string | null): boolean {
  const e = eventType.toLowerCase();
  if (["bounce", "spamreport", "unsubscribe", "group_unsubscribe"].includes(e)) return true;
  if (e === "dropped") {
    const r = (reason ?? "").toLowerCase();
    if (r.includes("unsubscribe")) return true;
    if (r.includes("bounce") || r.includes("bounced address")) return true;
    if (r.includes("invalid")) return true;
  }
  return false;
}

export function mapSendGridEventToSuppressionType(
  eventType: string,
  reason?: string | null
): SendGridSuppressionType | null {
  const e = eventType.toLowerCase();
  if (e === "bounce") return "BOUNCE";
  if (e === "spamreport") return "SPAM_REPORT";
  if (e === "unsubscribe") return "UNSUBSCRIBE";
  if (e === "group_unsubscribe") return "GROUP_UNSUBSCRIBE";
  if (e === "dropped") {
    const r = (reason ?? "").toLowerCase();
    if (r.includes("unsubscribe")) return "UNSUBSCRIBE";
    if (r.includes("bounce")) return "BOUNCE";
    if (r.includes("invalid")) return "INVALID";
  }
  return null;
}
