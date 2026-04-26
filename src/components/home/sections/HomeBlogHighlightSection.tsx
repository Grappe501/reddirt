import Link from "next/link";
import Image from "next/image";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import type { HomepageBlogCard } from "@/lib/content/blog-public";

export function HomeBlogHighlightSection({ posts }: { posts: HomepageBlogCard[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="border-t border-civic-ink/8 bg-white py-section-y lg:py-section-y-lg" aria-labelledby="blog-highlight-heading">
      <ContentContainer>
        <FadeInWhenVisible className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-red-dirt">Writing</p>
            <h2 id="blog-highlight-heading" className="mt-3 font-heading text-2xl font-bold tracking-tight text-civic-ink md:text-3xl">
              Latest posts &amp; updates
            </h2>
          </div>
          <Link href="/blog" className="font-body text-sm font-semibold text-civic-blue hover:underline">
            View all →
          </Link>
        </FadeInWhenVisible>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <FadeInWhenVisible key={p.slug} delay={0.06 * i}>
              <Link href={p.href} className="group block h-full rounded-card border border-civic-ink/10 bg-civic-fog/30 p-5 transition hover:border-civic-gold/40 hover:bg-white hover:shadow-md">
                {p.imageSrc ? (
                  <div className="relative mb-4 aspect-video overflow-hidden rounded-md">
                    <Image src={p.imageSrc} alt={p.imageAlt ?? ""} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
                  </div>
                ) : null}
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-civic-slate/70">
                  {p.publishedAt
                    ? p.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Post"}
                </p>
                <h3 className="mt-2 font-heading text-lg font-bold text-civic-ink group-hover:text-red-dirt">{p.title}</h3>
                <p className="mt-2 line-clamp-3 font-body text-sm text-civic-slate/90">{p.excerpt}</p>
              </Link>
            </FadeInWhenVisible>
          ))}
        </div>
      </ContentContainer>
    </section>
  );
}
