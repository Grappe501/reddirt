import type { CampaignEventType } from "@prisma/client";
import { getMovementRegionForCountySlug, STATEWIDE_EVENT_REGION } from "@/content/arkansas-movement-regions";
import type { EventItem, EventType } from "@/content/types";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { centroidForMovementRegionLabel } from "@/lib/events/movement-region-centroids";

/** Map CampaignOS types into movement /events filter buckets (approximate but useful). */
export function campaignEventTypeToMovementEventType(t: CampaignEventType): EventType {
  switch (t) {
    case "TRAINING":
    case "ORIENTATION":
      return "Volunteer Training";
    case "FESTIVAL":
      return "Fairs and Festivals";
    case "RALLY":
    case "APPEARANCE":
    case "PRESS":
      return "Town Hall";
    case "MEETING":
      return "Community Conversation";
    case "CANVASS":
      return "Community Conversation";
    case "PHONE_BANK":
      return "Community Conversation";
    case "FUNDRAISER":
      return "Town Hall";
    case "DEADLINE":
      return "Direct Democracy Briefing";
    default:
      return "Community Conversation";
  }
}

function regionLabelForPublicEvent(ev: PublicCampaignEvent): string {
  if (ev.county?.slug) {
    return getMovementRegionForCountySlug(ev.county.slug) ?? STATEWIDE_EVENT_REGION;
  }
  return STATEWIDE_EVENT_REGION;
}

function mapPinForPublicEvent(ev: PublicCampaignEvent): {
  lat: number;
  lng: number;
  quality: NonNullable<EventItem["mapPinQuality"]>;
} {
  const region = regionLabelForPublicEvent(ev);
  const c = centroidForMovementRegionLabel(region);
  return { lat: c.lat, lng: c.lng, quality: "region" };
}

/**
 * Synthetic movement row for /events map + cards. Source of truth: public calendar query (gated in Prisma).
 * Canceled and non-public events never reach this mapper.
 */
export function publicCampaignEventToEventItem(ev: PublicCampaignEvent): EventItem {
  const now = new Date();
  const region = regionLabelForPublicEvent(ev);
  const pin = mapPinForPublicEvent(ev);
  const hasSummary = Boolean(ev.publicSummary?.trim());
  const mappedType = campaignEventTypeToMovementEventType(ev.eventType);
  const summary =
    ev.publicSummary?.trim() ||
    `${ev.eventTypeLabel} — ${ev.locationName || ev.address || "Details on the campaign calendar."}`.slice(0, 280);

  const item: EventItem = {
    slug: ev.slug,
    title: ev.title,
    type: mappedType,
    region,
    countySlug: ev.county?.slug,
    status: ev.endAt >= now ? "upcoming" : "past",
    startsAt: ev.startAt.toISOString(),
    endsAt: ev.endAt.toISOString(),
    timezone: ev.timezone,
    locationLabel: ev.locationName || ev.address || "Location TBA",
    addressLine: ev.address ?? undefined,
    summary,
    description: ev.publicSummary?.trim() || ev.title,
    whatToExpect: [],
    whoItsFor: "Published on the campaign calendar for supporters and the public.",
    organizerNote: "Campaign operations calendar (published + public on site).",
    relatedEventSlugs: [],
    relatedResourceHrefs: [
      { label: "Campaign calendar", href: "/campaign-calendar" },
      { label: "Volunteer", href: ev.joinCampaignHref },
    ],
    mapCoordinates: { lat: pin.lat, lng: pin.lng },
    mapPinQuality: pin.quality,
    fieldAttendance: ev.eventType === "FESTIVAL" ? "unscheduled" : undefined,
    detailHref: ev.detailHref,
    eventSource: "calendar",
    opsFlags: {
      missingPublicSummary: !hasSummary,
      missingCounty: !ev.county,
      missingCoordinates: false,
    },
  };
  return item;
}

export function mergeMovementAndCalendarEvents(
  movement: EventItem[],
  calendar: PublicCampaignEvent[],
): EventItem[] {
  const taken = new Set(movement.map((e) => e.slug));
  const synthetic = calendar.filter((c) => !taken.has(c.slug)).map(publicCampaignEventToEventItem);
  return [...movement, ...synthetic];
}
