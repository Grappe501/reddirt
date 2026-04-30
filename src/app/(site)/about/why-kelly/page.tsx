import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";
import { whyKellyPageCopy } from "@/content/about/why-kelly-page";

const c = whyKellyPageCopy;

export const metadata: Metadata = pageMeta({
  title: "Why Kelly — Arkansas elections belong to Arkansans",
  description:
    "Why Kelly Grappe entered the Secretary of State race: lawful, transparent elections administered for Arkansas voters—non-partisan administration and holding the line under state law.",
  path: "/about/why-kelly",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function WhyKellyPage() {
  return (
    <>
      <PageHero eyebrow="Meet Kelly" title={c.hero.title} subtitle={c.hero.subtitle}>
        <Button href="/about" variant="outline">
          Meet Kelly overview
        </Button>
        <Button href="/understand" variant="outline">
          Understand the office
        </Button>
        <Button href="/biography" variant="outline">
          Full biography
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY aria-labelledby="why-kelly-why-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="why-kelly-why-heading" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            {c.why.title}
          </h2>
          <div className="mt-8 space-y-6 font-body text-lg leading-relaxed text-kelly-text/88">
            {c.why.paragraphs.map((p, i) => (
              <p key={`why-${i}`}>{p}</p>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="why-kelly-how-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="why-kelly-how-heading" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            {c.how.title}
          </h2>
          <div className="mt-8 space-y-5 font-body text-lg leading-relaxed text-kelly-text/88">
            {c.how.paragraphs.map((p, i) => (
              <p key={`how-${i}`}>{p}</p>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="why-kelly-what-heading">
        <ContentContainer>
          <h2 id="why-kelly-what-heading" className="mx-auto max-w-3xl font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            {c.what.title}
          </h2>
          <ul className="mt-10 grid list-none gap-6 md:grid-cols-3">
            {c.what.cards.map((card) => (
              <li
                key={card.title}
                className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
              >
                <h3 className="font-heading text-lg font-bold text-kelly-navy">{card.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{card.body}</p>
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-12 max-w-3xl border-l-4 border-kelly-gold/70 pl-6 font-body text-lg font-medium leading-relaxed text-kelly-text">
            {c.roadLine}
          </p>
          <p className="mx-auto mt-10 max-w-3xl text-center font-body text-sm text-kelly-text/70">
            <span className="font-semibold text-kelly-navy">People over Politics.</span>{" "}
            <span className="text-kelly-text/80">Non-partisan administration under the law.</span>
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button href="/about" variant="outline">
              Back to Meet Kelly
            </Button>
            <Button href="/priorities" variant="outline">
              Office priorities
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
