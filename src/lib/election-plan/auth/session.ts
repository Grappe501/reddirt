import { createHmac, timingSafeEqual } from "crypto";

import { ELECTION_PLAN_SESSION_COOKIE } from "./constants";

export { ELECTION_PLAN_SESSION_COOKIE };

type Payload = { exp: number };

export function createElectionPlanSessionToken(secret: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp } satisfies Payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyElectionPlanSessionToken(token: string | undefined, secret: string | undefined): boolean {
  if (!token || !secret) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return false;
    }
  } catch {
    return false;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Payload;
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function getElectionPlanPassword(): string | undefined {
  const s = process.env.ELECTION_PLAN_PASSWORD?.trim();
  return s || undefined;
}

/** Comma-separated leadership emails — future email login (not active yet). */
export function getElectionPlanAdminEmails(): string[] {
  const raw = process.env.ELECTION_PLAN_ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
