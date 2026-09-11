import type { EventItem } from "@/content/types";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { cardFromRow, cardToEventMarks, cardToFieldAttendance } from "@/lib/scheduler/public-card-fields";

function isThinPlace(value?: string | null): boolean {
  const t = value?.trim() ?? "";
  if (!t) return true;
  return /\b(tba|tbd|unknown|city tba|venue tba|location tba|building not|street not|not on the calendar)\b/i.test(t);
}

export function overlayPublishedCalendarEvent(base: EventItem, pub: PublicCampaignEvent): EventItem {
  const card = cardFromRow(pub);
  const attendance = cardToFieldAttendance(card);
  const marks = cardToEventMarks(card);
  const next: EventItem = {
    ...base,
    title: base.title || pub.title,
    startsAt: base.startsAt,
    endsAt: base.endsAt ?? pub.endAt.toISOString(),
    timezone: base.timezone || pub.timezone,
    locationLabel: isThinPlace(pub.locationName) ? base.locationLabel : pub.locationName!.trim(),
    city: isThinPlace(pub.city) ? base.city : pub.city!.trim(),
    addressLine: isThinPlace(pub.address) ? base.addressLine : pub.address!.trim(),
    countySlug: pub.county?.slug || base.countySlug,
    summary: base.summary || pub.publicSummary?.trim() || "",
    description: base.description || pub.publicSummary?.trim() || "",
    fieldAttendance: attendance ?? base.fieldAttendance,
    publicContact: pub.publicContact?.trim() || base.publicContact,
    flyerSrc: base.flyerSrc || pub.publicSocialGraphicUrl?.trim(),
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
