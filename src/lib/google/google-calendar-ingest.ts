import "server-only";

import type { calendar_v3 } from "googleapis";
import { prisma } from "@/lib/db";
import { getCalendarApiForSource } from "@/lib/integrations/google/calendar";

/**
 * Read-only events.list for ingest — does not mutate CalendarSource.syncToken.
 */
export async function listCalendarEventsForIngestWindow(input: {
  calendarSourceId: string;
  timeMin: Date;
  timeMax: Date;
  maxEvents: number;
  includeCanceled: boolean;
}): Promise<calendar_v3.Schema$Event[]> {
  const source = await prisma.calendarSource.findUniqueOrThrow({ where: { id: input.calendarSourceId } });
  const cal = getCalendarApiForSource(source);
  const out: calendar_v3.Schema$Event[] = [];
  let pageToken: string | undefined;
  while (out.length < input.maxEvents) {
    const res = await cal.events.list({
      calendarId: source.externalCalendarId,
      timeMin: input.timeMin.toISOString(),
      timeMax: input.timeMax.toISOString(),
      maxResults: Math.min(250, input.maxEvents - out.length),
      singleEvents: true,
      pageToken,
      showDeleted: false,
    });
    const items = res.data.items ?? [];
    for (const ev of items) {
      if (!input.includeCanceled && ev.status === "cancelled") continue;
      out.push(ev);
      if (out.length >= input.maxEvents) break;
    }
    pageToken = res.data.nextPageToken ?? undefined;
    if (!pageToken) break;
  }
  return out.slice(0, input.maxEvents);
}

export function calendarEventIsPrivate(ev: calendar_v3.Schema$Event): boolean {
  const v = (ev.visibility ?? "").toLowerCase();
  if (v === "private" || v === "confidential") return true;
  return false;
}
