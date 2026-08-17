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
  title: "Why I’m Running",
  description:
    "Why Kelly Grappe is running for Arkansas Secretary of State: restore trust, partner with all 75 counties, and make the office work for the people it belongs to.",
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

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <p className="font-body text-lg font-semibold leading-relaxed text-kelly-navy md:text-xl">
            {c.intro}
          </p>
          <div className="mt-8 space-y-6 font-body text-lg leading-relaxed text-kelly-text/88">
            {c.paragraphs.map((p) => (
              <p key={p.slice(0, 56)}>{p}</p>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="what-ill-do">
        <ContentContainer className="max-w-3xl">
          <h2 id="what-ill-do" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            {c.whatIllDo.title}
          </h2>
          <ul className="mt-8 list-none space-y-6">
            {c.whatIllDo.items.map((item) => (
              <li
                key={item.title}
                className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-sm font-bold uppercase tracking-[0.14em] text-kelly-gold">
                  {item.title}
                </h3>
                <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/88 md:text-lg">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-10 font-body text-lg leading-relaxed text-kelly-navy md:text-xl">
            {c.whatIllDo.closer}
          </p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/about" variant="outline">
              Back to Meet Kelly
            </Button>
            <Button href="/priorities" variant="primary">
              See My Plan
            </Button>
            <Button href="/direct-democracy" variant="outline">
              Direct democracy
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
