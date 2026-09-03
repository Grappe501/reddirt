import type { CampaignEventType } from "@prisma/client";
import { getMovementRegionForCountySlug, STATEWIDE_EVENT_REGION } from "@/content/arkansas-movement-regions";
import type { EventItem, EventType } from "@/content/types";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { withLiveEventStatus } from "@/lib/format/eventDisplay";
import { applyPublishedCalendarOverlay } from "@/lib/scheduler/overlay-public-card";
import { cardFromRow, cardToFieldAttendance } from "@/lib/scheduler/public-card-fields";

/** Map CampaignOS types into movement /events filter buckets (approximate but useful). */
export function campaignEventTypeToMovementEventType(t: CampaignEventType): EventType {
  switch (t) {
    case "TRAINING":
    case "ORIENTATION":
      return "Volunteer Training";
    case "FESTIVAL":
      return "Fairs and Festivals";
    case "YOUTH":
      return "Youth Civic Session";
    case "LISTENING":
      return "Listening Session";
    case "CIVIC":
      return "Direct Democracy Briefing";
    case "COUNTY_PARTY":
    case "FORUM":
    case "SPEAKING":
      return "Town Hall";
    case "COMMUNITY":
      return "Community Conversation";
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

/**
 * Synthetic movement row for /events map + cards. Source of truth: public calendar query (gated in Prisma).
 * Phase 2: no region-centroid map pins — Prefer Unknown until exact coords exist on the public event.
 */
export function publicCampaignEventToEventItem(ev: PublicCampaignEvent): EventItem {
  const now = new Date();
  const region = regionLabelForPublicEvent(ev);
  const hasSummary = Boolean(ev.publicSummary?.trim());
  const mappedType = campaignEventTypeToMovementEventType(ev.eventType);
  const venue = ev.locationName?.trim() || ev.address?.trim() || "";
  const summary = (ev.publicSummary?.trim() || ev.title).slice(0, 280);

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
    locationLabel: ev.city?.trim() || venue || "Unknown",
    addressLine: ev.address ?? undefined,
    publicContact: ev.publicContact?.trim() || undefined,
    flyerSrc: ev.publicSocialGraphicUrl?.trim() || undefined,
    summary,
    description: ev.publicSummary?.trim() || ev.title,
    whatToExpect: [],
    whoItsFor: "Published on the campaign calendar for supporters and the public.",
    organizerNote: "Published on the campaign calendar.",
    relatedEventSlugs: [],
    relatedResourceHrefs: [
      { label: "Campaign calendar", href: "/events" },
      { label: "Volunteer", href: ev.joinCampaignHref },
    ],
    // Exact coords only on the public map — none available on PublicCampaignEvent yet.
    mapCoordinates: undefined,
    mapPinQuality: undefined,
    detailHref: ev.detailHref,
    eventSource: "calendar",
    fieldAttendance: cardToFieldAttendance(cardFromRow(ev)),
    attendanceType: ev.attendanceType,
    city: ev.city?.trim() || undefined,
    campaignTrail: true,
    statewideVirtual: ev.venueMode === "virtual",
    qualifiesAsVisit: ev.venueMode === "virtual" ? false : undefined,
    opsFlags: {
      missingPublicSummary: !hasSummary,
      missingCounty: !ev.county,
      missingCoordinates: true,
    },
  };
  return item;
}

export function mergeMovementAndCalendarEvents(
  movement: EventItem[],
  calendar: PublicCampaignEvent[],
  suppressedSlugs: Iterable<string> = [],
): EventItem[] {
  const hidden = new Set(suppressedSlugs);
  const visibleMovement = movement.filter((e) => !hidden.has(e.slug));
  const visibleCalendar = calendar.filter((c) => !hidden.has(c.slug));
  const taken = new Set(visibleMovement.map((e) => e.slug));
  const overlaid = applyPublishedCalendarOverlay(visibleMovement, visibleCalendar);
  const synthetic = visibleCalendar.filter((c) => !taken.has(c.slug)).map(publicCampaignEventToEventItem);
  const now = new Date();
  return [...overlaid, ...synthetic].map((e) => withLiveEventStatus(e, now));
}
