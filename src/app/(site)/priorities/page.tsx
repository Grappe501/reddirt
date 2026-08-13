import type { Metadata } from "next";
import Link from "next/link";
import { MediaPageHero } from "@/components/blocks/MediaPageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { prioritiesLaunchCopy } from "@/content/website/priorities-launch";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "My Plan",
  description:
    "Kelly Grappe’s plan for Arkansas Secretary of State: restore trust in elections, protect the people’s constitutional voice, support all 75 counties, and make government work better for people.",
  path: "/priorities",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

const c = prioritiesLaunchCopy;

export default async function PrioritiesPage() {
  return (
    <>
      <MediaPageHero
        slotKey="priorities.hero"
        layout="split"
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        subtitle={c.hero.subtitle}
      >
        <Button href="/kelly-speaks" variant="primary">
          Campaign Videos
        </Button>
        <Button href="/direct-democracy/ballot-initiative-process" variant="outlineOnDark">
          Learn How Direct Democracy Works →
        </Button>
      </MediaPageHero>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <p className="rounded-card border border-kelly-gold/30 bg-kelly-gold/10 px-5 py-4 font-body text-sm leading-relaxed text-kelly-navy">
            <strong className="font-semibold">Limits of the office. </strong>
            {c.authorityNote}
          </p>
          <nav aria-label="My Plan sections" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {c.pillars.map((pillar) => (
                <li key={pillar.id}>
                  <a
                    href={`#${pillar.id}`}
                    className="inline-flex rounded-full border border-kelly-navy/20 bg-white px-3 py-2 font-body text-xs font-semibold text-kelly-navy hover:border-kelly-navy/40"
                  >
                    {pillar.number}. {pillar.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </ContentContainer>
      </FullBleedSection>

      {c.pillars.map((pillar, index) => (
        <FullBleedSection key={pillar.id} id={pillar.id} variant={index % 2 === 0 ? "default" : "subtle"} padY>
          <ContentContainer className="max-w-3xl">
            <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-kelly-gold">
              Priority {pillar.number}
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-ink md:text-3xl">{pillar.title}</h2>

            <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-kelly-slate">
              {pillar.intro.map((p) => (
                <p key={p.slice(0, 56)}>{p}</p>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              {pillar.subsections.map((sub) => (
                <details
                  key={sub.heading}
                  className="rounded-card border border-kelly-ink/10 bg-white p-5 shadow-sm open:shadow-md"
                >
                  <summary className="cursor-pointer font-heading text-lg font-bold text-kelly-navy">
                    {sub.heading}
                  </summary>
                  <div className="mt-4 space-y-4 font-body text-base leading-relaxed text-kelly-slate">
                    {sub.paragraphs.map((p) => (
                      <p key={p.slice(0, 56)}>{p}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            {"cta" in pillar && pillar.cta ? (
              <div className="mt-8">
                <Button href={pillar.cta.href} variant="primary">
                  {pillar.cta.label}
                </Button>
              </div>
            ) : null}
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
            Official voter resources:{" "}
            <Link href="/voter-registration" className="font-semibold text-kelly-gold underline-offset-2 hover:underline">
              Register / check registration
            </Link>
          </p>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
