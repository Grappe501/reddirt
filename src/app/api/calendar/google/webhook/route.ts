import { EventSyncDirection, EventSyncLogStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { runQuickIncrementalIngestForSource } from "@/lib/calendar/google-sync-engine";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Google Calendar push notification — validates channel token, logs ping, and triggers incremental ingest.
 */
export async function POST(request: Request) {
  const channelId = request.headers.get("X-Goog-Channel-Id");
  const resourceId = request.headers.get("X-Goog-Resource-Id");
  const resourceState = request.headers.get("X-Goog-Resource-State");
  if (channelId) {
    const ch = await prisma.calendarWatchChannel.findFirst({ where: { channelId, resourceId: resourceId ?? "" } });
    if (ch) {
      const token = request.headers.get("X-Goog-Channel-Token");
      if (ch.token && token && ch.token !== token) {
        return new NextResponse("Bad token", { status: 403 });
      }
      await prisma.eventSyncLog.create({
        data: {
          calendarSourceId: ch.calendarSourceId,
          direction: EventSyncDirection.WATCH_PING,
          status: EventSyncLogStatus.OK,
          message: `Resource state: ${resourceState ?? "unknown"}`,
          detailJson: { channelId, resourceId } as object,
        },
      });
      if (resourceState === "sync" || resourceState === "exists" || !resourceState) {
        try {
          await runQuickIncrementalIngestForSource(ch.calendarSourceId);
        } catch (e) {
          await prisma.eventSyncLog.create({
            data: {
              calendarSourceId: ch.calendarSourceId,
              direction: EventSyncDirection.PULL_FROM_GOOGLE,
              status: EventSyncLogStatus.ERROR,
              message: e instanceof Error ? e.message : String(e),
            },
          });
        }
      }
    }
  }
  return new NextResponse(null, { status: 200 });
}
