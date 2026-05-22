import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const MAX_AGE_MS = 10 * 60 * 1000;

export function createGoogleOAuthState(secret: string): string {
  const payload = Buffer.from(JSON.stringify({
    nonce: randomBytes(16).toString("base64url"),
    ts: Date.now(),
  })).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyGoogleOAuthState(state: string | null | undefined, secret: string): boolean {
  if (!state) return false;
  const dot = state.indexOf(".");
  if (dot < 1) return false;
  const payload = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString()) as { ts?: unknown };
    return typeof parsed.ts === "number" && Date.now() - parsed.ts <= MAX_AGE_MS;
  } catch {
    return false;
  }
}
