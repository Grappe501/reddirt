import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getYouTubeOAuthConfigStatus } from "@/lib/media/youtube-transcripts/oauth-config";
import { getYouTubeAuthUrl } from "@/lib/media/youtube-transcripts/oauth-client";
import { signYouTubeOAuthState } from "@/lib/media/youtube-transcripts/oauth-state";

export const dynamic = "force-dynamic";

const DEFAULT_RETURN = "/admin/media/youtube";

function safeReturnPath(raw: string | null): string {
  const v = raw?.trim();
  if (!v || !v.startsWith("/") || v.startsWith("//")) return DEFAULT_RETURN;
  return v;
}

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.redirect(new URL("/admin/login?error=config", origin));
  }
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token, secret)) {
    return NextResponse.redirect(new URL("/admin/login", origin));
  }

  const cfg = getYouTubeOAuthConfigStatus();
  if (!cfg.isConfigured) {
    const missing = encodeURIComponent(cfg.gaps[0]?.missingEnvVars.join(",") ?? "unknown");
    return NextResponse.redirect(new URL(`${DEFAULT_RETURN}?yt_error=config&missing=${missing}`, origin));
  }

  const actor = await getAdminActorUserId();
  const uid = actor ?? "admin";
  const ret = safeReturnPath(new URL(request.url).searchParams.get("return"));
  try {
    const state = signYouTubeOAuthState({
      uid,
      exp: Date.now() + 10 * 60 * 1000,
      ret,
    });
    return NextResponse.redirect(getYouTubeAuthUrl(state));
  } catch {
    return NextResponse.redirect(new URL(`${DEFAULT_RETURN}?yt_error=oauth_build`, origin));
  }
}
