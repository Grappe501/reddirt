import { createHash, timingSafeEqual } from "crypto";

function hashEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a, "utf8").digest();
  const bh = createHash("sha256").update(b, "utf8").digest();
  return ah.length === bh.length && timingSafeEqual(ah, bh);
}
import { cookies } from "next/headers";
import { z } from "zod";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  createKellyMirrorGateToken,
  getKellyMirrorPassphrase,
  KELLY_MIRROR_COOKIE,
  verifyKellyMirrorGateToken,
} from "@/lib/admin/kelly-mirror-gate";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  passphrase: z.string().min(1),
});

export async function GET(): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const configured = Boolean(getKellyMirrorPassphrase());
  const jar = await cookies();
  const unlocked = configured && verifyKellyMirrorGateToken(jar.get(KELLY_MIRROR_COOKIE)?.value, getKellyMirrorPassphrase());

  return Response.json({ ok: true, configured, unlocked });
}

export async function POST(req: Request): Promise<Response> {
  const denied = await assertAdminApi();
  if (denied) return denied;

  const secret = getKellyMirrorPassphrase();
  if (!secret) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ ok: false, error: "validation" }, { status: 400 });
  }

  const { passphrase } = parsed.data;
  if (!hashEqual(passphrase, secret)) {
    return Response.json({ ok: false, error: "auth" }, { status: 401 });
  }

  const token = createKellyMirrorGateToken(secret);
  (await cookies()).set(KELLY_MIRROR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return Response.json({ ok: true, unlocked: true });
}
