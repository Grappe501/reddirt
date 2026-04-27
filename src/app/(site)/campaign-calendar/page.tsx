import type { Metadata } from "next";
import { safePublishedCountyOptionsWithSlug } from "@/lib/county/safe-published-county-options";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { pageMeta } from "@/lib/seo/metadata";
import { CampaignCalendarView } from "@/components/calendar/CampaignCalendarView";
import { parsePublicCalendarParams } from "@/lib/calendar/public-calendar-url";
import { siteConfig } from "@/config/site";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = pageMeta({
  title: "Campaign calendar",
  description: `Where ${siteConfig.shortName} is on the road—published public events from the campaign calendar.`,
  path: "/campaign-calendar",
});

export default async function CampaignCalendarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const state = parsePublicCalendarParams(sp);
  const counties = await safePublishedCountyOptionsWithSlug();
  const countyOpts = counties.map((c) => ({ slug: c.slug, displayName: c.displayName }));

  return (
    <>
      <FullBleedSection variant="band-blue" padY className="border-b border-kelly-gold/20">
        <ContentContainer>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-gold">Show up and participate</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-kelly-mist md:text-4xl">Campaign calendar</h1>
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-mist/90 md:text-base">
            This is the live, campaign-owned schedule. Only events the team has <strong>published</strong> and marked{" "}
            <strong>public on the site</strong> appear here—no private briefings, no draft stages, and no third-party
            embed as the main experience. Pick a county, a format, or a time window, then get details, RSVP, and
            volunteer from each card.
          </p>
        </ContentContainer>
      </FullBleedSection>
      <FullBleedSection padY>
        <ContentContainer>
          {countyOpts.length === 0 ? (
            <p className="mb-4 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2 font-body text-sm text-amber-950/90" role="status">
              County filters are temporarily unavailable. Event listings below still load when available—try “All counties.”
            </p>
          ) : null}
          <CampaignCalendarView state={state} counties={countyOpts} />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
