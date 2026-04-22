import { randomBytes } from "node:crypto";
import type { calendar_v3 } from "googleapis";
import {
  CampaignEventStatus,
  CampaignEventType,
  CampaignEventVisibility,
  EventSyncDirection,
  EventSyncLogStatus,
  EventWorkflowState,
  GoogleEventSyncState,
} from "@prisma/client";
import { applyEventTimingConsequences } from "@/lib/calendar/google-sync-consequences";
import { selectOutboundCalendarSource } from "@/lib/calendar/google-sync-policy";
import {
  deleteGoogleEvent,
  fullListEstablishSyncToken,
  getCalendarApiForSource,
  getGoogleEvent,
  incrementalListEvents,
  registerWatch,
  upsertGoogleEvent,
} from "@/lib/integrations/google/calendar";
import { prisma } from "@/lib/db";
import type { CalendarSource } from "@prisma/client";

function newSlug() {
  return `gcal-${randomBytes(6).toString("hex")}`;
}

function toDateTime(ga: calendar_v3.Schema$Event): { startAt: Date; endAt: Date; timezone: string } | null {
  const a = ga.start;
  if (!a) return null;
  if (a.dateTime) {
    const s = new Date(a.dateTime);
    const e = ga.end?.dateTime ? new Date(ga.end.dateTime) : new Date(s.getTime() + 3600000);
    return { startAt: s, endAt: e, timezone: a.timeZone || "America/Chicago" };
  }
  if (a.date) {
    const s = new Date(`${a.date}T12:00:00`);
    const e = ga.end?.date
      ? new Date(`${ga.end.date}T12:00:00`)
      : new Date(s.getTime() + 86400000);
    return { startAt: s, endAt: e, timezone: "America/Chicago" };
  }
  return null;
}

function toGoogleEventBody(ev: {
  title: string;
  description: string | null;
  publicSummary: string | null;
  locationName: string | null;
  address: string | null;
  startAt: Date;
  endAt: Date;
  timezone: string;
  status: CampaignEventStatus;
  eventWorkflowState: EventWorkflowState;
}): calendar_v3.Schema$Event {
  const cancelled = ev.status === CampaignEventStatus.CANCELLED || ev.eventWorkflowState === EventWorkflowState.CANCELED;
  return {
    summary: ev.title,
    description: (ev.publicSummary || ev.description || undefined) ?? undefined,
    location: (ev.locationName || ev.address || undefined) ?? undefined,
    start: { dateTime: ev.startAt.toISOString(), timeZone: ev.timezone },
    end: { dateTime: ev.endAt.toISOString(), timeZone: ev.timezone },
    status: cancelled ? "cancelled" : "confirmed",
  };
}

/**
 * Pushes a campaign event to the correct Google calendar per `selectOutboundCalendarSource`.
 * Moves the row to a new Google calendar when the campaign stage requires it (delete old + insert new).
 */
