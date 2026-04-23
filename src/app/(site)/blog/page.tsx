import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { StoryCard } from "@/components/blocks/StoryCard";
import { listPublicBlogPosts, toBlogCard } from "@/lib/content/blog-public";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Notebook",
  description:
    "Movement writing syndicated from Substack—summaries on-site, full essays at the canonical link.",
  path: "/blog",
  imageSrc: "/media/placeholders/editorial-ink-field.svg",
});

export default async function BlogIndexPage() {
  const posts = await listPublicBlogPosts();
  const cards = posts.map(toBlogCard);

  return (
    <>
      <PageHero
        eyebrow="Notebook"
        title="Movement writing"
        subtitle="These pieces originate on Substack. We mirror summaries here so neighbors can browse without leaving the movement site—then read the full essay where it lives."
      />

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          {cards.length === 0 ? (
            <div className="rounded-card border border-dashed border-deep-soil/25 bg-cream-canvas/80 p-10 text-center">
              <p className="font-heading text-lg font-bold text-deep-soil">New posts soon</p>
              <p className="mt-3 font-body text-deep-soil/70">
                Longer writing from the trail is also on our notebook—use the Substack link in the site footer when you want
                the full feed.
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
