import { getEventBySlug } from "@/content/events";
import type { EventItem } from "@/content/types";
import { getPublicCampaignEventBySlug } from "@/lib/calendar/public-events";
import { publicCampaignEventToEventItem } from "@/lib/events/calendar-to-movement-event";
import { overlayPublishedCalendarEvent } from "@/lib/scheduler/overlay-public-card";

export async function resolvePublicEventItemBySlug(slug: string): Promise<EventItem | null> {
  const curated = getEventBySlug(slug);
  const published = await getPublicCampaignEventBySlug(slug);
  if (curated && published) return overlayPublishedCalendarEvent(curated, published);
  if (curated) return curated;
  if (published) return publicCampaignEventToEventItem(published);
  return null;
}
