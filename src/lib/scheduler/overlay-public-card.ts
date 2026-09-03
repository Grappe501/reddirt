import type { EventItem } from "@/content/types";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { cardFromRow, cardToEventMarks, cardToFieldAttendance } from "@/lib/scheduler/public-card-fields";

export function overlayPublishedCalendarEvent(base: EventItem, pub: PublicCampaignEvent): EventItem {
  const card = cardFromRow(pub);
  const attendance = cardToFieldAttendance(card);
  const marks = cardToEventMarks(card);
  const next: EventItem = {
    ...base,
    title: pub.title || base.title,
    startsAt: pub.startAt.toISOString(),
    endsAt: pub.endAt.toISOString(),
    timezone: pub.timezone || base.timezone,
    locationLabel: pub.locationName?.trim() || base.locationLabel,
    city: pub.city?.trim() || base.city,
    addressLine: pub.address?.trim() || base.addressLine,
    countySlug: pub.county?.slug || base.countySlug,
    summary: pub.publicSummary?.trim() || base.summary,
    description: pub.publicSummary?.trim() || base.description,
    fieldAttendance: attendance ?? base.fieldAttendance,
    publicContact: pub.publicContact?.trim() || base.publicContact,
    primaryHref: card.mobilizeHref || card.volunteerHref || base.primaryHref,
    eventSource: "calendar",
    opsFlags: {
      ...base.opsFlags,
      missingPublicSummary: !(pub.publicSummary?.trim() || base.summary),
      missingCounty: !(pub.county || base.countySlug),
    },
  };
  if (marks) Object.assign(next, { marks });
  return next;
}

export function applyPublishedCalendarOverlay(movement: EventItem[], calendar: PublicCampaignEvent[]): EventItem[] {
  const bySlug = new Map(calendar.map((event) => [event.slug, event]));
  return movement.map((event) => {
    const published = bySlug.get(event.slug);
    return published ? overlayPublishedCalendarEvent(event, published) : event;
  });
}
