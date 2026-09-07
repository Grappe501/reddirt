import { getEventBySlug } from "@/content/events";
import type { EventItem } from "@/content/types";
import { getPublicCampaignEventBySlug } from "@/lib/calendar/public-events";
import { publicCampaignEventToEventItem } from "@/lib/events/calendar-to-movement-event";
import { overlayPublishedCalendarEvent } from "@/lib/scheduler/overlay-public-card";
import { applyCampaignApproach } from "@/lib/events/campaign-approach";

export async function resolvePublicEventItemBySlug(slug: string): Promise<EventItem | null> {
  const curated = getEventBySlug(slug);
  const published = await getPublicCampaignEventBySlug(slug);
  if (curated && published) return applyCampaignApproach(overlayPublishedCalendarEvent(curated, published));
  if (curated) return applyCampaignApproach(curated);
  if (published) return applyCampaignApproach(publicCampaignEventToEventItem(published));
  return null;
}
