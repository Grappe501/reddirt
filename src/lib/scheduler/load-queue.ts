import { CampaignEventStatus, EventWorkflowState } from "@prisma/client";
import { prisma } from "@/lib/db";
import { isPrismaLiveDataUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import { cardFromRow, type SchedulerPublicCard } from "@/lib/scheduler/public-card-fields";

export type SchedulerQueueTab = "needs_publish" | "live" | "needs_info";

export type SchedulerQueueRow = {
  id: string;
  slug: string;
  title: string;
  startAt: Date;
  locationName: string | null;
  countyName: string | null;
  isLive: boolean;
  card: SchedulerPublicCard;
  publishedBy: string | null;
  publishedAt: Date | null;
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
  county: { displayName: string } | null;
}): SchedulerQueueRow {
  const card = cardFromRow(r);
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    startAt: r.startAt,
    locationName: r.locationName,
    countyName: r.county?.displayName ?? null,
    isLive: r.isPublicOnWebsite && r.eventWorkflowState === EventWorkflowState.PUBLISHED,
    card,
    publishedBy: r.schedulerPublishedBy,
    publishedAt: r.schedulerPublishedAt,
  };
}

export async function loadSchedulerQueue(tab: SchedulerQueueTab): Promise<SchedulerQueueRow[]> {
  try {
    const rows = await prisma.campaignEvent.findMany({
      where: {
        status: { not: CampaignEventStatus.CANCELLED },
        ...(tab === "live"
          ? { isPublicOnWebsite: true, eventWorkflowState: EventWorkflowState.PUBLISHED }
          : tab === "needs_info"
            ? { OR: [{ schedulerNeedsMoreInfo: true }, { publicFieldAttendance: "caution" }] }
            : {
                OR: [
                  { isPublicOnWebsite: false },
                  { eventWorkflowState: { not: EventWorkflowState.PUBLISHED } },
                ],
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
