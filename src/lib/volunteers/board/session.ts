import { createHmac, timingSafeEqual } from "crypto";

import { VOLUNTEER_BOARD_SESSION_COOKIE } from "./constants";

export { VOLUNTEER_BOARD_SESSION_COOKIE };

type BoardPayload = { exp: number; userId: string; volunteerProfileId: string };

export function createVolunteerBoardSessionToken(
  secret: string,
  userId: string,
  volunteerProfileId: string,
  ttlMs = 30 * 24 * 60 * 60 * 1000,
): string {
  const exp = Date.now() + ttlMs;
  const payload = Buffer.from(
    JSON.stringify({ exp, userId, volunteerProfileId } satisfies BoardPayload),
  ).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyVolunteerBoardSessionToken(
  token: string | undefined,
  secret: string | undefined,
): BoardPayload | null {
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
    const data = JSON.parse(Buffer.from(payloadStr, "base64url").toString()) as BoardPayload;
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    if (typeof data.userId !== "string" || typeof data.volunteerProfileId !== "string") return null;
    return data;
  } catch {
    return null;
  }
}

export function getVolunteerBoardSecret(): string | undefined {
  const hub = process.env.VOLUNTEER_HUB_PASSWORD?.trim();
  if (hub) return hub;
  const admin = process.env.ADMIN_SECRET?.trim();
  return admin || undefined;
}

export function buildVolunteerBoardInviteUrl(
  userId: string,
  volunteerProfileId: string,
  siteUrl?: string,
): string | null {
  const secret = getVolunteerBoardSecret();
  if (!secret) return null;
  const token = createVolunteerBoardSessionToken(secret, userId, volunteerProfileId, 90 * 24 * 60 * 60 * 1000);
  const base = (siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!base) return `/volunteers/sign-in?token=${encodeURIComponent(token)}`;
  return `${base}/volunteers/sign-in?token=${encodeURIComponent(token)}`;
}
