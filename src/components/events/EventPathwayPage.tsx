import type { ReactNode } from "react";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { EventsSubpageFooter } from "./EventsSubpageFooter";

type EventPathwayPageProps = {
  layer: 1 | 2;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Layer progression CTA (layer 1 only). */
  nextStep?: { label: string; href: string };
};

export async function EventPathwayPage({ layer, eyebrow, title, subtitle, children, nextStep }: EventPathwayPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-kelly-fog/90 via-white to-kelly-fog/50 pb-16">
      <FullBleedSection variant="subtle" padY={false} className="border-b border-kelly-text/10">
        <ContentContainer className="max-w-3xl pt-5 pb-3 sm:pt-6">
          <nav aria-label="Invite Kelly pathway steps">
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-gold/90">Pathway</p>
            <ol className="mt-2 flex flex-wrap gap-x-1 gap-y-1 font-body text-xs text-kelly-text/75 sm:text-sm">
              <li>
                {layer === 1 ? (
                  <span className="font-semibold text-kelly-text" aria-current="step">
                    Why
                  </span>
                ) : (
                  <Link
                    href="/events/request"
                    className="font-semibold text-kelly-navy underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                  >
                    Why
                  </Link>
                )}
              </li>
              <li aria-hidden className="text-kelly-text/40">
                ·
              </li>
              <li>
                {layer === 2 ? (
                  <span className="font-semibold text-kelly-text" aria-current="step">
                    How &amp; what to host
                  </span>
                ) : (
                  <Link
                    href="/events/request/how-it-works"
                    className="font-semibold text-kelly-navy underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                  >
                    How &amp; what to host
                  </Link>
                )}
              </li>
            </ol>
          </nav>
        </ContentContainer>
      </FullBleedSection>

      <MediaPageHero
        slotKey="events.request.hero"
        layout="split"
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
      />

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">{children}</ContentContainer>
      </FullBleedSection>

      {nextStep ? (
        <FullBleedSection variant="subtle" padY className="border-t border-kelly-text/8">
          <ContentContainer className="max-w-3xl">
            <p className="font-body text-xs font-semibold uppercase tracking-wide text-kelly-text/55">Next step</p>
            <div className="mt-4">
              <Button
                href={nextStep.href}
                variant="primary"
                className="min-h-[48px] min-w-[12rem] motion-reduce:transition-none"
              >
                {nextStep.label}
              </Button>
            </div>
          </ContentContainer>
        </FullBleedSection>
      ) : null}

      <EventsSubpageFooter />
    </div>
  );
}
