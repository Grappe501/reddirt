import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { EventStopCard } from "@/components/organizing/EventStopCard";
import { events } from "@/content/events";
import { ARKANSAS_COUNTY_SVG_PATHS } from "@/data/kelly-county-visits/arkansas-county-svg-paths";
import { queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import { mergeMovementAndCalendarEvents } from "@/lib/events/calendar-to-movement-event";
import { drivesPublicCountyMap } from "@/lib/events/county-campaign-summary";
import { countyNameFromKey, formatCountyEyebrow, normalizeArkansasCountyKey } from "@/lib/events/county-key";
import { skipPublicStaticGenerationForNetlifyLaunch } from "@/lib/intelligence/intelligenceLaunchMode";
import { compareEventsForHub, resolveEventStatus } from "@/lib/format/eventDisplay";
import { pageMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  if (skipPublicStaticGenerationForNetlifyLaunch()) return [];
  return ARKANSAS_COUNTY_SVG_PATHS.map((c) => ({ slug: c.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const key = normalizeArkansasCountyKey(slug);
  const name = countyNameFromKey(key);
  if (!name) return { title: "County events" };
  return pageMeta({
    title: `${name} County events`,
    description: `Upcoming Kelly Grappe campaign stops in ${name} County, Arkansas.`,
    path: `/events/county/${key}`,
  });
}

export const revalidate = 3600;

export default async function CountyEventsPage({ params }: Props) {
  const { slug } = await params;
  const key = normalizeArkansasCountyKey(slug);
  const name = countyNameFromKey(key);
  if (!key || !name) notFound();

  const calendarRows = await queryPublicCampaignEvents({ range: "all" }, { take: 200 });
  const merged = mergeMovementAndCalendarEvents(events, calendarRows);
  const now = new Date();
  const upcoming = merged
    .filter((e) => drivesPublicCountyMap(e))
    .filter((e) => normalizeArkansasCountyKey(e.countySlug) === key)
    .filter((e) => resolveEventStatus(e, now) === "upcoming")
    .sort((a, b) => compareEventsForHub(a, b, now));

  return (
    <>
      <PageHero
        eyebrow="Events"
        title={formatCountyEyebrow(name)}
        subtitle={`Upcoming Kelly Grappe campaign stops in ${name} County.`}
      >
        <Button href="/events" variant="outline">
          All events
        </Button>
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer>
          {upcoming.length ? (
            <ul className="grid list-none grid-cols-1 gap-4 md:grid-cols-2">
              {upcoming.map((event) => (
                <li key={event.slug}>
                  <EventStopCard event={event} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-card border border-dashed border-kelly-text/20 px-4 py-6 font-body text-sm text-kelly-text/75">
              No upcoming public stops are listed for {name} County yet.{" "}
              <Link href="/events/request" className="font-semibold text-kelly-navy underline-offset-4 hover:underline">
                Invite Kelly
              </Link>
              .
            </p>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
