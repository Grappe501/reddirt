import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { StoryCard } from "@/components/blocks/StoryCard";
import { listPublicBlogPosts, toBlogCard } from "@/lib/content/blog-public";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Writing",
  description:
    "Essays and updates from Kelly’s Substack—browse summaries here, then read the full piece where it was published.",
  path: "/blog",
  imageSrc: "/media/placeholders/editorial-ink-field.svg",
});

export default async function BlogIndexPage() {
  const posts = await listPublicBlogPosts();
  const cards = posts.map(toBlogCard);

  return (
    <>
      <PageHero
        eyebrow="Writing"
        title="Movement writing"
        subtitle="These pieces start on Substack. We share short summaries here so you can browse in one place—then open the full essay where it was published."
      />

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          {cards.length === 0 ? (
            <div className="rounded-card border border-dashed border-kelly-text/25 bg-kelly-page/80 p-10 text-center">
              <p className="font-heading text-lg font-bold text-kelly-text">New posts soon</p>
              <p className="mt-3 font-body text-kelly-text/70">
                Longer writing from the trail is on Substack—use the link in the site footer when you want the full feed.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((p) => (
                <li key={p.slug}>
                  <StoryCard
                    title={p.title}
                    excerpt={p.excerpt}
                    href={p.href}
                    meta={
                      p.publishedAt
                        ? p.publishedAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : undefined
                    }
                    imageSrc={p.imageSrc}
                    imageAlt={p.imageAlt}
                    ctaLabel="Read summary"
                  />
                </li>
              ))}
            </ul>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}
