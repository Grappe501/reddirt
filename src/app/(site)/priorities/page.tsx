import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { prioritiesLaunchCopy } from "@/content/website/priorities-launch";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Kelly’s Priorities",
  description:
    "What the Arkansas Secretary of State can deliver — elections, business filings, transparency, and Capitol stewardship — with clear limits of the office.",
  path: "/priorities",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

const c = prioritiesLaunchCopy;

export default function PrioritiesPage() {
  return (
    <>
      <PageHero tone="plan" eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
        <Button href="/understand" variant="primary">
          Understand the office
        </Button>
        <Button href="/about" variant="outlineOnDark">
          Read Kelly’s Story
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <p className="rounded-card border border-kelly-gold/30 bg-kelly-gold/10 px-5 py-4 font-body text-sm leading-relaxed text-kelly-navy">
            <strong className="font-semibold">Authority note.</strong> {c.authorityNote}
          </p>
        </ContentContainer>
      </FullBleedSection>

      {c.pillars.map((pillar, index) => (
        <FullBleedSection key={pillar.id} variant={index % 2 === 0 ? "default" : "subtle"} padY>
          <ContentContainer className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{pillar.title}</h2>

            <h3 className="mt-8 font-heading text-lg font-bold text-kelly-navy">What the issue is</h3>
            <p className="mt-2 font-body text-base leading-relaxed text-kelly-slate">{pillar.issue}</p>

            <h3 className="mt-6 font-heading text-lg font-bold text-kelly-navy">Why Arkansans should care</h3>
            <p className="mt-2 font-body text-base leading-relaxed text-kelly-slate">{pillar.whyCare}</p>

            <h3 className="mt-6 font-heading text-lg font-bold text-kelly-navy">
              What the Secretary of State can actually influence
            </h3>
            <p className="mt-2 font-body text-base leading-relaxed text-kelly-slate">{pillar.officeRole}</p>

            <h3 className="mt-6 font-heading text-lg font-bold text-kelly-navy">Kelly’s position</h3>
            <p className="mt-2 font-body text-base leading-relaxed text-kelly-slate">{pillar.position}</p>

            <h3 className="mt-6 font-heading text-lg font-bold text-kelly-navy">What Kelly would do</h3>
            <ul className="mt-3 list-none space-y-2">
              {pillar.wouldDo.map((item) => (
                <li
                  key={item}
                  className="relative pl-4 font-body text-sm leading-relaxed text-kelly-slate before:absolute before:left-0 before:top-[0.55em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-kelly-gold"
                >
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="mt-6 font-heading text-lg font-bold text-kelly-navy">Limits of the office</h3>
            <p className="mt-2 font-body text-base leading-relaxed text-kelly-slate">{pillar.limits}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={pillar.relatedOfficeHref} variant="outline">
                {pillar.relatedOfficeLabel}
              </Button>
              <Button href={pillar.nextAction.href} variant="primary">
                {pillar.nextAction.label}
              </Button>
            </div>
          </ContentContainer>
        </FullBleedSection>
      ))}

      <FullBleedSection variant="primary-band" padY>
        <ContentContainer className="max-w-3xl text-center text-white">
          <h2 className="font-heading text-2xl font-bold md:text-3xl">{c.closing.title}</h2>
          <p className="mt-4 font-body text-lg text-white/90">{c.closing.body}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            {c.closing.ctas.map((cta) => (
              <Button
                key={cta.href}
                href={cta.href}
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                {cta.label}
              </Button>
            ))}
          </div>
          <p className="mt-8 font-body text-sm text-white/70">
            Related campaign statement:{" "}
            <Link href="/#primary-message" className="font-semibold text-kelly-gold underline-offset-2 hover:underline">
              Watch Kelly’s Message
            </Link>
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
