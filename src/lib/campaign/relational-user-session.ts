/**
 * REL-3: signed HTTP-only cookie identifying a User for volunteer relational pages.
 * Email-only sign-in (no password) — suitable for organizer devices; tighten in a later auth packet.
 */

import { createHmac, timingSafeEqual } from "crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminSecret } from "@/lib/admin/session";

export const RELATIONAL_USER_COOKIE = "reddirt_relational_user";

type Payload = { sub: string; exp: number };

function getRelationalSessionSecret(): string | undefined {
  const s = process.env.RELATIONAL_USER_SESSION_SECRET?.trim() || getAdminSecret();
  return s || undefined;
}

export function createRelationalUserSessionToken(userId: string, secret: string): string {
  const exp = Date.now() + 14 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp } satisfies Payload)).toString(
    "base64url",
  );
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyRelationalUserSessionToken(
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
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Payload;
    if (typeof data.sub !== "string" || !data.sub.trim()) return null;
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    return data.sub;
  } catch {
    return null;
  }
}

export async function getRelationalUserIdFromCookies(): Promise<string | null> {
  const secret = getRelationalSessionSecret();
  const token = (await cookies()).get(RELATIONAL_USER_COOKIE)?.value;
  if (!secret) return null;
  return verifyRelationalUserSessionToken(token, secret);
}

export async function requireRelationalUserPage(): Promise<string> {
  const id = await getRelationalUserIdFromCookies();
  if (!id) {
    redirect("/relational/login");
  }
  return id;
}
