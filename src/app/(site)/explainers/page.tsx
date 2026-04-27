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

  return (
    <>
      <PageHero
        tone="plan"
        eyebrow="Clarity"
        title="Explainers"
        subtitle="Complex doesn’t have to mean confusing. These pieces are built for neighbors who deserve to understand the rules without being talked down to—or scared into silence."
      />

      <FullBleedSection padY>
        <ContentContainer wide>
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
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
