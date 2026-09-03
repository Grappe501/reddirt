import { getCampaignStopMilestone } from "@/content/events/campaign-stop-milestone";
import {
  eventSlugFromCampaignStop,
  getUpcomingPublicStops,
  getVisitSummary,
  visitsAsOfYmd,
  type PublicStopFilter,
  type VisitSummary,
} from "@/data/kelly-county-visits";
import { listPubliclySuppressedEventSlugs } from "@/lib/calendar/public-events";

/** Upcoming ledger slugs the operator took off the public calendar, from today forward. */
export async function loadHiddenUpcomingEventSlugs(): Promise<Set<string>> {
  const asOfYmd = visitsAsOfYmd();
  const slugs = getUpcomingPublicStops()
    .filter((stop) => stop.date >= asOfYmd)
    .map(eventSlugFromCampaignStop)
    .filter((slug): slug is string => Boolean(slug));
  return listPubliclySuppressedEventSlugs(slugs);
}

export async function loadPublicVisitFilter(): Promise<PublicStopFilter> {
  return { hiddenUpcomingSlugs: await loadHiddenUpcomingEventSlugs() };
}

export async function loadPublicVisitSummary(): Promise<VisitSummary> {
  return getVisitSummary(await loadPublicVisitFilter());
}

export async function getCampaignStopMilestoneAsync() {
  try {
    return getCampaignStopMilestone(await loadPublicVisitFilter());
  } catch (e) {
    console.error("[getCampaignStopMilestoneAsync]", e instanceof Error ? e.message : e);
    return getCampaignStopMilestone();
  }
}
