import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { pageMeta } from "@/lib/seo/metadata";
import { listPublicExplainersMerged } from "@/lib/content/public-catalog";

export const metadata: Metadata = pageMeta({
  title: "Explainers",
  description:
    "Plain-language breakdowns of referendums, initiatives, bargaining, and organizing—Arkansas-rooted, jargon-light.",
  path: "/explainers",
  imageSrc: "/media/placeholders/explainer-steps.svg",
});

export default async function ExplainersIndexPage() {
  const allExplainers = await listPublicExplainersMerged();
  const hasExplainers = allExplainers.length > 0;

  return (
    <>
      {/*
        TODO: Deeper SOS-specific explainer series (optional) — align with `/understand` office gateway over time.
        TODO: No automated social/video ingestion on this page yet.
      */}
      <PageHero
        tone="plan"
        eyebrow="Clarity"
        title="Explainers"
        subtitle="Plain-language guides to the Secretary of State’s office, ballot access, public records, elections, and how Arkansans can participate—built for neighbors who deserve to understand the rules without being talked down to."
      />

      <FullBleedSection padY>
        <ContentContainer wide>
          {hasExplainers ? (
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {allExplainers.map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/explainers/${e.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-kelly-success/35"
                  >
                    <ContentImage media={e.image} className="aspect-[16/10] max-h-[220px]" />
                    <div className="flex flex-1 flex-col p-6 md:p-7">
                      <p className="font-body text-[11px] font-bold uppercase tracking-wider text-kelly-success">{e.category}</p>
                      <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-text group-hover:text-kelly-navy">
                        {e.title}
                      </h2>
                      <p className="mt-3 flex-1 font-body text-base text-kelly-text/75">{e.summary}</p>
                      <p className="mt-4 font-body text-sm font-semibold text-kelly-text/55">
                        {e.steps.length} steps · FAQ inside
                      </p>
                      <span className="mt-4 font-body text-sm font-semibold text-kelly-navy">Open explainer →</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mx-auto max-w-2xl rounded-card border border-dashed border-kelly-text/20 bg-white/85 p-10 text-center shadow-sm">
              <h2 className="font-heading text-lg font-bold text-kelly-ink md:text-xl">Explainers on the way</h2>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">
                Explainers will appear here as they are published.
              </p>
              <p className="mt-6 font-body text-sm text-kelly-text/65">
                <Link href="/understand" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                  Understand the Office
                </Link>{" "}
                ·{" "}
                <Link href="/from-the-road" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                  From the Road
                </Link>
              </p>
            </div>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
