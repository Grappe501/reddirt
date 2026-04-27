import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { DocumentBody } from "@/components/content/DocumentBody";
import { ContentImage } from "@/components/media/ContentImage";
import { StoryCard } from "@/components/blocks/StoryCard";
import { CTASection } from "@/components/blocks/CTASection";
import { Button } from "@/components/ui/Button";
import { listStorySlugs } from "@/content/stories";
import { relatedByTags } from "@/lib/content/related";
import { getPublicStoryBySlug, listPublicStoriesMerged } from "@/lib/content/public-catalog";
import { articleMeta } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listStorySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublicStoryBySlug(slug);
  if (!story) return { title: "Story" };
  return articleMeta({
    title: story.title,
    description: story.summary,
    path: `/stories/${story.slug}`,
    imageSrc: story.image.src,
    publishedTime: story.publishedAt,
  });
}

export default async function StoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = await getPublicStoryBySlug(slug);
  if (!story) notFound();

  const bySlug = (
    await Promise.all(story.relatedSlugs.map((s) => getPublicStoryBySlug(s)))
  ).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const visibleStories = await listPublicStoriesMerged();
  const byTags = relatedByTags(story, visibleStories, { limit: 3, excludeSlug: story.slug });
  const related = bySlug.length ? bySlug.slice(0, 3) : byTags;
  const narrativeSource = story.narrativeSource ?? "example";

  return (
    <>
      <FullBleedSection padY={false} className="border-b border-kelly-text/10">
        <div className="relative mx-auto w-full max-w-[100vw]">
          <ContentImage media={story.image} priority warmOverlay className="max-h-[min(70vh,640px)] w-full" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-kelly-page via-kelly-page/20 to-transparent" aria-hidden />
        </div>
        <ContentContainer className="relative -mt-24 pb-12 lg:-mt-28 lg:pb-16">
          <p
            className={
              narrativeSource === "real"
                ? "inline-block rounded-full border border-emerald-700/30 bg-emerald-50 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-900"
                : "inline-block rounded-full border border-kelly-text/15 bg-kelly-text/[0.05] px-3 py-1 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-text/70"
            }
          >
            {narrativeSource === "real" ? "Real story — verified" : "Example story — illustrative composite"}
          </p>
          <p className="mt-3 font-body text-xs font-bold uppercase tracking-[0.22em] text-kelly-navy">
            {story.categoryLabel} · {story.dek ?? story.category}
          </p>
          <h1 className="mt-4 max-w-4xl font-heading text-[clamp(1.75rem,4vw,3rem)] font-bold leading-tight text-kelly-text">
            {story.title}
          </h1>
          <p className="mt-6 max-w-3xl font-body text-xl leading-relaxed text-kelly-text/85">{story.summary}</p>
          <time className="mt-4 block font-body text-sm text-kelly-text/55" dateTime={story.publishedAt}>
            {new Date(story.publishedAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection variant="subtle" padY>
        <ContentContainer>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
            <div>
              <DocumentBody blocks={story.body} />
            </div>
            {story.quotePullouts?.length ? (
              <aside className="space-y-6 lg:sticky lg:top-28">
                {story.quotePullouts.map((q) => (
                  <figure
                    key={q.quote}
                    className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)]"
                  >
                    <blockquote className="font-heading text-lg font-bold leading-snug text-kelly-text">
                      “{q.quote}”
                    </blockquote>
                    {q.attribution ? (
                      <figcaption className="mt-3 font-body text-xs font-semibold uppercase tracking-wider text-kelly-text/50">
                        {q.attribution}
                      </figcaption>
                    ) : null}
                  </figure>
                ))}
              </aside>
            ) : null}
          </div>
        </ContentContainer>
      </FullBleedSection>

      <FullBleedSection padY aria-labelledby="related-stories-heading">
        <ContentContainer wide>
          <h2 id="related-stories-heading" className="font-heading text-2xl font-bold text-kelly-text">
            Related stories
          </h2>
          <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
            Picked by shared tags and field relationships—not an algorithm trying to keep you scrolling.
          </p>
          <ul className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            {related.map((s) => (
              <li key={s.slug}>
                <StoryCard
                  title={s.title}
                  excerpt={s.summary}
                  href={`/stories/${s.slug}`}
                  meta={s.categoryLabel}
                  imageSrc={s.image.src}
                  imageAlt={s.image.alt}
                />
              </li>
            ))}
          </ul>
        </ContentContainer>
      </FullBleedSection>

      <CTASection
        eyebrow="Your turn"
        title="The movement needs your sentence, not your perfection"
        description="If something in this story echoed your kitchen table, tell us. We protect privacy, we verify consent, and we never strip your truth for a headline."
        variant="primary-band"
      >
        <Button href="/stories#share" variant="secondary">
          Share a story
        </Button>
        <Button href="/local-organizing" variant="outline" className="border-kelly-page/50 text-kelly-page hover:bg-kelly-page/10">
          Organize locally
        </Button>
      </CTASection>
    </>
  );
}
