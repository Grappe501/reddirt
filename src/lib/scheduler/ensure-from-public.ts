import { CampaignEventStatus, CampaignEventType, EventWorkflowState } from "@prisma/client";
import { getEventBySlug } from "@/content/events";
import type { EventItem, EventType } from "@/content/types";
import { prisma } from "@/lib/db";
import { getPublicCampaignEventBySlug } from "@/lib/calendar/public-events";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";
import { publicCampaignEventToEventItem } from "@/lib/events/calendar-to-movement-event";
import { parseEventInstant, stripPublicMarkdown } from "@/lib/format/eventDisplay";
import { FIELD_ATTENDANCE_VALUES } from "@/lib/scheduler/public-card-fields";

function campaignTypeFromMovement(type: EventType): CampaignEventType {
  switch (type) {
    case "Fairs and Festivals":
      return CampaignEventType.FESTIVAL;
    case "Volunteer Training":
      return CampaignEventType.TRAINING;
    case "Town Hall":
      return CampaignEventType.APPEARANCE;
    case "Listening Session":
    case "Community Conversation":
    case "House Gathering":
      return CampaignEventType.MEETING;
    default:
      return CampaignEventType.OTHER;
  }
}

async function resolveCountyIdFromSlug(countySlug: string | undefined): Promise<string | null> {
  const slug = countySlug?.trim();
  if (!slug) return null;
  const row = await prisma.county.findFirst({
    where: { slug },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function eventItemForSlug(slug: string): Promise<EventItem | null> {
  const curated = getEventBySlug(slug);
  if (curated) return curated;
  const published = await getPublicCampaignEventBySlug(slug);
  return published ? publicCampaignEventToEventItem(published) : null;
}

export async function ensureSchedulerEventFromPublicSlug(slug: string): Promise<string | null> {
  const existing = await prisma.campaignEvent.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing) return existing.id;

  const item = await eventItemForSlug(slug);
  if (!item) return null;

  const startAt = parseEventInstant(item.startsAt, item.timezone);
  const endAt = parseEventInstant(item.endsAt ?? item.startsAt, item.timezone);
  const attendance = item.fieldAttendance;
  const publicFieldAttendance =
    attendance && (FIELD_ATTENDANCE_VALUES as readonly string[]).includes(attendance) ? attendance : null;

  try {
    const created = await prisma.campaignEvent.create({
      data: {
        slug: item.slug,
        title: item.title.slice(0, 160),
        eventType: campaignTypeFromMovement(item.type),
        status: CampaignEventStatus.SCHEDULED,
        eventWorkflowState: EventWorkflowState.PUBLISHED,
        isPublicOnWebsite: true,
        startAt,
        endAt: endAt > startAt ? endAt : new Date(startAt.getTime() + 60 * 60 * 1000),
        timezone: item.timezone || PUBLIC_CALENDAR_DEFAULT_TZ,
        locationName: item.locationLabel?.slice(0, 160) || null,
        address: item.addressLine?.slice(0, 240) || null,
        city: item.city?.slice(0, 80) || null,
        publicContact: item.publicContact?.slice(0, 160) || null,
        countyId: await resolveCountyIdFromSlug(item.countySlug),
        publicSummary: stripPublicMarkdown(item.summary || item.title).slice(0, 800) || null,
        publicFieldAttendance,
        schedulerPublishedBy: "Public calendar",
        schedulerPublishedAt: new Date(),
      },
      select: { id: true },
    });
    return created.id;
  } catch {
    const raced = await prisma.campaignEvent.findUnique({
      where: { slug: item.slug },
      select: { id: true },
    });
    return raced?.id ?? null;
  }
}
