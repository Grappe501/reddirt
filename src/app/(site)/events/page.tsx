import type { Metadata } from "next";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { EventsProofSection } from "@/components/organizing/EventsProofSection";
import { EventsMovementSection } from "@/components/organizing/EventsMovementSection";
import { SuggestCommunityEventForm } from "@/components/organizing/SuggestCommunityEventForm";
import { events } from "@/content/events";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";
import { loadCountyVisitLedger } from "@/lib/events/load-county-visit-ledger";
import { buildEventsMapModel } from "@/lib/events/events-map-model";
import { safePublishedCountyOptions } from "@/lib/county/safe-published-county-options";

import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { campaignStopMilestoneLine } from "@/content/events/campaign-stop-milestone";

export const metadata: Metadata = pageMeta({
  title: "Events",
  description:
    `${campaignStopMilestoneLine()}. Where Kelly has been and where she will be next — county visits plus confirmed stops in Arkansas Central Time.`,
  path: "/events",
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

/** Netlify builds re-evaluate ended appearances in America/Chicago. */
export const revalidate = 3600;

function pickParam(sp: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const suggestOk = pickParam(sp, "ok");
  const [counties, calendarRows] = await Promise.all([
    safePublishedCountyOptions(),
    queryPublicCampaignEvents({ range: "all" }, { take: 200 }),
  ]);
  const mergedEvents = mergeMovementAndCalendarEvents(events, calendarRows);
  const ledger = await loadCountyVisitLedger(mergedEvents);
  const { features } = buildEventsMapModel(ledger, mergedEvents);

  return (
    <>
      <MediaPageHero
        slotKey="events.hero"
        layout="split"
        eyebrow="Events"
        title="Where Kelly will be next"
        subtitle={`${campaignStopMilestoneLine()}. From county fairs and community meetings to cookouts, candidate forums, and front porches — see where Kelly is headed next.`}
      >
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
        <Button href="/host-a-gathering" variant="outlineOnDark">
          Host a Gathering
        </Button>
      </MediaPageHero>

      <FullBleedSection padY aria-labelledby="events-proof-heading">
        <ContentContainer>
          <EventsProofSection ledger={ledger} features={features} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="events-movement-heading">
        <ContentContainer wide>
          <EventsMovementSection events={mergedEvents} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="invite" padY aria-labelledby="events-invitation-heading">
        <ContentContainer>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Invitation</p>
          <h2 id="events-invitation-heading" className="mt-1 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
            How to get Kelly here
          </h2>
          <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
            If your town is not on the list yet, open the next date — nothing is public until it is verified.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/events/request" variant="primary">
              Invite Kelly
            </Button>
            <Button href="/host-a-gathering" variant="outline">
              Host a Gathering
            </Button>
            <Button href="#suggest" variant="ghost">
              Suggest an Event
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="suggest" variant="subtle" padY aria-labelledby="suggest-title">
        <ContentContainer>
          <h2 id="suggest-title" className="font-heading text-xl font-bold text-kelly-text md:text-2xl">
            Suggest a fair, festival, or public event
          </h2>
          <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/75">
            Know a neighborhood gathering that should be on the map? Send it in—the campaign reviews it before it appears
            here and on the trail.
          </p>
          {suggestOk === "suggest" ? (
            <p
              className="mt-3 rounded-md border border-kelly-success/30 bg-kelly-success/10 px-3 py-2 font-body text-sm text-kelly-text"
              role="status"
            >
              Thanks — we received your suggestion. The team will review it before anything goes live.
            </p>
          ) : null}
          {counties.length === 0 ? (
            <p
              className="mt-3 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 font-body text-sm text-amber-950/90"
              role="status"
            >
              County pick-list is temporarily unavailable. You can still describe the location in your message—we’ll match
              it to a county.
            </p>
          ) : null}
          <SuggestCommunityEventForm counties={counties} idPrefix="suggest" />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
