import { createHmac, timingSafeEqual } from "crypto";

import { VOLUNTEER_SESSION_COOKIE } from "./constants";

export { VOLUNTEER_SESSION_COOKIE };

type Payload = { exp: number; leaderSlug: string; initials: string };

export function createVolunteerSessionToken(secret: string, leaderSlug: string, initials: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp, leaderSlug, initials } satisfies Payload)).toString(
    "base64url",
  );
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyVolunteerSessionToken(
  token: string | undefined,
  secret: string | undefined,
): Payload | null {
  if (!token || !secret) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const payloadStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payloadStr).digest("base64url");
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payloadStr, "base64url").toString()) as Payload;
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    if (typeof data.leaderSlug !== "string" || typeof data.initials !== "string") return null;
    return data;
  } catch {
    return null;
  }
}

export function getVolunteerHubPassword(): string | undefined {
  const s = process.env.VOLUNTEER_HUB_PASSWORD?.trim();
  return s || undefined;
}
