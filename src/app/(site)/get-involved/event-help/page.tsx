import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { EventHelpShiftBoard } from "@/components/organizing/EventHelpShiftBoard";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { loadPublicMobilizeBoard } from "@/lib/integrations/mobilize";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Event help",
  description: "Pick a campaign stop and sign up for a volunteer shift. Listed by location, with a direct Mobilize signup.",
  path: "/get-involved/event-help",
});

export default async function EventHelpPage() {
  const board = await loadPublicMobilizeBoard();

  return (
    <>
      <PageHero
        eyebrow="Volunteer"
        title="Help at an event"
        subtitle="Choose a stop near you. Each card opens the Mobilize signup for that shift."
      >
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
