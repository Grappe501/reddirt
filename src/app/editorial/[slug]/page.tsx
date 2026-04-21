import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { EditorialSections } from "@/components/content/EditorialSections";
import { articleMeta } from "@/lib/seo/metadata";
import { listEditorialSlugs } from "@/content/editorial";
import { relatedByTags } from "@/lib/content/related";
import { getPublicEditorialBySlug, listPublicEditorialMerged } from "@/lib/content/public-catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listEditorialSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const piece = await getPublicEditorialBySlug(slug);
  if (!piece) return { title: "Editorial" };
  return articleMeta({
    title: piece.title,
    description: piece.summary,
    path: `/editorial/${piece.slug}`,
    imageSrc: piece.image.src,
    publishedTime: piece.publishedAt,
  });
}

export default async function EditorialDetailPage({ params }: Props) {
  const { slug } = await params;
  const piece = await getPublicEditorialBySlug(slug);
  if (!piece) notFound();

  const bySlug = (
    await Promise.all(piece.relatedSlugs.map((s) => getPublicEditorialBySlug(s)))
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const visible = await listPublicEditorialMerged();
  const byTags = relatedByTags(piece, visible, { limit: 3, excludeSlug: piece.slug });
  const related = bySlug.length ? bySlug.slice(0, 3) : byTags;

  return (
    <>
      <FullBleedSection padY={false} className="border-b border-deep-soil/10">
        <div className="relative">
          <ContentImage media={piece.image} priority warmOverlay className="max-h-[min(55vh,520px)] w-full" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cream-canvas via-cream-canvas/30 to-transparent" aria-hidden />
        </div>
        <ContentContainer className="relative -mt-20 pb-12 lg:-mt-24">
          <p className="font-body text-xs font-bold uppercase tracking-[0.22em] text-red-dirt">{piece.category}</p>
          <h1 className="mt-4 max-w-4xl font-heading text-[clamp(1.85rem,4vw,3.25rem)] font-bold leading-tight text-deep-soil">
            {piece.title}
          </h1>
          <p className="mt-6 max-w-3xl font-body text-xl leading-relaxed text-deep-soil/85">{piece.summary}</p>
          <time className="mt-4 block font-body text-sm text-deep-soil/55" dateTime={piece.publishedAt}>
            {new Date(piece.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer>
          <EditorialSections sections={piece.sections} />
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="related-editorial-heading">
        <ContentContainer>
          <h2 id="related-editorial-heading" className="font-heading text-2xl font-bold text-deep-soil">
            Related essays
          </h2>
          <ul className="mt-8 space-y-4">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/editorial/${p.slug}`}
                  className="block rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-5 font-heading text-lg font-bold text-deep-soil shadow-[var(--shadow-soft)] hover:border-red-dirt/25"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
