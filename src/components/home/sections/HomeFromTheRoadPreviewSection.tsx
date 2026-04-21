import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";
import type { RoadPostCard } from "@/lib/content/content-hub-queries";
import { roadPostExcerpt, roadPostImageSrc } from "@/lib/content/content-hub-queries";
import { ContentLocality } from "@/components/content/ContentLocality";

export type HomeFromTheRoadPreviewSectionProps = {
  posts: RoadPostCard[];
};

function locality(post: RoadPostCard): string | null {
  const parts = [post.countySlug, post.city].filter((p): p is string => Boolean(p?.trim()));
  return parts.length ? parts.join(" · ") : null;
}

export function HomeFromTheRoadPreviewSection({ posts }: HomeFromTheRoadPreviewSectionProps) {
  if (!posts.length) return null;

  return (
    <section className="bg-civic-fog py-section-y lg:py-section-y-lg" aria-labelledby="road-preview-heading">
      <ContentContainer>
        <FadeInWhenVisible className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-civic-gold">From the road</p>
          <h2
            id="road-preview-heading"
            className="mt-4 font-heading text-[clamp(1.55rem,3vw,2.15rem)] font-bold text-civic-ink"
          >
            Latest stops &amp; notebook entries
          </h2>
          <p className="mt-4 font-body text-lg text-civic-slate">
            Campaign movement across Arkansas—readable here first, sourced from the trail notebook.
          </p>
        </FadeInWhenVisible>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => {
            const img = roadPostImageSrc(post);
            const excerpt = roadPostExcerpt(post);
            const date =
              post.publishedAt?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }) ?? "";
            return (
              <FadeInWhenVisible key={post.id} delay={0.04 * i}>
                <article
                  className={cn(
                    "flex h-full flex-col overflow-hidden rounded-card border border-civic-ink/10 bg-white shadow-sm transition",
                    "hover:border-civic-gold/35 hover:shadow-md",
                  )}
                >
                  <Link href={`/from-the-road#post-${post.slug}`} className="block shrink-0">
                    <div className="relative aspect-[16/10] bg-civic-midnight/10">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-civic-blue/25 to-civic-midnight/40 font-body text-xs text-civic-mist/80">
                          Notebook
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    {date ? (
                      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-civic-slate/55">{date}</p>
                    ) : null}
                    <ContentLocality countySlug={post.countySlug} city={post.city} variant="compact" />
                    <h3 className="mt-2 font-heading text-lg font-bold leading-snug text-civic-ink">
                      <Link href={post.canonicalUrl} target="_blank" rel="noreferrer" className="hover:text-civic-blue">
                        {post.title}
                      </Link>
                    </h3>
                    {excerpt ? (
                      <p className="mt-2 line-clamp-3 flex-1 font-body text-sm leading-relaxed text-civic-slate">{excerpt}</p>
                    ) : null}
                    <Link
                      href={post.canonicalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-bold uppercase tracking-wider text-civic-blue hover:underline"
                    >
                      Read entry →
                    </Link>
                  </div>
                </article>
              </FadeInWhenVisible>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/from-the-road"
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-civic-ink/20 px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-ink transition hover:border-civic-gold hover:bg-white"
          >
            Open From the Road
          </Link>
        </div>
      </ContentContainer>
    </section>
  );
}
