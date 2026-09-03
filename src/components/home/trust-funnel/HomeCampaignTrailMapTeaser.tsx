import { ContentContainer } from "@/components/layout/ContentContainer";
import { CampaignJourneyMapTeaser } from "@/components/home/trust-funnel/CampaignJourneyMapTeaser";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { events } from "@/content/events";
import { listPubliclySuppressedEventSlugs, queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";
import { loadCountyVisitLedger } from "@/lib/events/load-county-visit-ledger";
import { buildEventsMapModel } from "@/lib/events/events-map-model";

/** Homepage compact campaign trail map — same data as /events; links to full map. */
export async function HomeCampaignTrailMapTeaser() {
  const [calendarRows, suppressedSlugs] = await Promise.all([
    queryPublicCampaignEvents({ range: "all" }, { take: 200 }),
    listPubliclySuppressedEventSlugs(events.map((event) => event.slug)),
  ]);
  const mergedEvents = mergeMovementAndCalendarEvents(events, calendarRows, suppressedSlugs);
  const ledger = await loadCountyVisitLedger(mergedEvents);
  const { features } = buildEventsMapModel(ledger, mergedEvents);

  return (
    <ScrollReveal yOffset={6} className="mb-10 md:mb-12">
      <CampaignJourneyMapTeaser features={features} ledger={ledger} />
    </ScrollReveal>
  );
}
