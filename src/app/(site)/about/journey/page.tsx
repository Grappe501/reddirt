import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { Button } from "@/components/ui/Button";
import { MeetKellySubnav } from "@/components/about/MeetKellySubnav";
import { ContentPendingBadge } from "@/components/content/ContentPendingBadge";
import { meetKellyJourneyCopy } from "@/content/about/meet-kelly-pages";
import { pageMeta } from "@/lib/seo/metadata";
import { showPublicBiographyManuscript } from "@/config/public-biography-depth";

export const dynamic = "force-dynamic";

const c = meetKellyJourneyCopy;

export const metadata: Metadata = pageMeta({
  title: "Kelly's journey",
  description:
    "Kelly Grappe's life story—Arkansas roots, career, family, and the lessons that shape her run for Secretary of State. Campaign-facing chapters; manuscript draft until review.",
  path: "/about/journey",
  imageSrc: "/media/placeholders/texture-porch-glow.svg",
});

function statusBadge(status: (typeof c.arcs)[number]["status"]) {
  switch (status) {
    case "DRAFT":
      return <ContentPendingBadge variant="draft" />;
    case "NEEDS SOURCE":
      return <ContentPendingBadge variant="source" />;
    default:
      return <ContentPendingBadge variant="pending" />;
  }
}

export default function AboutJourneyPage() {
  return (
    <>
      <PageHero eyebrow={c.hero.eyebrow} title={c.hero.title} subtitle={c.hero.subtitle}>
        <Button href="/about" variant="outline">
          Meet Kelly overview
        </Button>
        <Button href="/about/community" variant="outline">
          Community work
        </Button>
      </PageHero>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer className="max-w-3xl">
          <MeetKellySubnav current="/about/journey" />
          <div className="mt-10 space-y-8">
            {c.arcs.map((arc) => (
              <article
                key={arc.title}
                className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-heading text-xl font-bold text-kelly-text">{arc.title}</h2>
                  {statusBadge(arc.status)}
                </div>
                <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/85">{arc.body}</p>
                {arc.href && arc.hrefLabel ? (
                  <Link
                    href={arc.href}
                    className="mt-4 inline-block font-body text-sm font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
                  >
                    {arc.hrefLabel} →
                  </Link>
                ) : showPublicBiographyManuscript() ? (
                  <Link
                    href="/biography"
                    className="mt-4 inline-block font-body text-sm font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
                  >
                    Literary biography →
                  </Link>
                ) : null}
              </article>
            ))}
          </div>

          <section className="mt-14" aria-labelledby="journey-learnings">
            <h2 id="journey-learnings" className="font-heading text-2xl font-bold text-kelly-text">
              What she learned along the way
            </h2>
            <ul className="mt-6 list-disc space-y-3 pl-5 font-body text-base leading-relaxed text-kelly-text/85">
              {c.learnings.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
