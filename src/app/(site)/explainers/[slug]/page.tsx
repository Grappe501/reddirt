import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { ProcessSteps } from "@/components/blocks/ProcessSteps";
import { FAQAccordion } from "@/components/organizing/FAQAccordion";
import { articleMeta } from "@/lib/seo/metadata";
import { listExplainerSlugs } from "@/content/explainers";
import { relatedByTags } from "@/lib/content/related";
import { getPublicExplainerBySlug, listPublicExplainersMerged } from "@/lib/content/public-catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listExplainerSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ex = await getPublicExplainerBySlug(slug);
  if (!ex) return { title: "Explainer" };
  return articleMeta({
    title: ex.title,
    description: ex.summary,
    path: `/explainers/${ex.slug}`,
    imageSrc: ex.image.src,
    publishedTime: ex.publishedAt,
  });
}

export default async function ExplainerDetailPage({ params }: Props) {
  const { slug } = await params;
  const ex = await getPublicExplainerBySlug(slug);
  if (!ex) notFound();

  const bySlug = (
    await Promise.all(ex.relatedSlugs.map((s) => getPublicExplainerBySlug(s)))
  ).filter((e): e is NonNullable<typeof e> => Boolean(e));
  const visible = await listPublicExplainersMerged();
  const byTags = relatedByTags(ex, visible, { limit: 3, excludeSlug: ex.slug });
  const related = bySlug.length ? bySlug.slice(0, 3) : byTags;

  const steps = ex.steps.map((s, i) => ({
    step: i + 1,
    title: s.title,
    description: s.body,
  }));

  return (
    <>
      <FullBleedSection padY={false} className="border-b border-kelly-text/10">
        <ContentImage media={ex.image} priority warmOverlay className="max-h-[min(48vh,440px)] w-full" />
        <ContentContainer className="py-10 lg:py-14">
          <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-kelly-navy">{ex.category}</p>
          <h1 className="mt-4 max-w-4xl font-heading text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight text-kelly-text">
            {ex.title}
          </h1>
          <p className="mt-6 max-w-3xl font-body text-xl leading-relaxed text-kelly-text/85">{ex.summary}</p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer>
          <p className="max-w-3xl font-body text-lg leading-relaxed text-kelly-text/85">{ex.intro}</p>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="steps-heading">
        <ContentContainer wide>
          <h2 id="steps-heading" className="font-heading text-2xl font-bold text-kelly-text">
            Step-by-step
          </h2>
          <ProcessSteps className="mt-10" steps={steps} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="explainer-faq-heading">
        <ContentContainer>
          <h2 id="explainer-faq-heading" className="font-heading text-2xl font-bold text-kelly-text">
            FAQ
          </h2>
          <FAQAccordion className="mt-8 max-w-3xl" items={ex.faq} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="related-links-heading">
        <ContentContainer>
          <h2 id="related-links-heading" className="font-heading text-2xl font-bold text-kelly-text">
            Related links
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {ex.relatedLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex rounded-full border border-kelly-text/15 bg-kelly-text/[0.04] px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:border-kelly-navy/30"
                >
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY aria-labelledby="related-explainers-heading">
        <ContentContainer>
          <h2 id="related-explainers-heading" className="font-heading text-xl font-bold text-kelly-text">
            Related explainers
          </h2>
          <ul className="mt-6 space-y-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/explainers/${r.slug}`} className="font-body text-base font-semibold text-kelly-navy hover:underline">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
