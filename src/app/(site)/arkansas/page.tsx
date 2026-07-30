import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { ArkansasCountyGrid } from "@/components/arkansas/ArkansasCountyGrid";
import { ArkansasUpcomingStops } from "@/components/arkansas/ArkansasUpcomingStops";
import { ArkansasInviteCta } from "@/components/arkansas/ArkansasInviteCta";
import { arkansasPresenceCopy } from "@/content/county/arkansas-presence";
import { loadPublicCountyPresence } from "@/lib/county/public-county-presence";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const copy = arkansasPresenceCopy;

export const metadata: Metadata = pageMeta({
  title: "County presence across Arkansas",
  description:
    "Verified county visits and published upcoming stops—evidence that the campaign is showing up across Arkansas. No internal metrics. Invite Kelly to your community.",
  path: "/arkansas",
  imageSrc: "/media/placeholders/hero-arkansas-warm.svg",
});

export default async function ArkansasPresencePage() {
  const presence = await loadPublicCountyPresence();

  return (
    <>
      <MediaPageHero
        slotKey="arkansas.hero"
        layout="split"
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
      >
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
        <Button href="/arkansas/counties" variant="outlineOnDark">
          All 75 counties
        </Button>
        <Button href="/events" variant="outlineOnDark">
          Campaign calendar
        </Button>
      </MediaPageHero>

      <FullBleedSection padY>
        <ContentContainer wide>
          <ArkansasCountyGrid
            counties={presence.counties}
            visitedCount={presence.visitedCount}
            totalCounties={presence.totalCounties}
          />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide className="max-w-3xl">
          <ArkansasUpcomingStops events={presence.upcomingEvents} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY>
        <ContentContainer wide className="max-w-3xl">
          <ArkansasInviteCta />
          <p className="mt-8 font-body text-xs text-kelly-muted">
            Community calendar items on{" "}
            <Link href="/events" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              /events
            </Link>{" "}
            include published campaign events and approved public listings.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
