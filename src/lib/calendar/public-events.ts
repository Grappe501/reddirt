import {
  CampaignEventAttendanceType,
  CampaignEventStatus,
  CampaignEventType,
  EventWorkflowState,
  type Prisma,
} from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { prisma } from "@/lib/db";
import {
  type PublicCampaignEvent,
  type PublicEventListFilters,
  PUBLIC_CALENDAR_DEFAULT_TZ,
  publicCampaignEventSelect,
} from "@/lib/calendar/public-event-types";
import {
  findInstantOnYmd,
  formatPublicEventType,
  inferPublicVenueMode,
  isSameCalendarMonthInZone,
  ymdInTimeZone,
} from "@/lib/calendar/public-event-format";
import { isPrismaDatabaseUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import { attendanceCtaLabel } from "@/lib/events/public-event-kind";

const JOIN = () => getJoinCampaignHref();
const PUBLIC_CALENDAR_SNAPSHOT_PATH = path.join(
  process.cwd(),
  "data/calendar-command-center/public-campaign-calendar.snapshot.json"
);
const ELECTION_DAY_YMD = "2026-11-03";

type SnapshotFile = {
  events?: Array<{
    id: string;
    slug: string;
    title: string;
    publicSummary: string | null;
    startAt: string;
    endAt: string;
    timezone: string;
    locationName: string | null;
    address: string | null;
    eventType: CampaignEventType;
    county: { displayName: string; slug: string } | null;
  }>;
};

/**
 * CampaignOS gating: published workflow, explicit public flag, not operationally canceled.
 */
export function whereLivePublicOnWebsite(): Prisma.CampaignEventWhereInput {
  return {
    isPublicOnWebsite: true,
    isTravelLeg: false,
    eventWorkflowState: EventWorkflowState.PUBLISHED,
    status: { notIn: [CampaignEventStatus.CANCELLED, CampaignEventStatus.TENTATIVE, CampaignEventStatus.DRAFT] },
  };
}

function snapshotToPublicDto(
  row: NonNullable<SnapshotFile["events"]>[number],
  joinHref: string
): PublicCampaignEvent {
  const detailHref = `/events/${row.slug}`;
  const startAt = new Date(row.startAt);
  const endAt = new Date(row.endAt);
  const venueMode = inferPublicVenueMode({
    eventType: row.eventType,
    locationName: row.locationName,
    address: row.address,
  });
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    publicSummary: row.publicSummary,
    startAt,
    endAt,
    timezone: row.timezone,
    locationName: row.locationName,
    address: row.address,
    city: null,
    attendanceType: CampaignEventAttendanceType.CAMPAIGN_APPEARANCE,
    eventType: row.eventType,
    eventTypeLabel: formatPublicEventType(row.eventType),
    publicKindLabel: formatPublicEventType(row.eventType),
    county: row.county,
    venueMode,
    publicTags: [],
    detailHref,
    joinCampaignHref: joinHref,
    primaryAction: { label: attendanceCtaLabel(CampaignEventAttendanceType.CAMPAIGN_APPEARANCE), href: detailHref },
    secondaryAction: { label: "Volunteer", href: joinHref },
    publicFieldAttendance: null,
    publicKellyRole: null,
    publicTabling: null,
    publicVolunteers: null,
    publicMobilize: null,
    publicMobilizeHref: null,
    publicVolunteerHref: null,
  };
}

function loadSnapshotPublicEvents(): PublicCampaignEvent[] {
  try {
    const raw = readFileSync(PUBLIC_CALENDAR_SNAPSHOT_PATH, "utf8");
    const data = JSON.parse(raw) as SnapshotFile;
    const joinHref = JOIN();
    return (data.events ?? []).map((e) => snapshotToPublicDto(e, joinHref));
  } catch {
    return [];
  }
}

