import type {
  CommunicationRecipientEventType,
  CommunicationRecipientStatus,
  CommsDeliveryHealthStatus,
} from "@prisma/client";

/**
 * Good-delivery / engagement path — higher = further along the happy path.
 * Not used for terminal bad rows (BOUNCED, UNSUBSCRIBED, FAILED from provider).
 */
const GOOD_PATH_RANK: Record<CommunicationRecipientStatus, number> = {
  PLANNED: 0,
  SENT: 1,
  DELIVERED: 2,
  OPENED: 3,
  CLICKED: 4,
  REPLIED: 5,
  CANCELED: 0,
  FAILED: 0,
  BOUNCED: 0,
  UNSUBSCRIBED: 0,
};

const BAD_RECIPIENT_STATUS: Set<CommunicationRecipientStatus> = new Set([
  "BOUNCED",
  "UNSUBSCRIBED",
  "FAILED",
  "CANCELED",
]);

const BAD_DELIVERY_HEALTH: Set<CommsDeliveryHealthStatus> = new Set([
  "HARD_BOUNCED",
  "INVALID_EMAIL",
  "INVALID_PHONE",
  "UNSUBSCRIBED",
  "SMS_OPT_OUT",
  "SUPPRESSED",
]);

function isGoodPathStatus(s: CommunicationRecipientStatus): boolean {
  return !BAD_RECIPIENT_STATUS.has(s) && (GOOD_PATH_RANK[s] > 0 || s === "PLANNED");
}

/**
 * From a **single** normalized event, derive the next recipient `status` field.
 * Does not consider history; callers merge with `shouldApplyRecipientStatusChange`.
 */
export function mapRecipientEventToStatus(
  t: CommunicationRecipientEventType
): CommunicationRecipientStatus | null {
  switch (t) {
    case "SENT":
      return "SENT";
    case "DELIVERED":
      return "DELIVERED";
    case "OPENED":
      return "OPENED";
    case "CLICKED":
      return "CLICKED";
    case "REPLIED":
      return "REPLIED";
    case "FAILED":
      return "FAILED";
    case "BOUNCED":
      return "BOUNCED";
    case "UNSUBSCRIBED":
      return "UNSUBSCRIBED";
    case "OPTED_OUT_SMS":
      return "UNSUBSCRIBED";
    case "WEB_VISIT":
    case "FORM_SUBMITTED":
    default:
      return null;
  }
}

/**
 * If we already know a **bad** terminal state, do not allow a **good-path** or weaker
 * signal to overwrite it (stale or out-of-order webhooks).
 */
export function shouldApplyRecipientStatusChange(
  current: CommunicationRecipientStatus,
  proposed: CommunicationRecipientStatus
): boolean {
  if (proposed === current) return false;
  if (BAD_RECIPIENT_STATUS.has(current) && isGoodPathStatus(proposed)) {
    return false;
  }
  if (isGoodPathStatus(current) && isGoodPathStatus(proposed) && GOOD_PATH_RANK[proposed] < GOOD_PATH_RANK[current]) {
    return false;
  }
  if (BAD_RECIPIENT_STATUS.has(proposed) && isGoodPathStatus(current)) {
    return true;
  }
  if (BAD_RECIPIENT_STATUS.has(proposed) && BAD_RECIPIENT_STATUS.has(current)) {
    // Prefer the most "final" for ops: BOUNCED/UNSUBSCRIBED/FAILED are all terminal; allow lateral when provider corrects
    return true;
  }
  if (isGoodPathStatus(proposed) && isGoodPathStatus(current)) {
    return GOOD_PATH_RANK[proposed] > GOOD_PATH_RANK[current];
  }
  if (current === "PLANNED" && isGoodPathStatus(proposed)) return true;
  return true;
}

export function mapBounceToDeliveryHealth(kind: "hard" | "soft" | "block" | "unknown"): CommsDeliveryHealthStatus {
  if (kind === "hard") return "HARD_BOUNCED";
  if (kind === "soft" || kind === "block" || kind === "unknown") return "INVALID_EMAIL";
  return "HARD_BOUNCED";
}

/**
 * Incorporate a normalized event into `deliveryHealthStatus` (conservative, no spurious “healthy” after a bad read).
 */
export function applyRecipientEventToDeliveryHealth(
  current: CommsDeliveryHealthStatus,
  eventType: CommunicationRecipientEventType,
  options?: { bounceKind?: "hard" | "soft" | "block" | "unknown" }
): CommsDeliveryHealthStatus {
  switch (eventType) {
    case "BOUNCED":
      return mapBounceToDeliveryHealth(options?.bounceKind ?? "unknown");
    case "UNSUBSCRIBED":
      return "UNSUBSCRIBED";
    case "OPTED_OUT_SMS":
      return "SMS_OPT_OUT";
    case "FAILED":
      return current === "UNKNOWN" ? "UNKNOWN" : current;
    case "SENT":
    case "DELIVERED":
    case "OPENED":
    case "CLICKED":
    case "REPLIED":
    case "WEB_VISIT":
    case "FORM_SUBMITTED":
      if (BAD_DELIVERY_HEALTH.has(current)) return current;
      if (current === "UNKNOWN" || current === "SUPPRESSED") return "HEALTHY";
      return current;
    default:
      return current;
  }
}

/**
 * `applyRecipientEventToRecipientStatus` — combine map + should apply (single decision point for ingestion).
 */
export function applyRecipientEventToRecipientStatus(
  current: CommunicationRecipientStatus,
  eventType: CommunicationRecipientEventType
): CommunicationRecipientStatus {
  const proposed = mapRecipientEventToStatus(eventType);
  if (proposed == null) return current;
  if (!shouldApplyRecipientStatusChange(current, proposed)) return current;
  return proposed;
}
