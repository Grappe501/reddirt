import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { ContentPendingBadge } from "@/components/content/ContentPendingBadge";
import { whyKellyPageCopy } from "@/content/about/why-kelly-page";
import { pageMeta } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

const c = whyKellyPageCopy;

export const metadata: Metadata = pageMeta({
  title: "Why I'm running",
  description:
    "Why Kelly Grappe entered the Secretary of State race: lawful, transparent elections administered for Arkansas voters—non-partisan administration under state law.",
  path: "/about/why-im-running",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

export default function WhyImRunningPage() {
  return (
    <>
      <PageHero eyebrow="Meet Kelly" title="Why I'm running" subtitle={c.hero.subtitle}>
        <Button href="/about" variant="outline">
          Meet Kelly overview
        </Button>
        <Button href="/about/why-secretary-of-state" variant="outline">
          Why this office
        </Button>
        <Button href="/understand" variant="outline">
          Understand the office
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" className="!py-6">
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about/why-im-running" />
          <div className="mt-6">
            <ContentPendingBadge variant="pending" />
            <p className="mt-3 font-body text-sm text-kelly-muted">
              Election-administration and voter-list claims on this page need Kelly approval and primary-source
              verification before paid or high-reach use. See{" "}
              <code className="text-xs">docs/website/KELLY_BIOGRAPHY_VERIFICATION_MATRIX.md</code>.
            </p>
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="why-running-why-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="why-running-why-heading" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            {c.why.title}
          </h2>
          <div className="mt-8 space-y-6 font-body text-lg leading-relaxed text-kelly-text/88">
            {c.why.paragraphs.map((p, i) => (
              <p key={`why-${i}`}>{p}</p>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="why-running-how-heading">
        <ContentContainer className="max-w-3xl">
          <h2 id="why-running-how-heading" className="font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
            {c.how.title}
          </h2>
          <div className="mt-8 space-y-5 font-body text-lg leading-relaxed text-kelly-text/88">
            {c.how.paragraphs.map((p, i) => (
              <p key={`how-${i}`}>{p}</p>
            ))}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="why-running-what-heading">
        <ContentContainer>
          <h2
            id="why-running-what-heading"
            className="mx-auto max-w-3xl font-heading text-2xl font-bold text-kelly-navy md:text-3xl"
          >
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
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
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
