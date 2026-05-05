import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getGmailAuthUrl } from "@/lib/integrations/gmail/oauth";
import { getGmailOAuthConfigStatus } from "@/lib/gmail/config";
import { signGmailOAuthState } from "@/lib/gmail/oauth-state";

export const dynamic = "force-dynamic";

const DEFAULT_RETURN = "/admin/workbench/email-command-center";

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

  const cfg = getGmailOAuthConfigStatus();
  if (!cfg.isConfigured) {
    const missing = encodeURIComponent(cfg.gaps[0]?.missingEnvVars.join(",") ?? "unknown");
    return NextResponse.redirect(
      new URL(`${DEFAULT_RETURN}?gmail_error=config&missing=${missing}`, origin)
    );
  }

  const actor = await getAdminActorUserId();
  if (!actor) {
    return NextResponse.redirect(
      new URL("/admin/workbench/email-command-center?gmail_error=needs_actor", origin)
    );
  }

  const ret = safeReturnPath(new URL(request.url).searchParams.get("return"));
  try {
    const state = signGmailOAuthState({
      uid: actor,
      exp: Date.now() + 10 * 60 * 1000,
      ret,
    });
    const url = getGmailAuthUrl(state);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(
      new URL("/admin/workbench/email-command-center?gmail_error=oauth_build", origin)
    );
  }
}