function mergeDbAndSnapshot(db: PublicCampaignEvent[], snapshot: PublicCampaignEvent[]): PublicCampaignEvent[] {
  const seen = new Set(
    db.map((e) => `${ymdInTimeZone(e.startAt, e.timezone)}|${e.title.trim().toLowerCase()}`)
  );
  const merged = [...db];
  for (const e of snapshot) {
    const key = `${ymdInTimeZone(e.startAt, e.timezone)}|${e.title.trim().toLowerCase()}`;
    if (seen.has(key) || merged.some((m) => m.slug === e.slug)) continue;
    seen.add(key);
    merged.push(e);
  }
  return merged.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

function toPublicDto(
  row: {
    id: string;
    slug: string;
    title: string;
    publicSummary: string | null;
    startAt: Date;
    endAt: Date;
    timezone: string;
    locationName: string | null;
    address: string | null;
    city?: string | null;
    publicContact?: string | null;
    publicSocialGraphicUrl?: string | null;
    attendanceType?: CampaignEventAttendanceType;
    eventType: CampaignEventType;
    county: { displayName: string; slug: string } | null;
    publicFieldAttendance?: string | null;
    publicKellyRole?: string | null;
    publicTabling?: string | null;
    publicVolunteers?: string | null;
    publicMobilize?: string | null;
    publicMobilizeHref?: string | null;
    publicVolunteerHref?: string | null;
  },
  joinHref: string
): PublicCampaignEvent {
  const detailHref = `/events/${row.slug}`;
  const attendanceType = row.attendanceType ?? CampaignEventAttendanceType.CAMPAIGN_APPEARANCE;
  const venueMode = inferPublicVenueMode({
    eventType: row.eventType,
    locationName: row.locationName,
    address: row.address,
  });
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    publicSummary: row.publicSummary,
    startAt: row.startAt,
    endAt: row.endAt,
    timezone: row.timezone,
    locationName: row.locationName,
    address: row.address,
    city: row.city ?? null,
    publicContact: row.publicContact ?? null,
    publicSocialGraphicUrl: row.publicSocialGraphicUrl ?? null,
    attendanceType,
    eventType: row.eventType,
    eventTypeLabel: formatPublicEventType(row.eventType),
    publicKindLabel: formatPublicEventType(row.eventType),
    county: row.county,
    venueMode,
    publicTags: [],
    detailHref,
    joinCampaignHref: joinHref,
    primaryAction: { label: attendanceCtaLabel(attendanceType), href: detailHref },
    secondaryAction: { label: "Volunteer", href: joinHref },
    publicFieldAttendance: row.publicFieldAttendance ?? null,
    publicKellyRole: row.publicKellyRole ?? null,
    publicTabling: row.publicTabling ?? null,
    publicVolunteers: row.publicVolunteers ?? null,
    publicMobilize: row.publicMobilize ?? null,
    publicMobilizeHref: row.publicMobilizeHref ?? null,
    publicVolunteerHref: row.publicVolunteerHref ?? null,
  };
}

function ymdNowDefaultTz(): string {
  return ymdInTimeZone(new Date(), PUBLIC_CALENDAR_DEFAULT_TZ);
}

function addCalendarDays(ymd: string, days: number): string {
  const t = findInstantOnYmd(ymd, PUBLIC_CALENDAR_DEFAULT_TZ);
  return ymdInTimeZone(new Date(t.getTime() + days * 24 * 60 * 60 * 1000), PUBLIC_CALENDAR_DEFAULT_TZ);
}

/**
 * Prisma time-window: generous overlap to reduce over-fetching; final truth is in JS filters.
 */
function prismaWindowForFilters(filters: PublicEventListFilters): Prisma.CampaignEventWhereInput {
  const now = new Date();
  if (filters.range === "all") {
    return {};
  }
  if (filters.monthYear) {
    const { year, month } = filters.monthYear;
    // Month bounds in UTC with padding (overlap filter in JS to event’s timezone for display month).
    const start = new Date(Date.UTC(year, month - 1, 1) - 14 * 24 * 60 * 60 * 1000);
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999) + 14 * 24 * 60 * 60 * 1000);
    return { startAt: { lte: end }, endAt: { gte: start } };
  }
  if (filters.dateFrom || filters.dateTo) {
    return {
      endAt: { gte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    };
  }
  if (filters.range === "this_week" || filters.range === "this_month") {
    return { endAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } };
  }
  return { endAt: { gte: now } };
}

function rowPassesFilters(
  row: {
    startAt: Date;
    endAt: Date;
    timezone: string;
    eventType: CampaignEventType;
    locationName: string | null;
    address: string | null;
    county: { slug: string } | null;
  },
  filters: PublicEventListFilters
): boolean {
  const now = new Date();
  if (filters.range !== "all" && !filters.monthYear && row.endAt < now) return false;

  if (filters.eventType && row.eventType !== filters.eventType) return false;
  if (filters.countySlug && row.county?.slug !== filters.countySlug) return false;

  const startYmd = ymdInTimeZone(row.startAt, PUBLIC_CALENDAR_DEFAULT_TZ);
  const todayYmd = ymdNowDefaultTz();

  if (filters.dateFrom) {
    if (startYmd < filters.dateFrom) return false;
  }
  if (filters.dateTo) {
    if (startYmd > filters.dateTo) return false;
  }

  if (filters.range === "this_week") {
    const weekEnd = addCalendarDays(todayYmd, 6);
    if (startYmd < todayYmd || startYmd > weekEnd) return false;
  } else if (filters.range === "this_month") {
    const t = ymdNowDefaultTz();
    const monthPrefix = t.slice(0, 7);
    if (startYmd < `${monthPrefix}-01` || startYmd > lastDayYmdForMonthPrefix(monthPrefix)) return false;
  } else if (filters.range && filters.range !== "all_upcoming" && !filters.dateFrom) {
    // other presets handled by dateFrom/To
  }

  if (filters.monthYear) {
    const { year, month } = filters.monthYear;
    if (!isSameCalendarMonthInZone(row.startAt, PUBLIC_CALENDAR_DEFAULT_TZ, year, month)) {
      return false;
    }
  }

  if (filters.venueMode && filters.venueMode !== "all") {
    const v = inferPublicVenueMode({
      eventType: row.eventType,
      locationName: row.locationName,
      address: row.address,
    });
    if (v !== filters.venueMode) return false;
  }

  return true;
}

