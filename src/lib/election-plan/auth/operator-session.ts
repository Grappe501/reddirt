import { createHmac, timingSafeEqual } from "crypto";

import { ELECTION_PLAN_OPERATOR_COOKIE } from "./operator-constants";

export { ELECTION_PLAN_OPERATOR_COOKIE };

type OperatorPayload = { initials: string; exp: number };

export function normalizeOperatorInitials(raw: string): string | null {
  const s = raw.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(s)) return null;
  return s;
}

export function createElectionPlanOperatorToken(initials: string, secret: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ initials, exp } satisfies OperatorPayload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyElectionPlanOperatorToken(
  token: string | undefined,
  secret: string | undefined,
): string | null {
  if (!token || !secret) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as OperatorPayload;
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    return normalizeOperatorInitials(data.initials);
  } catch {
    return null;
  }
}
