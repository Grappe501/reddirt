import Link from "next/link";
import type { ReactNode } from "react";
import type { ToolkitGuide } from "@/content/resources/toolkit-guides";
import { volunteerPath, volunteersNote } from "@/content/resources/toolkit-guides";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { Button } from "@/components/ui/Button";

function VolunteerCtaBand({ slug, title, variant }: { slug: string; title: string; variant: "hero" | "inline" }) {
  const vUrl = volunteerPath(slug);
  if (variant === "hero") {
    return (
      <div className="mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button href={vUrl} variant="primary">
          Volunteer for this: {title}
        </Button>
        <Button href="/get-involved#join" variant="outline">
          Stay connected (general)
        </Button>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-card border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5 md:p-6">
      <p className="font-body text-sm font-semibold text-kelly-text">Ready to help with this work?</p>
      <p className="mt-1 font-body text-sm text-kelly-text/75">
        {volunteersNote} Use the same volunteer form everyone else does—we will tag it from this page.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button href={vUrl} variant="primary">
          Open volunteer form
        </Button>
        <Link href="/get-involved" className="font-body text-sm font-semibold text-kelly-navy underline">
          All other ways to get involved
        </Link>
      </div>
    </div>
  );
}

export function ToolkitGuideView({
  guide,
  insertBeforeGoDeeper,
}: {
  guide: ToolkitGuide;
  /** e.g. friend-invite scripts on the talking-about-kelly guide */
  insertBeforeGoDeeper?: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={guide.tag} title={guide.title} subtitle={guide.intro}>
        <div className="mt-2 max-w-2xl">
          <p className="font-body text-sm font-semibold uppercase tracking-wide text-kelly-text/60">You can do this</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-left font-body text-base text-kelly-text/80 md:text-lg">
            {guide.anyOneCan.map((line) => (
              <li key={line.slice(0, 40)}>{line}</li>
            ))}
          </ul>
          <VolunteerCtaBand slug={guide.slug} title={guide.title} variant="hero" />
        </div>
      </PageHero>

      <FullBleedSection padY aria-labelledby={`guide-body-${guide.slug}`}>
        <ContentContainer>
          <div className="max-w-3xl">
            <h2 className="sr-only" id={`guide-body-${guide.slug}`}>
              Guide: {guide.title}
            </h2>
            <div className="space-y-12">
              {guide.sections.map((s) => (
                <div key={s.heading}>
                  <h3 className="font-heading text-2xl font-bold text-kelly-text">{s.heading}</h3>
                  <div className="mt-4 space-y-4">
                    {s.paragraphs.map((p) => (
                      <p key={p.slice(0, 48)} className="font-body text-base leading-relaxed text-kelly-text/85 md:text-lg">
                        {p}
                      </p>
                    ))}
                    {s.bullets ? (
                      <ul className="list-disc space-y-2 pl-5 font-body text-base leading-relaxed text-kelly-text/85 md:text-lg">
                        {s.bullets.map((b) => (
                          <li key={b.slice(0, 40)}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                    {s.callout ? (
                      <p className="border-l-4 border-kelly-success/50 pl-4 font-body text-sm font-medium text-kelly-text/90 md:text-base">
                        {s.callout}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <VolunteerCtaBand slug={guide.slug} title={guide.title} variant="inline" />
          </div>
        </ContentContainer>
      </FullBleedSection>

      {insertBeforeGoDeeper}

      <FullBleedSection variant="subtle" padY aria-labelledby={`guide-deeper-${guide.slug}`}>
        <ContentContainer>
          <SectionHeading
            id={`guide-deeper-${guide.slug}`}
            align="left"
            eyebrow="Go deeper"
            title="Primary sources and next steps"
            subtitle="Use these when you are teaching, tabling, or writing a local letter to the editor."
          />
          <ul className="mt-6 max-w-2xl space-y-3 font-body text-base text-kelly-text/85">
            {guide.goDeeper.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-semibold text-kelly-navy hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/get-involved" className="font-semibold text-kelly-navy hover:underline">
                Get involved — all ways to help
              </Link>
            </li>
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
