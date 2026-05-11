import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE = "vos_team_access";
const TOKEN_VERSION = 1;
const MAX_AGE_SEC = 90 * 24 * 60 * 60;

function secret(): string | null {
  const s = process.env.VOLUNTEER_OPS_ACCESS_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

function sign(body: string): string {
  const s = secret();
  if (!s) return "";
  return createHmac("sha256", s).update(body).digest("base64url");
}

export type TeamAccessPayload = {
  v: number;
  userId: string;
  teamSlug: string;
  exp: number;
};

export function signTeamAccessToken(payload: Omit<TeamAccessPayload, "exp"> & { exp?: number }): string | null {
  const s = secret();
  if (!s) return null;
  const exp = payload.exp ?? Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const bodyObj: TeamAccessPayload = { v: TOKEN_VERSION, userId: payload.userId, teamSlug: payload.teamSlug, exp };
  const body = Buffer.from(JSON.stringify(bodyObj), "utf8").toString("base64url");
  const sig = sign(body);
  if (!sig) return null;
  return `${body}.${sig}`;
}

export function verifyTeamAccessToken(token: string): TeamAccessPayload | null {
  const s = secret();
  if (!s) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  if (!body || !sig) return null;
  const expected = sign(body);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as TeamAccessPayload).userId !== "string" ||
    typeof (parsed as TeamAccessPayload).teamSlug !== "string" ||
    typeof (parsed as TeamAccessPayload).exp !== "number"
  ) {
    return null;
  }
  const p = parsed as TeamAccessPayload;
  if (p.v !== TOKEN_VERSION) return null;
  if (p.exp < Math.floor(Date.now() / 1000)) return null;
  return p;
}

/** Attach signed team access cookie (HttpOnly). No-op when secret missing. */
export function setTeamAccessCookieOnResponse(res: NextResponse, input: { userId: string; teamSlug: string }): void {
  const token = signTeamAccessToken({ v: TOKEN_VERSION, userId: input.userId, teamSlug: input.teamSlug });
  if (!token) return;
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function setVolunteerOpsTeamSessionCookie(input: { userId: string; teamSlug: string }): Promise<void> {
  const token = signTeamAccessToken({ v: TOKEN_VERSION, userId: input.userId, teamSlug: input.teamSlug });
  if (!token) {
    return;
  }
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export function readTeamAccessFromCookieValue(raw: string | undefined): TeamAccessPayload | null {
  if (!raw?.trim()) return null;
  return verifyTeamAccessToken(raw.trim());
}

/** For App Router `cookies()` store — pass the team slug to ensure the cookie matches this workspace. */
export function teamAccessForSlug(
  rawCookie: string | undefined,
  teamSlug: string,
): { userId: string } | null {
  const p = readTeamAccessFromCookieValue(rawCookie);
  if (!p) return null;
  if (p.teamSlug !== teamSlug) return null;
  return { userId: p.userId };
}
