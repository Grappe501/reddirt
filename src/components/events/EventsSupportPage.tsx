import type { ReactNode } from "react";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { EventsSubpageFooter } from "./EventsSubpageFooter";

type EventsSupportPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

/**
 * Shared shell for Events hub subpages — matches News scaffolding (plan hero + gradient tail).
 * TODO: Optional embed region for approved Google Calendar public feeds (later phase).
 */
export function EventsSupportPage({ eyebrow, title, intro, children }: EventsSupportPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-kelly-fog/90 via-white to-kelly-fog/50 pb-16">
      <PageHero tone="plan" eyebrow={eyebrow} title={title} subtitle={intro} />

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">{children}</ContentContainer>
      </FullBleedSection>

      <EventsSubpageFooter />
    </div>
  );
}
