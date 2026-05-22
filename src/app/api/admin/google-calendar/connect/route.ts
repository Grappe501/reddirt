import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { getAdminSecret } from "@/lib/admin/session";
import { isGoogleCalendarConfigured } from "@/lib/calendar/env";
import { createGoogleOAuthState } from "@/lib/calendar/google-oauth-state";
import { createOAuth2Client } from "@/lib/integrations/google/auth";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

export async function GET() {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const secret = getAdminSecret();
  if (!secret) return NextResponse.json({ error: "Admin is not configured." }, { status: 503 });
  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json({ error: "Google Calendar OAuth env is not configured." }, { status: 503 });
  }

  const client = createOAuth2Client();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: createGoogleOAuthState(secret),
  });
  return NextResponse.redirect(url);
}
