import type { Metadata } from "next";
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
  return (
    <>
      <PageHero
        tone="plan"
        eyebrow="Essays"
        title="Editorial"
        subtitle="Bylined work that ran in Arkansas’s newspapers, with links to the full text where available."
      />

      <FullBleedSection variant="subtle" padY>
        <ContentContainer wide>
          <EditorialMediaArchive
            sinceNov2025={publishedMediaSince2025_11}
            earlier={publishedMediaEarlier}
          />
        </ContentContainer>
      </FullBleedSection>
    </>
  );
}

