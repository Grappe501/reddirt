import type { Metadata } from "next";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { whyKellyPageCopy } from "@/content/about/why-kelly-page";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const c = whyKellyPageCopy;

export const metadata: Metadata = pageMeta({
  title: "Why I’m running",
  description:
    "Why Kelly Grappe is running for Arkansas Secretary of State: restore trust, protect the people’s constitutional voice, and make the office work for the people it belongs to.",
  path: "/about/why-im-running",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default async function WhyImRunningPage() {
  return (
    <>
      <MediaPageHero
        slotKey="why.hero"
        layout="split"
        eyebrow="Meet Kelly"
        title={c.hero.title}
        subtitle={c.hero.subtitle}
      >
        <Button href="/about" variant="outlineOnDark">
          Meet Kelly
        </Button>
        <Button href="/priorities" variant="outlineOnDark">
          See My Plan
        </Button>
        <Button href="/understand" variant="outlineOnDark">
          What the office does
        </Button>
      </MediaPageHero>

      <FullBleedSection variant="subtle" className="!py-6">
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about/why-im-running" />
        </ContentContainer>
      </FullBleedSection>

      {c.sections.map((section, index) => (
        <FullBleedSection
          key={section.title}
          variant={index % 2 === 0 ? "subtle" : "default"}
          padY
          aria-labelledby={`why-running-${index}`}
        >
          <ContentContainer className="max-w-3xl">
            <h2 id={`why-running-${index}`} className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
              {section.title}
            </h2>
            <div className="mt-8 space-y-6 font-body text-lg leading-relaxed text-kelly-text/88">
              {section.paragraphs.map((p) => (
                <p key={p.slice(0, 56)}>{p}</p>
              ))}
            </div>
          </ContentContainer>
        </FullBleedSection>
      ))}

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/about" variant="outline">
              Back to Meet Kelly
            </Button>
            <Button href="/priorities" variant="primary">
              See My Plan
            </Button>
            <Button href="/direct-democracy/ballot-initiative-process" variant="outline">
              Learn How Direct Democracy Works →
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
