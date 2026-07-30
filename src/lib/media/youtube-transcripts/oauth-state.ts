import { createHmac, timingSafeEqual } from "crypto";

export type YouTubeOAuthStatePayload = {
  uid: string;
  exp: number;
  ret: string;
};

function getStateSecret(): string | undefined {
  return (
    process.env.YOUTUBE_OAUTH_STATE_SECRET?.trim() ||
    process.env.GMAIL_OAUTH_STATE_SECRET?.trim() ||
    process.env.ADMIN_SECRET?.trim() ||
    undefined
  );
}

export function signYouTubeOAuthState(payload: YouTubeOAuthStatePayload): string {
  const secret = getStateSecret();
  if (!secret) throw new Error("ADMIN_SECRET (or YOUTUBE_OAUTH_STATE_SECRET) required for YouTube OAuth state.");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyYouTubeOAuthState(token: string | null): YouTubeOAuthStatePayload | null {
  if (!token) return null;
  const secret = getStateSecret();
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
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as YouTubeOAuthStatePayload;
    if (!data?.uid || typeof data.exp !== "number" || typeof data.ret !== "string") return null;
    if (data.exp <= Date.now()) return null;
    if (!data.ret.startsWith("/") || data.ret.startsWith("//")) return null;
    return data;
  } catch {
    return null;
  }
}
