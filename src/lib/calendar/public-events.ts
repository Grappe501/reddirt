import {
  CampaignEventStatus,
  CampaignEventType,
  EventWorkflowState,
  type Prisma,
} from "@prisma/client";
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

const JOIN = () => getJoinCampaignHref();

/**
 * CampaignOS gating: published workflow, explicit public flag, not operationally canceled.
 */
export function whereLivePublicOnWebsite(): Prisma.CampaignEventWhereInput {
  return {
    isPublicOnWebsite: true,
    eventWorkflowState: EventWorkflowState.PUBLISHED,
    status: { not: CampaignEventStatus.CANCELLED },
  };
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
    eventType: CampaignEventType;
    county: { displayName: string; slug: string } | null;
  },
  joinHref: string
): PublicCampaignEvent {
  const detailHref = `/campaign-calendar/${row.slug}`;
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
    eventType: row.eventType,
    eventTypeLabel: formatPublicEventType(row.eventType),
    county: row.county,
    venueMode,
    publicTags: [],
    detailHref,
    joinCampaignHref: joinHref,
    primaryAction: { label: "Details & RSVP", href: detailHref },
    secondaryAction: { label: "Volunteer", href: joinHref },
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
  if (!filters.monthYear && row.endAt < now) return false;

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
    return mapped.slice(0, opts.take);
  } catch (e) {
    if (isPrismaDatabaseUnavailable(e)) {
      logPrismaDatabaseUnavailable("queryPublicCampaignEvents", e);
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
  if (!row) return null;
  return toPublicDto(row, joinHref);
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
