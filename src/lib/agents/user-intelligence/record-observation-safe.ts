import {
  appendGlobalUserObservation,
  type UserObservationEntry,
  type UserUxObservationEvent,
} from "./user-observations";

const MAX_META_KEYS = 12;
const MAX_META_VALUE_LEN = 200;

/** Safe observation payload from client — no freeform PII fields. */
export type SafeObservationPayload = {
  event: UserUxObservationEvent;
  role: string;
  pathname?: string;
  recordId?: string | null;
  toolId?: string;
  meta?: Record<string, string | number | boolean | null>;
};

export function sanitizeObservationMeta(
  meta?: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> | undefined {
  if (!meta || typeof meta !== "object") return undefined;
  const out: Record<string, string | number | boolean | null> = {};
  let count = 0;
  for (const [k, v] of Object.entries(meta)) {
    if (count >= MAX_META_KEYS) break;
    if (!/^[a-z][a-z0-9_]{0,31}$/i.test(k)) continue;
    if (k.toLowerCase().includes("email") || k.toLowerCase().includes("phone") || k.toLowerCase().includes("ssn")) {
      continue;
    }
    if (typeof v === "string" && v.length > MAX_META_VALUE_LEN) {
      out[k] = v.slice(0, MAX_META_VALUE_LEN);
    } else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean" || v === null) {
      out[k] = v;
    }
    count++;
  }
  return Object.keys(out).length ? out : undefined;
}

export function recordSafeObservation(
  payload: SafeObservationPayload,
  actor = "admin",
): UserObservationEntry {
  return appendGlobalUserObservation({
    event: payload.event,
    actor,
    role: payload.role.slice(0, 48),
    pathname: payload.pathname?.slice(0, 256),
    recordId: payload.recordId ?? null,
    toolId: payload.toolId?.slice(0, 64),
    meta: sanitizeObservationMeta(payload.meta),
  });
}