export async function pushCampaignEventToGoogle(eventId: string, actorUserId: string | null) {
  const allSources = await prisma.calendarSource.findMany({ where: { isActive: true, provider: "GOOGLE" } });
  const event = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");

  const target = selectOutboundCalendarSource(event, allSources);
  if (!target) {
    await prisma.eventSyncLog.create({
      data: {
        eventId,
        status: EventSyncLogStatus.SKIPPED,
        direction: EventSyncDirection.PUSH_TO_GOOGLE,
        message: "No Google calendar with OAuth and routing match",
        detailJson: { stage: event.eventWorkflowState, isPublic: event.isPublicOnWebsite },
      },
    });
    return { ok: true as const, skipped: true };
  }

  if (!target.syncEnabled) {
    await prisma.eventSyncLog.create({
      data: {
        eventId,
        calendarSourceId: target.id,
        status: EventSyncLogStatus.SKIPPED,
        direction: EventSyncDirection.PUSH_TO_GOOGLE,
        message: "Sync disabled for source",
      },
    });
    return { ok: true as const, skipped: true };
  }

  const body = toGoogleEventBody(event);
  const existingSourceId = event.calendarSourceId;
  if (event.googleEventId && existingSourceId && existingSourceId !== target.id) {
    const old = allSources.find((s) => s.id === existingSourceId);
    if (old) {
      try {
        await deleteGoogleEvent(old, event.googleEventId);
      } catch (e) {
        await prisma.eventSyncLog.create({
          data: {
            eventId,
            calendarSourceId: old.id,
            status: EventSyncLogStatus.OK,
            direction: EventSyncDirection.PUSH_TO_GOOGLE,
            message: "Delete old Google copy after rail move (may 404 if already removed)",
            detailJson: { error: String(e) },
          },
        });
      }
    }
    await prisma.campaignEvent.update({
      where: { id: eventId },
      data: { googleEventId: null, googleEtag: null, calendarSourceId: target.id },
    });
  } else if (event.googleEventId) {
    body.id = event.googleEventId;
  }

  try {
    await prisma.campaignEvent.update({
      where: { id: eventId },
      data: { googleSyncState: GoogleEventSyncState.PENDING_PUSH, googleSyncError: null },
    });

    const g = await upsertGoogleEvent(target, body);
    const gid = g.id;
    if (!gid) throw new Error("Google returned no event id");

    await prisma.campaignEvent.update({
      where: { id: eventId },
      data: {
        calendarSourceId: target.id,
        googleEventId: gid,
        googleEtag: g.etag ?? null,
        googleSyncState: GoogleEventSyncState.SYNCED,
        lastGoogleSyncAt: new Date(),
        googleSyncError: null,
      },
    });
    await prisma.eventSyncLog.create({
      data: {
        eventId,
        calendarSourceId: target.id,
        status: EventSyncLogStatus.OK,
        direction: EventSyncDirection.PUSH_TO_GOOGLE,
        message: "Pushed to Google",
        detailJson: { googleEventId: gid },
      },
    });
    return { ok: true as const, skipped: false };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await prisma.campaignEvent.update({
      where: { id: eventId },
      data: { googleSyncState: GoogleEventSyncState.ERROR, googleSyncError: msg },
    });
    await prisma.eventSyncLog.create({
      data: {
        eventId,
        calendarSourceId: target.id,
        status: EventSyncLogStatus.ERROR,
        direction: EventSyncDirection.PUSH_TO_GOOGLE,
        message: msg,
        detailJson: { error: msg },
      },
    });
    throw e;
  }
}

export async function pushCampaignEventToGoogleSafe(eventId: string, actorUserId: string | null) {
  try {
    return await pushCampaignEventToGoogle(eventId, actorUserId);
  } catch {
    return { ok: false as const };
  }
}

export async function pullOneEventFromGoogle(eventId: string) {
  const ev = await prisma.campaignEvent.findUnique({ where: { id: eventId } });
  if (!ev?.googleEventId) throw new Error("No Google event link");
  const src = ev.calendarSourceId
    ? await prisma.calendarSource.findUnique({ where: { id: ev.calendarSourceId } })
    : null;
  if (!src) throw new Error("No calendar source");
  const g = await getGoogleEvent(src, ev.googleEventId);
  await processInboundGoogleEvent(src, g);
}

async function findLocalByGoogleId(calendarSourceId: string, googleEventId: string) {
  return (
    (await prisma.campaignEvent.findFirst({ where: { calendarSourceId, googleEventId } })) ??
    (await prisma.campaignEvent.findFirst({ where: { googleEventId } }))
  );
}

/**
 * Merges one Google event into CampaignOS. Does not reduce published workflow without review flag.
 */
