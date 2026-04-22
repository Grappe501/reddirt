import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { getGmailAuthUrlForStaffUser } from "@/lib/integrations/gmail/oauth";
import { isGmailOAuthConfigured } from "@/lib/integrations/gmail/env";

export const dynamic = "force-dynamic";

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
  if (!isGmailOAuthConfigured()) {
    return NextResponse.redirect(new URL("/admin/workbench?error=gmail_not_configured", origin));
  }
  const actor = await getAdminActorUserId();
  if (!actor) {
    return NextResponse.redirect(
      new URL("/admin/workbench?error=gmail_needs_actor", origin)
    );
  }
  try {
    const url = getGmailAuthUrlForStaffUser(actor);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL("/admin/workbench?error=gmail_oauth", origin));
  }
}
