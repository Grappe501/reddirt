import type { Metadata } from "next";
import Link from "next/link";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { StoryCard } from "@/components/blocks/StoryCard";
import { siteConfig } from "@/config/site";
import { pageMeta } from "@/lib/seo/metadata";
import { listPublicUpdatesFeed, toFeedCardVM } from "@/lib/orchestrator/public-feed";

export const metadata: Metadata = pageMeta({
  title: "Updates",
  description:
    "Latest public updates from connected channels—curated for the Kelly Grappe for Arkansas Secretary of State campaign.",
  path: "/updates",
  imageSrc: "/media/placeholders/hero-arkansas-warm.svg",
});

export default async function UpdatesPage() {
  const raw = await listPublicUpdatesFeed(48);
  const cards = raw.map(toFeedCardVM);

  return (
    <FullBleedSection variant="default" className="min-h-[50vh] border-b border-deep-soil/10">
      <ContentContainer className="py-section-y lg:py-section-y-lg">
        <SectionHeading
          eyebrow="From the movement"
          title="Latest updates"
          subtitle="Mixed-source feed: notebook essays, social posts, and video — editor-approved for the public site. More sources land here as connectors go live."
          align="left"
          className="max-w-2xl"
        />
        {cards.length === 0 ? (
          <p className="mt-12 max-w-xl font-body text-base leading-relaxed text-deep-soil/70">
            Nothing published to this feed yet. When the team marks inbound items for the updates page, they will
            appear here with source badges in the card meta.
          </p>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((p) => (
              <StoryCard
                key={p.id}
                title={p.title}
                excerpt={p.excerpt}
                href={p.href}
                meta={p.meta}
                imageSrc={p.imageSrc}
                imageAlt={p.imageAlt}
                ctaLabel={p.ctaLabel}
              />
            ))}
          </div>
        )}
        <p className="mt-14 font-body text-sm text-deep-soil/60">
          <Link href="/blog" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
            Movement notebook (Substack)
          </Link>{" "}
          ·{" "}
          <Link href="/" className="font-semibold text-red-dirt underline-offset-2 hover:underline">
            Home
          </Link>
        </p>
        <p className="mt-4 font-body text-xs text-deep-soil/45">
          {siteConfig.name} — each card meta line includes the source platform and content type.
        </p>
      </ContentContainer>
    </FullBleedSection>
  );
}