export async function processInboundGoogleEvent(
  source: CalendarSource,
  g: calendar_v3.Schema$Event
): Promise<void> {
  const googleEventId = g.id;
  if (!googleEventId) return;

  const when = toDateTime(g);
  if (!when) {
    await prisma.eventSyncLog.create({
      data: {
        calendarSourceId: source.id,
        status: EventSyncLogStatus.SKIPPED,
        direction: EventSyncDirection.PULL_FROM_GOOGLE,
        message: "Skipped item without parseable time",
        detailJson: { googleEventId },
      },
    });
    return;
  }

  const existing = await findLocalByGoogleId(source.id, googleEventId);
  if (g.status === "cancelled") {
    if (!existing) return;
    if (existing.eventWorkflowState === EventWorkflowState.PUBLISHED) {
      await prisma.campaignEvent.update({
        where: { id: existing.id },
        data: { syncReviewNeeded: true, googleSyncState: GoogleEventSyncState.CONFLICT, googleSyncError: "Cancelled in Google — confirm" },
      });
    } else {
      await prisma.campaignEvent.update({
        where: { id: existing.id },
        data: {
          status: CampaignEventStatus.CANCELLED,
          eventWorkflowState: EventWorkflowState.CANCELED,
          googleSyncState: GoogleEventSyncState.SYNCED,
          lastGoogleSyncAt: new Date(),
        },
      });
    }
    await prisma.eventSyncLog.create({
      data: {
        eventId: existing.id,
        calendarSourceId: source.id,
        direction: EventSyncDirection.PULL_FROM_GOOGLE,
        status: EventSyncLogStatus.OK,
        message: g.status,
        detailJson: { googleEventId },
      },
    });
    return;
  }

  const timesChanged = (e: { startAt: Date; endAt: Date }) => e.startAt.getTime() !== when.startAt.getTime() || e.endAt.getTime() !== when.endAt.getTime();

  if (existing) {
    const tChanged = timesChanged(existing);
    const title = g.summary || existing.title;
    await prisma.campaignEvent.update({
      where: { id: existing.id },
      data: {
        title,
        startAt: when.startAt,
        endAt: when.endAt,
        timezone: when.timezone,
        googleEtag: g.etag ?? existing.googleEtag,
        lastGoogleSyncAt: new Date(),
        googleSyncState: GoogleEventSyncState.SYNCED,
        syncReviewNeeded:
          tChanged && (existing.isPublicOnWebsite || existing.eventWorkflowState === EventWorkflowState.PUBLISHED)
            ? true
            : existing.syncReviewNeeded,
        inboundTimeChangedAt: tChanged ? new Date() : existing.inboundTimeChangedAt,
        googleSyncError: null,
      },
    });
    if (tChanged) {
      await applyEventTimingConsequences(existing.id, { actorUserId: null, reason: "inbound_sync" });
    }
    await prisma.eventSyncLog.create({
      data: {
        eventId: existing.id,
        calendarSourceId: source.id,
        direction: EventSyncDirection.PULL_FROM_GOOGLE,
        status: EventSyncLogStatus.OK,
        message: tChanged ? "Updated from Google" : "Pulled from Google (no time change)",
        detailJson: { googleEventId },
      },
    });
    return;
  }

  // New Google-only event
  const created = await prisma.campaignEvent.create({
    data: {
      slug: newSlug(),
      title: g.summary || "Imported event",
      eventType: CampaignEventType.OTHER,
      status: CampaignEventStatus.SCHEDULED,
      visibility: CampaignEventVisibility.INTERNAL,
      startAt: when.startAt,
      endAt: when.endAt,
      timezone: when.timezone,
      eventWorkflowState: EventWorkflowState.DRAFT,
      calendarSourceId: source.id,
      googleEventId,
      googleEtag: g.etag ?? null,
      lastGoogleSyncAt: new Date(),
      googleSyncState: GoogleEventSyncState.SYNCED,
      notes: g.description || null,
      syncReviewNeeded: true,
    },
  });
  await prisma.eventSyncLog.create({
    data: {
      eventId: created.id,
      calendarSourceId: source.id,
      direction: EventSyncDirection.PULL_FROM_GOOGLE,
      status: EventSyncLogStatus.OK,
      message: "Created draft from Google",
      detailJson: { googleEventId },
    },
  });
}

/**
 * Paged incremental sync; on 410, clears token and runs full re-list.
 */
