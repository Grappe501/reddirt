import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { QuoteBand } from "@/components/blocks/QuoteBand";
import { SplitFeatureSection } from "@/components/blocks/SplitFeatureSection";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { ContentImage } from "@/components/media/ContentImage";
import { media } from "@/content/media/registry";
import { pageMeta } from "@/lib/seo/metadata";
import { getPageBlockPayload, type HeroBlockPayload } from "@/lib/content/page-blocks";

export const metadata: Metadata = pageMeta({
  title: "The Arkansas we know",
  description:
    "Place-based truth: front porches, night shifts, small towns, and the civic courage that still shows up when institutions don’t.",
  path: "/the-arkansas-we-know",
  imageSrc: "/media/placeholders/hero-arkansas-warm.svg",
});

const textures = [
  {
    title: "Friday lights and Tuesday worry",
    body: "We know the sound of a gymnasium packed for a game—and the quiet math families do in the car ride home about bills.",
  },
  {
    title: "Land that remembers",
    body: "Rivers that flood. Soil that rewards patience. Woods where people go to get right with themselves. This isn’t backdrop scenery; it’s livelihood.",
  },
  {
    title: "Neighbors who still show up",
    body: "Casseroles, chainsaws after storms, childcare swaps. The Arkansas we know is relational—even when politics tries to turn us into demographics only.",
  },
] as const;

export default async function TheArkansasWeKnowPage() {
  const hero = await getPageBlockPayload<HeroBlockPayload>("the-arkansas-we-know", "hero");

  return (
    <>
      <PageHero
        eyebrow={hero?.eyebrow ?? "Place"}
        title={hero?.title ?? "The Arkansas we know"}
        subtitle={
          hero?.subtitle ??
          "This isn’t nostalgia. It’s testimony. The state we love and the state that frustrates us are the same place—worth fighting for without pretending."
        }
      />

      <SplitFeatureSection
        visualSide="right"
        padY
        visual={
          <div className="relative min-h-[300px] overflow-hidden rounded-card border border-deep-soil/10 shadow-[var(--shadow-card)] lg:min-h-[420px]">
            <ContentImage media={media.storyRural} warmOverlay className="absolute inset-0 min-h-full" />
            <div className="relative z-[1] flex h-full min-h-[300px] flex-col justify-center bg-gradient-to-r from-deep-soil/70 to-transparent p-8 lg:min-h-[420px]">
              <p className="max-w-xs font-heading text-xl font-bold text-cream-canvas">
                Maps miss what mail carriers know.
              </p>
            </div>
          </div>
        }
      >
        <SectionHeading
          align="left"
          eyebrow="Truth"
          title="We’re done flattering power"
          subtitle="Praising Arkansas doesn’t mean flattering politicians. It means naming what’s real: beauty, harm, resilience, and the work still undone."
          className="max-w-xl"
        />
        <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-deep-soil/85">
          If you’ve ever had to translate a government letter for your parents, you already understand why clarity is justice. If you’ve ever watched a town lose a plant and get offered slogans instead of transition—you understand why economics must be grounded.
        </p>
      </SplitFeatureSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="textures-heading">
        <ContentContainer>
          <SectionHeading
            id="textures-heading"
            title="Textures of a real state"
            subtitle="Short sketches—not stereotypes. Add yours when you’re ready."
          />
          <ResponsiveGrid cols="3" className="mt-12">
            {textures.map((t) => (
              <article
                key={t.title}
                className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-xl font-bold text-deep-soil">{t.title}</h3>
                <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/78">{t.body}</p>
              </article>
            ))}
          </ResponsiveGrid>
        </ContentContainer>
      </FullBleedSection>

      <QuoteBand
        quote="You don’t have to love every headline to love your neighbor’s kid—and fight for their future anyway."
        attribution="Porch note"
        variant="elevated"
      />

      <FullBleedSection padY aria-labelledby="voices-heading">
        <ContentContainer wide>
          <SectionHeading
            id="voices-heading"
            align="left"
            eyebrow="Voices"
            title="Hear the ground before the speech"
            subtitle="Stories aren’t decoration here. They set priorities."
            className="max-w-2xl"
          />
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/stories" variant="primary">
              Read stories
            </Button>
            <Button href="/editorial" variant="outline">
              Go deeper (editorial)
            </Button>
            <Link
              href="/stories#share"
              className="inline-flex items-center justify-center rounded-btn border-2 border-deep-soil/25 px-5 py-3 font-body text-sm font-semibold text-deep-soil hover:bg-deep-soil/[0.04]"
            >
              Share yours
            </Link>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Stay rooted"
        title="Organize like you live here—because you do"
        description="Local teams, trainings, gatherings—built for Arkansas scale and Arkansas pace."
        variant="primary-band"
      >
        <Button href="/local-organizing" variant="secondary">
          Local organizing hub
        </Button>
        <Button href="/events" variant="outline" className="border-cream-canvas/50 text-cream-canvas hover:bg-cream-canvas/10">
          Events
        </Button>
      </CTASection>
    </>
  );
}
