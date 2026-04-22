import type { Metadata } from "next";
import { listPublishedCounties } from "@/lib/county/get-county-command-data";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { pageMeta } from "@/lib/seo/metadata";
import { CampaignCalendarView } from "@/components/calendar/CampaignCalendarView";
import { parsePublicCalendarParams } from "@/lib/calendar/public-calendar-url";
import { siteConfig } from "@/config/site";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = pageMeta({
  title: "Campaign calendar",
  description: `Where ${siteConfig.shortName} is on the road—published events from the campaign operations system.`,
  path: "/campaign-calendar",
});

export default async function CampaignCalendarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const state = parsePublicCalendarParams(sp);
  const counties = await listPublishedCounties();
  const countyOpts = counties.map((c) => ({ slug: c.slug, displayName: c.displayName }));

  return (
    <>
      <FullBleedSection variant="civic-blue" padY className="border-b border-civic-gold/20">
        <ContentContainer>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-sunlight-gold">Show up and participate</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-civic-mist md:text-4xl">Campaign calendar</h1>
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-civic-mist/90 md:text-base">
            This is the live, campaign-owned schedule. Only events the team has <strong>published</strong> and marked{" "}
            <strong>public on the site</strong> appear here—no private briefings, no draft stages, and no third-party
            embed as the main experience. Pick a county, a format, or a time window, then get details, RSVP, and
            volunteer from each card.
          </p>
        </ContentContainer>
      </FullBleedSection>
      <FullBleedSection padY>
        <ContentContainer>
          <CampaignCalendarView state={state} counties={countyOpts} />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
