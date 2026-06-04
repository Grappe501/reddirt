import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const KELLY_MIRROR_COOKIE = "kelly_mirror_gate";
const GATE_TTL_MS = 12 * 60 * 60 * 1000;

type GatePayload = { exp: number };

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}

export function getKellyMirrorPassphrase(): string | undefined {
  const p = process.env.KELLY_MIRROR_PASSPHRASE?.trim();
  return p || undefined;
}

export function isKellyMirrorConfigured(): boolean {
  return Boolean(getKellyMirrorPassphrase());
}

export function createKellyMirrorGateToken(passphrase: string): string {
  const exp = Date.now() + GATE_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp } satisfies GatePayload)).toString("base64url");
  const sig = createHmac("sha256", passphrase).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyKellyMirrorGateToken(token: string | undefined, passphrase: string | undefined): boolean {
  if (!token || !passphrase) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", passphrase).update(payload).digest("base64url");
  try {
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return false;
    }
  } catch {
    return false;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as GatePayload;
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function hasKellyMirrorAccess(): Promise<boolean> {
  const passphrase = getKellyMirrorPassphrase();
  if (!passphrase) return false;
  const jar = await cookies();
  return verifyKellyMirrorGateToken(jar.get(KELLY_MIRROR_COOKIE)?.value, passphrase);
}
