import { createHmac, timingSafeEqual } from "crypto";

export type GmailOAuthStatePayload = {
  /** Staff `User.id` */
  uid: string;
  exp: number;
  /** Safe path under this app (starts with /) */
  ret: string;
};

function getGmailOAuthStateSecret(): string | undefined {
  const s = process.env.GMAIL_OAUTH_STATE_SECRET?.trim() || process.env.ADMIN_SECRET?.trim();
  return s || undefined;
}

/**
 * CSRF-safe OAuth `state`: HMAC-signed JSON with expiry.
 */
export function signGmailOAuthState(payload: GmailOAuthStatePayload): string {
  const secret = getGmailOAuthStateSecret();
  if (!secret) throw new Error("GMAIL_OAUTH_STATE_SECRET or ADMIN_SECRET required for Gmail OAuth state.");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyGmailOAuthState(token: string | null): GmailOAuthStatePayload | null {
  if (!token) return null;
  const secret = getGmailOAuthStateSecret();
  if (!secret) return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return null;
    }
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as GmailOAuthStatePayload;
    if (!data?.uid || typeof data.exp !== "number" || typeof data.ret !== "string") return null;
    if (data.exp <= Date.now()) return null;
    if (!data.ret.startsWith("/") || data.ret.startsWith("//")) return null;
    return data;
  } catch {
    return null;
  }
}
