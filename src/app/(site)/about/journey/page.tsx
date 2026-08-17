import type { Metadata } from "next";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { meetKellyJourneyCopy } from "@/content/about/meet-kelly-pages";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const c = meetKellyJourneyCopy;

export const metadata: Metadata = pageMeta({
  title: "Her journey",
  description:
    "Kelly Grappe’s journey — from Selmer and Sylvan Hills to operations leadership, Forevermost Farms, and public service.",
  path: "/about/journey",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default async function AboutJourneyPage() {
  return (
    <>
      <MediaPageHero
        slotKey="journey.hero"
        layout="split"
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        subtitle={c.hero.subtitle}
      >
        <Button href="/about" variant="primary">
          Meet Kelly
        </Button>
        <Button href="/about/why-im-running" variant="outlineOnDark">
          Why I’m running
        </Button>
        <Button href="/direct-democracy/ballot-initiative-process" variant="outlineOnDark">
          How initiatives work
        </Button>
      </MediaPageHero>

      <FullBleedSection variant="subtle" className="!py-6">
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about/journey" />
        </ContentContainer>
      </FullBleedSection>

      {c.arcs.map((arc, index) => (
        <FullBleedSection
          key={arc.title}
          variant={index % 2 === 0 ? "subtle" : "default"}
          padY
          aria-labelledby={`journey-arc-${index}`}
        >
          <ContentContainer className="max-w-3xl">
            <h2 id={`journey-arc-${index}`} className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
              {arc.title}
            </h2>
            <div className="mt-8 space-y-6 font-body text-lg leading-relaxed text-kelly-text/88">
              {arc.paragraphs.map((p) => (
                <p key={p.slice(0, 56)}>{p}</p>
              ))}
            </div>
          </ContentContainer>
        </FullBleedSection>
      ))}

      <FullBleedSection padY aria-labelledby="journey-learnings">
        <ContentContainer className="max-w-3xl">
          <h2 id="journey-learnings" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            {c.learnings.title}
          </h2>
          <ul className="mt-8 list-none space-y-4">
            {c.learnings.items.map((item) => (
              <li key={item.slice(0, 40)} className="flex gap-3 font-body text-lg leading-relaxed text-kelly-text/88">
                <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-kelly-gold" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
