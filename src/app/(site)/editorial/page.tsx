import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { pageMeta } from "@/lib/seo/metadata";
import { publishedMediaSince2025_11, publishedMediaEarlier } from "@/content/editorial/external-media";
import { EditorialMediaArchive } from "@/components/editorial/EditorialMediaArchive";

export const metadata: Metadata = pageMeta({
  title: "Editorial",
  description:
    "Bylined columns and commentary: Kelly’s work in Arkansas newspapers, with links to the full text.",
  path: "/editorial",
  imageSrc: "/media/placeholders/editorial-ink-field.svg",
});

export default async function EditorialIndexPage() {
  const since = publishedMediaSince2025_11;
  const earlier = publishedMediaEarlier;
  const hasArchiveItems = since.length + earlier.length > 0;

  return (
    <>
      {/*
        TODO: Long-form on-site essays module (optional) distinct from external byline archive below.
        TODO: Curated video embeds from official channels — later phase.
      */}
      <PageHero
        tone="plan"
        eyebrow="Essays"
        title="Editorial"
        subtitle="Deeper reflections on democracy, public trust, Arkansas communities, and the work of building a government that serves people. Bylined newspaper work and commentary with links to full pieces appears below."
      />

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          {hasArchiveItems ? (
            <EditorialMediaArchive sinceNov2025={since} earlier={earlier} />
          ) : (
            <div className="mx-auto max-w-2xl rounded-card border border-dashed border-kelly-text/20 bg-white/85 p-10 text-center shadow-sm">
              <h2 className="font-heading text-lg font-bold text-kelly-ink md:text-xl">Editorial essays on the way</h2>
              <p className="mt-4 font-body text-base leading-relaxed text-kelly-slate">
                Editorial essays will appear here as they are published.
              </p>
              <p className="mt-6 font-body text-sm text-kelly-text/65">
                <Link href="/from-the-road" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                  From the Road
                </Link>{" "}
                ·{" "}
                <Link href="/get-involved" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
                  Get involved
                </Link>
              </p>
            </div>
          )}
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}

