import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { EventHelpShiftBoard } from "@/components/organizing/EventHelpShiftBoard";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { loadPublicMobilizeBoard } from "@/lib/integrations/mobilize";
import { mobilizeFeedUrl } from "@/config/mobilize";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Event help",
  description: "Pick a campaign stop by city and date, then sign up on Mobilize for that shift.",
  path: "/get-involved/event-help",
});

export default async function EventHelpPage() {
  const board = await loadPublicMobilizeBoard();

  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Help at an event"
        subtitle="See the city and the date first. Tap a card to sign up on Mobilize for that shift."
      >
        <Button href={board.feedUrl || mobilizeFeedUrl()} variant="primary">
          Open Mobilize
        </Button>
        <Button href="/get-involved#volunteer" variant="outline">
          General volunteer form
        </Button>
        <Button href="/events" variant="outline">
          All campaign events
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer>
          <EventHelpShiftBoard board={board} />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
