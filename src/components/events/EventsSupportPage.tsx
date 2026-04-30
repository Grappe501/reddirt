import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";

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

      <FullBleedSection variant="subtle" padY className="border-t border-kelly-text/10">
        <ContentContainer className="max-w-3xl">
          <p className="text-center font-body text-sm font-semibold text-kelly-text/70">Campaign operations</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/events" variant="outline" className="min-h-[48px] w-full min-w-[12rem] sm:w-auto">
              Campaign Calendar
            </Button>
            <Button href="/events/request" variant="outline" className="min-h-[48px] w-full min-w-[12rem] sm:w-auto">
              Request Kelly
            </Button>
            <Button href="/from-the-road" variant="outline" className="min-h-[48px] w-full min-w-[12rem] sm:w-auto">
              From the Road
            </Button>
          </div>
          <p className="mt-6 text-center font-body text-xs text-kelly-text/55">
            <Link href="/listening-sessions" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              Listening sessions
            </Link>
          </p>
        </ContentContainer>
      </FullBleedSection>
    </div>
  );
}
