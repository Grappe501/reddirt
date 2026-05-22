import { CalendarSourceType, CalendarSourceVisibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { getAdminSecret } from "@/lib/admin/session";
import { prisma } from "@/lib/db";
import { createOAuth2Client } from "@/lib/integrations/google/auth";
import { verifyGoogleOAuthState } from "@/lib/calendar/google-oauth-state";

function html(body: string, status = 200) {
  return new NextResponse(`<!doctype html><html><body style="font-family:system-ui;padding:24px;max-width:760px"><main>${body}</main></body></html>`, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const secret = getAdminSecret();
  if (!secret) return html("<h1>Admin is not configured.</h1>", 503);

  const url = new URL(req.url);
  const error = url.searchParams.get("error");
  if (error) return html(`<h1>Google Calendar connection failed</h1><p>${escapeHtml(error)}</p>`, 400);
  if (!verifyGoogleOAuthState(url.searchParams.get("state"), secret)) {
    return html("<h1>Invalid or expired OAuth state.</h1><p>Return to Google setup and reconnect.</p>", 400);
  }
  const code = url.searchParams.get("code");
  if (!code) return html("<h1>Missing Google OAuth code.</h1>", 400);

  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    return html("<h1>Refresh token missing</h1><p>Refresh token missing — reconnect with prompt=consent or revoke old app access and try again.</p>", 400);
  }

  const existing = await prisma.calendarSource.findFirst({ where: { label: "kelly-google-oauth-anchor" }, select: { id: true } });
  const data = {
    displayName: "Kelly Google Calendar OAuth Anchor",
    sourceType: CalendarSourceType.INTERNAL_STAFF_PLANNING,
    isPublicFacing: false,
    provider: "GOOGLE" as const,
    externalCalendarId: "primary",
    visibility: CalendarSourceVisibility.STAFF,
    isActive: true,
    syncEnabled: true,
    oauthJson: tokens as object,
  };
  const source = existing
    ? await prisma.calendarSource.update({ where: { id: existing.id }, data })
    : await prisma.calendarSource.create({
      data: {
      label: "kelly-google-oauth-anchor",
      ...data,
      },
    });

  return html(`
    <h1>Google Calendar connected</h1>
    <p>Anchor CalendarSource id:</p>
    <pre style="padding:12px;background:#f3f4f6;border-radius:8px">${escapeHtml(source.id)}</pre>
    <p>Set this only in your local shell before running ensure:</p>
    <pre style="padding:12px;background:#f3f4f6;border-radius:8px">$env:KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID="${escapeHtml(source.id)}"</pre>
    <p><a href="/admin/calendar-command-center/google-setup">Back to Google setup</a></p>
  `);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch] ?? ch));
}