function lastDayYmdForMonthPrefix(ym: string): string {
  const [y, m] = ym.split("-").map((x) => parseInt(x, 10));
  const last = new Date(Date.UTC(y, m, 0, 12, 0, 0));
  return ymdInTimeZone(last, "UTC");
}

/**
 * List public, safe events with filters. Campaign gating is always applied in Prisma.
 */
export async function queryPublicCampaignEvents(
  filters: PublicEventListFilters = {},
  opts: { take: number; skip?: number } = { take: 120 }
): Promise<PublicCampaignEvent[]> {
  try {
    const joinHref = JOIN();
    const andParts: Prisma.CampaignEventWhereInput[] = [whereLivePublicOnWebsite(), prismaWindowForFilters(filters)];

    if (filters.countySlug) {
      andParts.push({ county: { slug: filters.countySlug } });
    }
    if (filters.eventType) {
      andParts.push({ eventType: filters.eventType });
    }

    const rows = await prisma.campaignEvent.findMany({
      where: { AND: andParts },
      orderBy: { startAt: "asc" },
      take: 500,
      skip: opts.skip ?? 0,
      select: publicCampaignEventSelect,
    });

    const mapped = rows
      .filter((r) => rowPassesFilters(r, filters))
      .map((r) => toPublicDto(r, joinHref));

    const snapshot = loadSnapshotPublicEvents().filter((e) => {
      const startYmd = ymdInTimeZone(e.startAt, e.timezone);
      if (startYmd > ELECTION_DAY_YMD) return false;
      return rowPassesFilters(
        {
          startAt: e.startAt,
          endAt: e.endAt,
          timezone: e.timezone,
          eventType: e.eventType,
          locationName: e.locationName,
          address: e.address,
          county: e.county,
        },
        filters
      );
    });

    return mergeDbAndSnapshot(mapped, snapshot).slice(0, opts.take);
  } catch (e) {
    if (isPrismaDatabaseUnavailable(e)) {
      logPrismaDatabaseUnavailable("queryPublicCampaignEvents", e);
      const snapshot = loadSnapshotPublicEvents().filter((ev) =>
        rowPassesFilters(
          {
            startAt: ev.startAt,
            endAt: ev.endAt,
            timezone: ev.timezone,
            eventType: ev.eventType,
            locationName: ev.locationName,
            address: ev.address,
            county: ev.county,
          },
          filters
        )
      );
      return snapshot.slice(0, opts.take);
    } else {
      console.error("[queryPublicCampaignEvents]", e);
    }
    return [];
  }
}

export async function listUpcomingPublicCampaignEventsForHomepage(take: number) {
  return queryPublicCampaignEvents({ range: "all_upcoming" }, { take });
}

export async function listUpcomingPublicCampaignEventsForCountySlug(countySlug: string, take: number) {
  return queryPublicCampaignEvents({ range: "all_upcoming", countySlug }, { take });
}

export async function listUpcomingPublicAppearances(take: number) {
  return queryPublicCampaignEvents(
    { range: "all_upcoming", eventType: CampaignEventType.APPEARANCE },
    { take }
  );
}

/** @deprecated use `listUpcomingPublicCampaignEventsForHomepage` */
export async function listPublicCampaignEvents(take: number) {
  return listUpcomingPublicCampaignEventsForHomepage(take);
}

export async function getPublicCampaignEventBySlug(slug: string): Promise<PublicCampaignEvent | null> {
  const joinHref = JOIN();
  const row = await prisma.campaignEvent.findFirst({
    where: { ...whereLivePublicOnWebsite(), slug },
    select: publicCampaignEventSelect,
  });
  if (row) return toPublicDto(row, joinHref);
  return loadSnapshotPublicEvents().find((e) => e.slug === slug) ?? null;
}

export async function getPublicCanceledTombstoneBySlug(slug: string): Promise<{ title: string; slug: string } | null> {
  const row = await prisma.campaignEvent.findFirst({
    where: {
      slug,
      isPublicOnWebsite: true,
      eventWorkflowState: EventWorkflowState.CANCELED,
    },
    select: { title: true, slug: true },
  });
  return row;
}

export async function resolvePublicEventPageBySlug(
  slug: string
): Promise<
  { kind: "live"; event: PublicCampaignEvent } | { kind: "canceled"; title: string; slug: string } | null
> {
  const live = await getPublicCampaignEventBySlug(slug);
  if (live) return { kind: "live", event: live };
  const t = await getPublicCanceledTombstoneBySlug(slug);
  if (t) return { kind: "canceled", title: t.title, slug: t.slug };
  return null;
}

export async function resolvePublicEventTitleForMetadata(slug: string): Promise<string | null> {
  const r = await resolvePublicEventPageBySlug(slug);
  if (!r) return null;
  if (r.kind === "live") return r.event.title;
  return r.title;
}