export async function runIncrementalIngestForSource(sourceId: string) {
  const source = await prisma.calendarSource.findUnique({ where: { id: sourceId } });
  if (!source || !source.syncEnabled) {
    return { items: 0, mode: "skipped" as const };
  }
  if (!source.syncToken) {
    await fullListEstablishSyncToken(sourceId);
    return { items: 0, mode: "full_bootstrap" as const };
  }

  const cal = getCalendarApiForSource(source);
  const items: calendar_v3.Schema$Event[] = [];
  let nextPageToken: string | undefined;
  let nextSyncToken: string | undefined;
  const maxPages = 8;
  let guard = 0;
  do {
    try {
      const res = await cal.events.list({
        calendarId: source.externalCalendarId,
        maxResults: 250,
        singleEvents: true,
        syncToken: source.syncToken,
        pageToken: nextPageToken,
        showDeleted: true,
      });
      items.push(...(res.data.items ?? []));
      if (res.data.nextSyncToken) nextSyncToken = res.data.nextSyncToken;
      nextPageToken = res.data.nextPageToken ?? undefined;
    } catch (e) {
      const err = e as { code?: number; status?: number; message?: string };
      if (err.code === 410 || err.status === 410) {
        await prisma.calendarSource.update({ where: { id: sourceId }, data: { syncToken: null } });
        await fullListEstablishSyncToken(sourceId);
        return { items: 0, mode: "resync_410" as const };
      }
      throw e;
    }
    guard += 1;
    if (guard > maxPages) break;
  } while (nextPageToken);

  if (nextSyncToken) {
    await prisma.calendarSource.update({
      where: { id: sourceId },
      data: { syncToken: nextSyncToken, lastIncrementalAt: new Date() },
    });
  }
  for (const g of items) {
    if (g) await processInboundGoogleEvent(source, g);
  }
  return { items: items.length, mode: "incremental" as const };
}

/** Wrapper around `incrementalListEvents` (single request) for webhook speed. */
export async function runQuickIncrementalIngestForSource(sourceId: string) {
  const source = await prisma.calendarSource.findUnique({ where: { id: sourceId } });
  if (!source?.syncToken) {
    return runIncrementalIngestForSource(sourceId);
  }
  try {
    const { items, nextSyncToken, nextPageToken } = await incrementalListEvents(sourceId);
    if (nextSyncToken) {
      await prisma.calendarSource.update({
        where: { id: sourceId },
        data: { syncToken: nextSyncToken, lastIncrementalAt: new Date() },
      });
    }
    for (const g of items) {
      if (g) await processInboundGoogleEvent(source, g);
    }
    if (nextPageToken) {
      return runIncrementalIngestForSource(sourceId);
    }
    return { items: items.length, mode: "quick" as const };
  } catch (e) {
    const err = e as { code?: number; status?: number };
    if (err.code === 410 || err.status === 410) {
      await prisma.calendarSource.update({ where: { id: sourceId }, data: { syncToken: null } });
      await fullListEstablishSyncToken(sourceId);
    }
    throw e;
  }
}

export async function registerOrRenewWatchForSource(
  source: CalendarSource,
  webHookBase: string
): Promise<void> {
  const channelId = `ch-${source.id.slice(0, 8)}-${Date.now()}`;
  const address = `${webHookBase.replace(/\/$/, "")}/api/calendar/google/webhook`;
  const ch = await registerWatch(source.id, channelId, address, `tok-${source.id.slice(0, 6)}`);
  if (!ch.id || !ch.resourceId) return;
  const exp = ch.expiration ? new Date(parseInt(String(ch.expiration), 10)) : new Date(Date.now() + 6 * 24 * 3600 * 1000);
  const prev = await prisma.calendarWatchChannel.findFirst({ where: { calendarSourceId: source.id } });
  if (prev) {
    await prisma.calendarWatchChannel.delete({ where: { id: prev.id } });
  }
  await prisma.calendarWatchChannel.create({
    data: {
      calendarSourceId: source.id,
      channelId: ch.id!,
      resourceId: ch.resourceId!,
      token: (ch as { token?: string }).token ?? `tok-${source.id.slice(0, 6)}`,
      expiration: exp,
      lastRenewedAt: new Date(),
    },
  });
}
