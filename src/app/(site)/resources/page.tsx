import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { ResourceGrid } from "@/components/organizing/ResourceGrid";
import { organizingToolkit } from "@/content/resources/toolkit";
import { Button } from "@/components/ui/Button";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { ContentImage } from "@/components/media/ContentImage";
import { media } from "@/content/media/registry";
import { allExplainers } from "@/content/explainers";
import { pageMeta } from "@/lib/seo/metadata";
import { getPageBlockPayload, type HeroBlockPayload } from "@/lib/content/page-blocks";
import { CampaignBriefingLibrary } from "@/components/campaign/CampaignBriefingLibrary";

export const metadata: Metadata = pageMeta({
  title: "Resources",
  description:
    "Organizing toolkits, civic explainers, downloads-in-progress, and links into long-form clarity—built for living rooms and breakrooms.",
  path: "/resources",
  imageSrc: "/media/placeholders/explainer-steps.svg",
});

export default async function ResourcesPage() {
  const hero = await getPageBlockPayload<HeroBlockPayload>("resources", "hero");

  return (
    <>
      <PageHero
        eyebrow={hero?.eyebrow ?? "Library"}
        title={hero?.title ?? "Resources for the work"}
        subtitle={
          hero?.subtitle ??
          "This library is meant to travel: print-friendly sections, plain language, and honest ‘still drafting’ labels where we’re not done yet."
        }
      >
        <Button href="/explainers" variant="primary">
          Plain-language explainers
        </Button>
        <Button href="/local-organizing" variant="outline">
          Organizing hub
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="relative min-h-[260px] overflow-hidden rounded-card border border-deep-soil/10 shadow-[var(--shadow-soft)] lg:min-h-[320px]">
              <ContentImage media={media.explainerSteps} warmOverlay className="absolute inset-0 min-h-full" />
            </div>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Start simple"
                title="When the process feels like a locked door"
                subtitle="Explainers walk through referendums, petitions, bargaining basics, and local organizing—without talking down to you."
                className="max-w-xl"
              />
              <ul className="mt-6 space-y-3 font-body text-deep-soil/80">
                {allExplainers.slice(0, 3).map((e) => (
                  <li key={e.slug}>
                    <Link href={`/explainers/${e.slug}`} className="font-semibold text-red-dirt hover:underline">
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Button href="/explainers" variant="secondary" className="mt-8">
                All explainers
              </Button>
            </div>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection id="toolkit" padY aria-labelledby="toolkit-heading">
        <ContentContainer wide>
          <SectionHeading
            id="toolkit-heading"
            align="left"
            eyebrow="Organizing toolkit"
            title="Guides for hosts, facilitators, and team starters"
            subtitle="Reusable agendas and field habits—built to be photocopied, texted, and adapted locally."
          />
          <ResourceGrid items={organizingToolkit} className="mt-12" />
          <p className="mt-8 max-w-3xl font-body text-sm text-deep-soil/60">
            PDFs, translated one-pagers, and facilitator decks attach to these cards as they’re finalized—URLs stay stable.
          </p>
        </ContentContainer>
      </FullBleedSection>

      <QuoteBand
        quote="If a resource only works for people who already know the jargon, it isn’t a movement tool—it’s a gate."
        attribution="Design standard"
        variant="gold-band"
      />

      <FullBleedSection padY className="bg-washed-canvas/80" aria-labelledby="briefing-records">
        <ContentContainer>
          <CampaignBriefingLibrary />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="pillars-heading">
        <ContentContainer>
          <SectionHeading
            id="pillars-heading"
            align="left"
            eyebrow="Pillar pages"
            title="Go deep on the big building blocks"
            subtitle="Pair toolkits with campaign pages when you’re hosting a training or writing a local op-ed."
          />
          <ResponsiveGrid cols="2" className="mt-12">
            {[
              {
                t: "Direct democracy",
                h: "/direct-democracy",
                b: "Initiatives, referendums, and why ballot access is civic infrastructure—not a hobby for lawyers.",
              },
              {
                t: "Office priorities",
                h: "/priorities",
                b: "What the Secretary of State actually administers—elections, records, and business services—without national-issue clutter.",
              },
              {
                t: "Stories",
                h: "/stories",
                b: "Ground truth from neighbors—permissioned, specific, and tied to action.",
              },
              {
                t: "Editorial",
                h: "/editorial",
                b: "Longer movement essays when you want reasoning, not just rhetoric.",
              },
            ].map((x) => (
              <Link
                key={x.h}
                href={x.h}
                className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-red-dirt/30"
              >
                <h3 className="font-heading text-xl font-bold text-deep-soil">{x.t}</h3>
                <p className="mt-3 font-body text-base text-deep-soil/75">{x.b}</p>
                <span className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-red-dirt">
                  Open
                  <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="ingest-heading">
        <ContentContainer>
          <SectionHeading
            id="ingest-heading"
            align="left"
            eyebrow="Search + assistant"
            title="Keep the machine honest"
            subtitle="When long-form content changes, refresh embeddings so search and the assistant don’t confidently lie."
          />
          <p className="mt-6 max-w-3xl font-body text-deep-soil/80">
            Run{" "}
            <code className="rounded bg-deep-soil/10 px-2 py-1 font-mono text-sm">npm run ingest</code> after major
            content updates.
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
