import { CampaignEventStatus, EventWorkflowState } from "@prisma/client";
import { events } from "@/content/events";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";
import { collapseRecurringSeriesToNextOccurrence } from "@/lib/events/collapse-recurring-series";
import { compareEventsForHub, parseEventInstant, resolveEventStatus } from "@/lib/format/eventDisplay";
import { prisma } from "@/lib/db";
import { isPrismaLiveDataUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import { cardFromRow, emptyCard, type SchedulerPublicCard } from "@/lib/scheduler/public-card-fields";

export type SchedulerQueueTab = "needs_publish" | "live" | "needs_info" | "archive";

export type SchedulerQueueRow = {
  id: string;
  slug: string;
  title: string;
  href: string;
  startAt: Date;
  locationName: string | null;
  countyName: string | null;
  isLive: boolean;
  isArchived: boolean;
  card: SchedulerPublicCard;
  publishedBy: string | null;
  publishedAt: Date | null;
  archivedBy: string | null;
  archivedAt: Date | null;
  archiveReason: string | null;
  archivePlace: string | null;
};

const SELECT = {
  id: true,
  slug: true,
  title: true,
  startAt: true,
  locationName: true,
  isPublicOnWebsite: true,
  eventWorkflowState: true,
  publicFieldAttendance: true,
  publicKellyRole: true,
  publicTabling: true,
  publicVolunteers: true,
  publicMobilize: true,
  publicMobilizeHref: true,
  publicVolunteerHref: true,
  schedulerNeedsMoreInfo: true,
  schedulerPublishedBy: true,
  schedulerPublishedAt: true,
  schedulerArchivedAt: true,
  schedulerArchivedBy: true,
  schedulerArchiveReason: true,
  schedulerArchivePlace: true,
  county: { select: { displayName: true } },
} as const;

function toRow(r: {
  id: string;
  slug: string;
  title: string;
  startAt: Date;
  locationName: string | null;
  isPublicOnWebsite: boolean;
  eventWorkflowState: EventWorkflowState;
  publicFieldAttendance: string | null;
  publicKellyRole: string | null;
  publicTabling: string | null;
  publicVolunteers: string | null;
  publicMobilize: string | null;
  publicMobilizeHref: string | null;
  publicVolunteerHref: string | null;
  schedulerNeedsMoreInfo: boolean;
  schedulerPublishedBy: string | null;
  schedulerPublishedAt: Date | null;
  schedulerArchivedAt: Date | null;
  schedulerArchivedBy: string | null;
  schedulerArchiveReason: string | null;
  schedulerArchivePlace: string | null;
  county: { displayName: string } | null;
}): SchedulerQueueRow {
  const card = cardFromRow(r);
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    href: `/scheduler/events/${r.id}`,
    startAt: r.startAt,
    locationName: r.locationName,
    countyName: r.county?.displayName ?? null,
    isLive: r.isPublicOnWebsite && r.eventWorkflowState === EventWorkflowState.PUBLISHED && !r.schedulerArchivedAt,
    isArchived: Boolean(r.schedulerArchivedAt),
    card,
    publishedBy: r.schedulerPublishedBy,
    publishedAt: r.schedulerPublishedAt,
    archivedBy: r.schedulerArchivedBy,
    archivedAt: r.schedulerArchivedAt,
    archiveReason: r.schedulerArchiveReason,
    archivePlace: r.schedulerArchivePlace,
  };
}

async function loadSchedulerLiveQueue(): Promise<SchedulerQueueRow[]> {
  const now = new Date();
  const calendarRows = await queryPublicCampaignEvents({}, { take: 200 });
  const merged = collapseRecurringSeriesToNextOccurrence(
    mergeMovementAndCalendarEvents(events, calendarRows)
      .filter((event) => resolveEventStatus(event, now) === "upcoming")
      .filter((event) => event.fieldAttendance !== "suggested" && event.fieldAttendance !== "unscheduled")
      .sort((a, b) => compareEventsForHub(a, b, now)),
  );
  const slugs = merged.map((event) => event.slug);
  const dbRows =
    slugs.length === 0
      ? []
      : await prisma.campaignEvent.findMany({
          where: { slug: { in: slugs } },
          select: SELECT,
        });
  const bySlug = new Map(dbRows.map((row) => [row.slug, row]));
  return merged.map((event) => {
    const db = bySlug.get(event.slug);
    if (db) return { ...toRow(db), isLive: true };
    return {
      id: `public:${event.slug}`,
      slug: event.slug,
      title: event.title,
      href: `/scheduler/open/${encodeURIComponent(event.slug)}`,
      startAt: parseEventInstant(event.startsAt, event.timezone),
      locationName: event.locationLabel ?? null,
      countyName: event.countySlug ? event.countySlug.replace(/-/g, " ") : null,
      isLive: true,
      isArchived: false,
      card: emptyCard(),
      publishedBy: "Public calendar",
      publishedAt: null,
      archivedBy: null,
      archivedAt: null,
      archiveReason: null,
      archivePlace: null,
    };
  });
}

export async function loadSchedulerQueue(tab: SchedulerQueueTab): Promise<SchedulerQueueRow[]> {
  if (tab === "live") {
    try {
      return await loadSchedulerLiveQueue();
    } catch (e) {
      if (isPrismaLiveDataUnavailable(e)) {
        logPrismaDatabaseUnavailable("loadSchedulerLiveQueue", e);
        return [];
      }
      throw e;
    }
  }
  try {
    const upcoming = { endAt: { gte: new Date() } };
    const rows = await prisma.campaignEvent.findMany({
      where: {
        ...upcoming,
        ...(tab === "archive"
          ? { schedulerArchivedAt: { not: null } }
          : {
              schedulerArchivedAt: null,
              status: { not: CampaignEventStatus.CANCELLED },
              ...(tab === "needs_info"
                ? { OR: [{ schedulerNeedsMoreInfo: true }, { publicFieldAttendance: "caution" }] }
                : {
                    OR: [
                      { isPublicOnWebsite: false },
                      { eventWorkflowState: { not: EventWorkflowState.PUBLISHED } },
                    ],
                  }),
            }),
      },
      select: SELECT,
      orderBy: { startAt: "asc" },
      take: 200,
    });
    return rows.map(toRow);
  } catch (e) {
    if (isPrismaLiveDataUnavailable(e)) {
      logPrismaDatabaseUnavailable("loadSchedulerQueue", e);
      return [];
    }
    throw e;
  }
}

export async function loadSchedulerEvent(id: string) {
  try {
    return await prisma.campaignEvent.findUnique({
      where: { id },
      select: {
        ...SELECT,
        publicSummary: true,
        address: true,
        timezone: true,
        endAt: true,
        eventType: true,
      },
    });
  } catch (e) {
    if (isPrismaLiveDataUnavailable(e)) {
      logPrismaDatabaseUnavailable("loadSchedulerEvent", e);
      return null;
    }
    throw e;
  }
}
