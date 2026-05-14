import type { LocalCoverageRequest } from "@prisma/client";
import {
  CalendarAlertChannel,
  CalendarAlertSeverity,
  CalendarAlertStatus,
  CalendarSourceType,
  EventWorkflowState,
  GoogleEventSyncState,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { loadTravelCalendarItems } from "./load-travel-calendar-data";
import { loadPublicScheduleShadowCalendarItems } from "./public-schedule-shadow-items";
import { alertsToDto, mergeKellyCockpitData, sortApprovalQueue, todayTomorrowWeekKeys } from "./kelly-cockpit-merge";
import type { CalendarAlertDto, EnrichedCalendarItem, KellyGoogleCockpitOverlay } from "./kelly-cockpit-types";
import { dedupeKellyCockpitDisplayItems, enrichedKellyLaneOrphans } from "./kelly-calendar-dedupe";
import type { CampaignCalendarItem } from "./campaign-calendar-item";

export type KellyCockpitBundle = {
  enriched: EnrichedCalendarItem[];
  alerts: CalendarAlertDto[];
  hasDb: boolean;
  dataSourceMode: "db_backed" | "mixed" | "staged_fallback";
  dataSourceNote: string;
  dbError?: string;
  todayYmd: string;
  tomorrowYmd: string;
  weekEndYmd: string;
};

async function bootstrapConflictAndUrgencyAlerts(items: EnrichedCalendarItem[]): Promise<void> {
  const caps = 80;
  let n = 0;
  for (const it of items) {
    if (n >= caps) break;
    if (it.calendarStatus === "conflict") {
      const dedupeKey = `conflict-${it.id}`;
      await prisma.calendarAlert.upsert({
        where: { dedupeKey },
        create: {
          calendarItemId: it.id,
          alertType: "CALENDAR_CONFLICT",
          severity: CalendarAlertSeverity.HIGH,
          title: "Schedule conflict",
          body: `Overlapping or conflicting block: ${it.title}`,
          channel: CalendarAlertChannel.IN_APP,
          status: CalendarAlertStatus.PENDING,
          dedupeKey,
        },
        update: { status: CalendarAlertStatus.PENDING },
      });
      n++;
    }
    const hours = (new Date(it.start).getTime() - Date.now()) / 3600000;
    if (it.kellyApprovalState === "needs_kelly_review" && hours > 0 && hours <= 72) {
      const day = it.start.slice(0, 10);
      const dedupeKey = `kelly-urgent-${it.id}-${day}`;
      await prisma.calendarAlert.upsert({
        where: { dedupeKey },
        create: {
          calendarItemId: it.id,
          alertType: "KELLY_APPROVAL_URGENT",
          severity: CalendarAlertSeverity.CRITICAL,
          title: "Needs Kelly approval (within 72h)",
          body: it.title,
          dueAt: new Date(it.start),
          channel: CalendarAlertChannel.IN_APP,
          status: CalendarAlertStatus.PENDING,
          dedupeKey,
        },
        update: {},
      });
      n++;
    }
  }
}

async function attachKellyGoogleOverlays(
  items: EnrichedCalendarItem[],
  promotions: { calendarItemId: string; campaignEventId: string }[],
): Promise<EnrichedCalendarItem[]> {
  const itemToEvent = new Map(promotions.map((p) => [p.calendarItemId, p.campaignEventId]));
  const campaignIds = [...new Set(promotions.map((p) => p.campaignEventId))];
  if (campaignIds.length === 0) return items;

  const [events, records] = await Promise.all([
    prisma.campaignEvent.findMany({
      where: { id: { in: campaignIds } },
      select: {
        id: true,
        eventWorkflowState: true,
        googleSyncState: true,
        googleSyncError: true,
        lastGoogleSyncAt: true,
        googleEventId: true,
        syncReviewNeeded: true,
        calendarSourceId: true,
        calendarSource: { select: { sourceType: true, externalCalendarId: true, id: true } },
      },
    }),
    prisma.googleCalendarEventRecord.findMany({
      where: { campaignEventId: { in: campaignIds } },
      orderBy: { updatedAt: "desc" },
      select: {
        campaignEventId: true,
        htmlLink: true,
        googleEventId: true,
        iCalUID: true,
        calendarSourceId: true,
      },
    }),
  ]);
  const evById = new Map(events.map((e) => [e.id, e]));
  const recByCampaign = new Map<string, (typeof records)[number]>();
  for (const r of records) {
    const cid = r.campaignEventId;
    if (!cid || recByCampaign.has(cid)) continue;
    recByCampaign.set(cid, r);
  }

  function laneFor(st: CalendarSourceType | undefined): KellyGoogleCockpitOverlay["lane"] {
    if (st === CalendarSourceType.KELLY_GOOGLE_TENTATIVE) return "tentative";
    if (st === CalendarSourceType.KELLY_GOOGLE_CONFIRMED) return "confirmed";
    if (st) return "other";
    return "none";
  }

  function buildOpenLink(
    ev: (typeof events)[number],
    rec: (typeof records)[number] | undefined,
  ): string | null {
    if (rec?.htmlLink) return rec.htmlLink;
    const gid = ev.googleEventId;
    const ext = ev.calendarSource?.externalCalendarId;
    if (!gid || !ext) return null;
    try {
      const raw = `${gid} ${ext}`;
      const b64 = Buffer.from(raw)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      return `https://www.google.com/calendar/event?eid=${encodeURIComponent(b64)}`;
    } catch {
      return null;
    }
  }

  function labels(ev: (typeof events)[number], lane: KellyGoogleCockpitOverlay["lane"]) {
    const st = ev.googleSyncState;
    let staffExact = "";
    let kellyGentle = "";
    if (ev.syncReviewNeeded && st === GoogleEventSyncState.CONFLICT) {
      staffExact = "CONFLICT";
      kellyGentle = "Needs staff review";
    } else if (st === GoogleEventSyncState.CONFLICT) {
      staffExact = "CONFLICT";
      kellyGentle = "Needs staff review";
    } else if (st === GoogleEventSyncState.ERROR) {
      staffExact = "ERROR";
      kellyGentle = "Needs staff sync";
    } else if (!ev.googleEventId) {
      staffExact = "PROMOTION_NEEDED";
      kellyGentle = "Promotion needed";
    } else if (st === GoogleEventSyncState.SYNCED && lane === "tentative") {
      staffExact = "SYNCED_TENTATIVE";
      kellyGentle = "Synced to Tentative";
    } else if (st === GoogleEventSyncState.SYNCED && lane === "confirmed") {
      staffExact = "SYNCED_CONFIRMED";
      kellyGentle = "Synced to Confirmed";
    } else if (st === GoogleEventSyncState.SYNCED) {
      staffExact = "SYNCED";
      kellyGentle = "Synced";
    } else {
      staffExact = String(st);
      kellyGentle = "Needs staff sync";
    }
    return { staffExact, kellyGentle };
  }

  return items.map((it) => {
    const ceId = itemToEvent.get(it.id);
    if (!ceId) return it;
    const ev = evById.get(ceId);
    if (!ev) return it;
    const lane = laneFor(ev.calendarSource?.sourceType);
    const rec = recByCampaign.get(ceId);
    const { staffExact, kellyGentle } = labels(ev, lane);
    const overlay: KellyGoogleCockpitOverlay = {
      campaignEventId: ceId,
      eventWorkflowState: ev.eventWorkflowState,
      calendarSourceId: ev.calendarSourceId,
      externalCalendarId: ev.calendarSource?.externalCalendarId ?? null,
      googleEventId: ev.googleEventId,
      iCalUID: rec?.iCalUID ?? null,
      lane,
      googleSyncState: ev.googleSyncState,
      syncReviewNeeded: ev.syncReviewNeeded,
      lastGoogleSyncAt: ev.lastGoogleSyncAt?.toISOString() ?? null,
      googleSyncError: ev.googleSyncError,
      openInGoogleUrl: buildOpenLink(ev, rec),
      staffExactStatus: staffExact,
      kellyGentleStatus: kellyGentle,
    };
    return { ...it, kellyGoogle: overlay };
  });
}

function campaignEventToCalendarItem(ev: {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  locationName: string | null;
  description: string | null;
  eventWorkflowState: EventWorkflowState;
  county: { displayName: string } | null;
  commsStateJson: unknown;
  status: string;
}): CampaignCalendarItem {
  const meta = (ev.commsStateJson && typeof ev.commsStateJson === "object" ? ev.commsStateJson : {}) as {
    kellyCockpit?: {
      stagedItemId?: string;
      sourceId?: string | null;
      source?: CampaignCalendarItem["source"];
      calendarStatus?: CampaignCalendarItem["calendarStatus"];
      publishStatus?: CampaignCalendarItem["publishStatus"];
      eventType?: CampaignCalendarItem["eventType"];
      routeCluster?: string | null;
      overnightRequired?: boolean;
      overnightCity?: string | null;
      countyTouchCounts?: boolean;
      verificationConfidence?: number;
      drillDown?: CampaignCalendarItem["drillDown"];
    };
  };
  const k = meta.kellyCockpit;
  const calendarStatus: CampaignCalendarItem["calendarStatus"] =
    k?.calendarStatus ??
    (ev.eventWorkflowState === EventWorkflowState.APPROVED ||
    ev.eventWorkflowState === EventWorkflowState.PUBLISHED ||
    ev.eventWorkflowState === EventWorkflowState.COMPLETED
      ? "confirmed"
      : ev.eventWorkflowState === EventWorkflowState.CANCELED
        ? "declined"
        : "tentative");
  return {
    id: k?.stagedItemId ?? `ce:${ev.id}`,
    source: "burt_database",
    sourceId: ev.id,
    title: ev.title,
    start: ev.startAt.toISOString(),
    end: ev.endAt.toISOString(),
    allDay: false,
    county: ev.county?.displayName,
    location: ev.locationName ?? undefined,
    eventType: k?.eventType ?? "campaign_event",
    calendarStatus,
    publishStatus: k?.publishStatus ?? "private_admin_only",
    countyTouchCounts: k?.countyTouchCounts ?? false,
    routeCluster: k?.routeCluster ?? undefined,
    overnightRequired: k?.overnightRequired,
    overnightCity: k?.overnightCity ?? undefined,
    verificationConfidence: k?.verificationConfidence ?? 1,
    notes: ev.description ?? undefined,
    drillDown: {
      ...k?.drillDown,
      matchedDb: { kind: "CampaignEvent", id: ev.id, matchReason: "DB-backed Kelly cockpit source" },
    },
  };
}

export async function loadKellyCockpitBundle(): Promise<KellyCockpitBundle> {
  const { todayYmd, tomorrowYmd, weekEndYmd } = todayTomorrowWeekKeys();
  const travel = loadTravelCalendarItems().filter((i) => !i.excludeFromKellyCockpit);
  let shadows: CampaignCalendarItem[] = [];
  try {
    shadows = await loadPublicScheduleShadowCalendarItems();
  } catch {
    shadows = [];
  }
  const items = [...travel, ...shadows];
  try {
    const ids = items.map((i) => i.id);
    const [promotions, promotedEvents, unpromotedEvents] = await Promise.all([
      prisma.kellyCalendarPromotion.findMany({
        where: { calendarItemId: { in: ids } },
      }),
      prisma.campaignEvent.findMany({
        where: { kellyCalendarPromotions: { some: { calendarItemId: { in: ids } } } },
        include: { county: { select: { displayName: true } } },
        orderBy: { startAt: "asc" },
      }),
      prisma.campaignEvent.findMany({
        where: {
          kellyCalendarPromotions: { none: {} },
          calendarSource: {
            sourceType: { in: [CalendarSourceType.KELLY_GOOGLE_TENTATIVE, CalendarSourceType.KELLY_GOOGLE_CONFIRMED] },
          },
        },
        include: { county: { select: { displayName: true } } },
        orderBy: { startAt: "asc" },
        take: 400,
      }),
    ]);
    const promotedIds = new Set(promotions.map((p) => p.calendarItemId));
    const dbItems = promotedEvents.map(campaignEventToCalendarItem);
    const unpromotedJsonItems = items.filter((item) => !promotedIds.has(item.id));
    const dbOrphanItems = unpromotedEvents.map(campaignEventToCalendarItem);
    const sourceItems = [...dbItems, ...dbOrphanItems, ...unpromotedJsonItems];
    const sourceIds = sourceItems.map((i) => i.id);

    const [decisions, locals] = await Promise.all([
      prisma.kellyCalendarDecision.findMany({
        where: { calendarItemId: { in: sourceIds } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.localCoverageRequest.findMany({
        where: { calendarItemId: { in: sourceIds } },
      }),
    ]);
    const localByItem = new Map<string, LocalCoverageRequest[]>();
    for (const r of locals) {
      const arr = localByItem.get(r.calendarItemId) ?? [];
      arr.push(r);
      localByItem.set(r.calendarItemId, arr);
    }
    let enriched = mergeKellyCockpitData(sourceItems, decisions, localByItem, promotedIds);
    enriched = sortApprovalQueue(enriched);
    const orphans = await enrichedKellyLaneOrphans().catch(() => [] as EnrichedCalendarItem[]);
    enriched = [...enriched, ...orphans];
    const promotionPairs = [
      ...promotions.map((p) => ({ calendarItemId: p.calendarItemId, campaignEventId: p.campaignEventId })),
      ...dbOrphanItems.flatMap((it) =>
        it.sourceId ? [{ calendarItemId: it.id, campaignEventId: it.sourceId }] : [] as { calendarItemId: string; campaignEventId: string }[],
      ),
      ...orphans.flatMap((o) => {
        const m = o.drillDown?.matchedDb;
        if (m?.kind === "CampaignEvent" && m.id) return [{ calendarItemId: o.id, campaignEventId: m.id }];
        return [] as { calendarItemId: string; campaignEventId: string }[];
      }),
    ];
    enriched = await attachKellyGoogleOverlays(enriched, promotionPairs);
    enriched = dedupeKellyCockpitDisplayItems(enriched);
    await bootstrapConflictAndUrgencyAlerts(enriched).catch(() => {});
    const refreshed = await prisma.calendarAlert.findMany({
      where: { calendarItemId: { in: sourceIds }, status: { in: [CalendarAlertStatus.PENDING, CalendarAlertStatus.SNOOZED] } },
      orderBy: { createdAt: "desc" },
      take: 400,
    });
    const dataSourceMode: KellyCockpitBundle["dataSourceMode"] =
      dbItems.length > 0 && unpromotedJsonItems.length === 0 ? "db_backed" : dbItems.length > 0 ? "mixed" : "staged_fallback";
    return {
      enriched,
      alerts: alertsToDto(refreshed),
      hasDb: true,
      dataSourceMode,
      dataSourceNote:
        dataSourceMode === "db_backed"
          ? "CampaignEvent is the operational source; staged JSON is import history only."
          : dataSourceMode === "mixed"
            ? `${dbItems.length} DB-backed rows plus ${unpromotedJsonItems.length} staged import rows.`
            : "No promoted CampaignEvent rows found; decisions may not persist to production DB.",
      todayYmd,
      tomorrowYmd,
      weekEndYmd,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const promoted = new Set<string>();
    const localByItem = new Map();
    const enriched = sortApprovalQueue(mergeKellyCockpitData(items, [], localByItem, promoted));
    return {
      enriched,
      alerts: [],
      hasDb: false,
      dataSourceMode: "staged_fallback",
      dataSourceNote: "Database unavailable; using staged calendar JSON fallback only.",
      dbError: msg,
      todayYmd,
      tomorrowYmd,
      weekEndYmd,
    };
  }
}
