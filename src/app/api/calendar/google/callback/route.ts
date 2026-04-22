import { EventSyncDirection, EventSyncLogStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/integrations/google/oauth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");
  if (err) {
    return NextResponse.redirect(new URL(`/admin/workbench/calendar?error=${encodeURIComponent(err)}`, url.origin));
  }
  if (!code || !state) {
    return NextResponse.redirect(new URL("/admin/workbench/calendar?error=oauth", url.origin));
  }
  const source = await prisma.calendarSource.findUnique({ where: { id: state } });
  if (!source) {
    return NextResponse.redirect(new URL("/admin/workbench/calendar?error=source", url.origin));
  }
  try {
    const tokens = await exchangeCodeForTokens(code);
    await prisma.calendarSource.update({
      where: { id: source.id },
      data: { oauthJson: tokens as object, updatedAt: new Date() },
    });
    await prisma.eventSyncLog.create({
      data: {
        calendarSourceId: source.id,
        direction: EventSyncDirection.PULL_FROM_GOOGLE,
        status: EventSyncLogStatus.OK,
        message: "OAuth tokens stored",
      },
    });
  } catch {
    return NextResponse.redirect(new URL("/admin/workbench/calendar?error=token", url.origin));
  }
  return NextResponse.redirect(new URL("/admin/workbench/calendar?connected=1", url.origin));
}
