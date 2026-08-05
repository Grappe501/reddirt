import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { CountyProgressGrid } from "@/components/kelly-county-visits/CountyProgressGrid";
import { StopList } from "@/components/kelly-county-visits/StopList";
import { VisitInviteCta } from "@/components/kelly-county-visits/VisitInviteCta";
import { VisitSummaryStats } from "@/components/kelly-county-visits/VisitSummaryStats";
import {
  getCompletedPublicStops,
  getUpcomingPublicStops,
  getVisitSummary,
} from "@/data/kelly-county-visits";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Kelly Across Arkansas",
  description:
    "County visits and upcoming campaign stops as Kelly Grappe travels Arkansas — listening in person and showing up in communities statewide.",
  path: "/arkansas-visits",
  imageSrc: "/media/placeholders/hero-arkansas-warm.svg",
});

export default function ArkansasVisitsPage() {
  const summary = getVisitSummary();
  const completed = getCompletedPublicStops();
  const upcoming = getUpcomingPublicStops();

  return (
    <>
      <MediaPageHero
        slotKey="arkansas.hero"
        layout="split"
        eyebrow="Kelly Across Arkansas"
        title="Showing up in every corner of the state"
        subtitle={`Kelly listens in person, travels county to county, and is building a campaign rooted in the whole of Arkansas. ${summary.visitedCounties} counties visited so far · ${summary.scheduledStopCount} public stops still ahead through Election Day season.`}
      >
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
        <Button href="/arkansas" variant="outlineOnDark">
          County presence
        </Button>
      </MediaPageHero>

      <FullBleedSection padY>
        <ContentContainer wide>
          <VisitSummaryStats summary={summary} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <CountyProgressGrid summary={summary} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer wide className="max-w-4xl">
          <StopList
            id="arkansas-visits-completed"
            title="Completed stops"
            lead="Public campaign stops already on the trail, newest first."
            stops={completed}
            emptyMessage="No completed public stops are published in the ledger yet."
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide className="max-w-4xl">
          <StopList
            id="arkansas-visits-upcoming"
            title="Upcoming stops"
            lead="Scheduled public stops through November 3, 2026."
            stops={upcoming}
            emptyMessage="No upcoming public stops are published in the ledger yet."
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer wide className="max-w-3xl">
          <VisitInviteCta />
          <p className="mt-8 font-body text-xs text-kelly-muted">
            Related:{" "}
            <Link href="/arkansas" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              Arkansas presence
            </Link>
            {" · "}
            <Link href="/events" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              Events
            </Link>
            {" · "}
            <Link
              href="/about/journey"
              className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
            >
              Journey photos
            </Link>
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
