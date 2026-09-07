import { getEventBySlug } from "@/content/events";
import type { EventItem } from "@/content/types";
import { getPublicCampaignEventBySlug, listPubliclySuppressedEventSlugs } from "@/lib/calendar/public-events";
import { publicCampaignEventToEventItem } from "@/lib/events/calendar-to-movement-event";
import { overlayPublishedCalendarEvent } from "@/lib/scheduler/overlay-public-card";
import { applyCampaignApproach, isPublicCalendarEvent } from "@/lib/events/campaign-approach";

export async function resolvePublicEventItemBySlug(slug: string): Promise<EventItem | null> {
  const hidden = await listPubliclySuppressedEventSlugs([slug]);
  if (hidden.has(slug)) return null;
  const curated = getEventBySlug(slug);
  const published = await getPublicCampaignEventBySlug(slug);
  const resolved =
    curated && published
      ? overlayPublishedCalendarEvent(curated, published)
      : curated
        ? curated
        : published
          ? publicCampaignEventToEventItem(published)
          : null;
  if (!resolved) return null;
  const next = applyCampaignApproach(resolved);
  if (!isPublicCalendarEvent(next)) return null;
  return next;
}
