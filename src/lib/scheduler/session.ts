import { createHmac, timingSafeEqual } from "crypto";

export const SCHEDULER_SESSION_COOKIE = "reddirt_scheduler_session";

type Payload = { exp: number; email: string };

export function getSchedulerOperatorName(): string | undefined {
  const s = process.env.SCHEDULER_OPERATOR_NAME?.trim();
  return s || undefined;
}

export function getSchedulerOperatorEmail(): string | undefined {
  const s = process.env.SCHEDULER_OPERATOR_EMAIL?.trim().toLowerCase();
  return s || undefined;
}

export function getSchedulerOperatorPassword(): string | undefined {
  const encoded = process.env.SCHEDULER_OPERATOR_PASSWORD_B64?.trim();
  if (encoded) {
    try {
      const decoded = Buffer.from(encoded, "base64").toString("utf8").trim();
      if (decoded) return decoded;
    } catch {
      // fall through to plaintext
    }
  }
  const s = process.env.SCHEDULER_OPERATOR_PASSWORD?.trim();
  return s || undefined;
}

export function isSchedulerConfigured(): boolean {
  return Boolean(getSchedulerOperatorEmail() && getSchedulerOperatorPassword());
}

export function createSchedulerSessionToken(secret: string, email: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp, email: email.trim().toLowerCase() } satisfies Payload)).toString(
    "base64url",
  );
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySchedulerSessionToken(
  token: string | undefined,
  secret: string | undefined,
): { ok: true; email: string } | { ok: false } {
  if (!token || !secret) return { ok: false };
  const dot = token.indexOf(".");
  if (dot < 1) return { ok: false };
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return { ok: false };
    }
  } catch {
    return { ok: false };
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as Payload;
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return { ok: false };
    if (typeof data.email !== "string" || !data.email.includes("@")) return { ok: false };
    return { ok: true, email: data.email };
  } catch {
    return { ok: false };
  }
}

export function schedulerSessionSecret(): string | undefined {
  const password = getSchedulerOperatorPassword();
  if (!password) return undefined;
  return `scheduler:${password}`;
}
