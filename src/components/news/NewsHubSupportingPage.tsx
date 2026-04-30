import type { ReactNode } from "react";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";

type NewsHubSupportingPageProps = {
  /** Small caps label above title (e.g. "News · Updates"). */
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

/**
 * Shared shell for lightweight News-adjacent pages: calm plan-theme hero, body slot, gentle CTAs.
 * TODO: optional curated feed slots (CMS / social / calendar) — not built here.
 */
export function NewsHubSupportingPage({ eyebrow, title, intro, children }: NewsHubSupportingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-kelly-fog/90 via-white to-kelly-fog/50 pb-16">
      <PageHero tone="plan" eyebrow={eyebrow} title={title} subtitle={intro} />

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">{children}</ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY className="border-t border-kelly-text/10">
        <ContentContainer className="max-w-3xl">
          <p className="text-center font-body text-sm font-semibold text-kelly-text/70">More from the campaign</p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Button href="/from-the-road" variant="outline" className="min-h-[48px] w-full min-w-[12rem] sm:w-auto">
              From the Road
            </Button>
            <Button href="/get-involved" variant="outline" className="min-h-[48px] w-full min-w-[12rem] sm:w-auto">
              Get involved
            </Button>
          </div>
          <p className="mt-6 text-center font-body text-xs text-kelly-text/55">
            Looking for longer essays? Try{" "}
            <Link href="/editorial" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              Editorial
            </Link>{" "}
            or{" "}
            <Link href="/explainers" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              Explainers
            </Link>
            .
          </p>
        </ContentContainer>
      </FullBleedSection>
    </div>
  );
}

/** Placeholder card when a feed is empty — intentional, not a broken layout. */
export function NewsHubPlaceholderCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card border border-dashed border-kelly-text/20 bg-white/85 p-8 text-center shadow-sm md:p-10">
      <h2 className="font-heading text-lg font-bold text-kelly-ink md:text-xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl font-body text-base leading-relaxed text-kelly-slate">{body}</p>
    </div>
  );
}
