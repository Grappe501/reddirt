import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { CountyVaultLibrary } from "@/components/county/vault/CountyVaultLibrary";
import { queryCountyVaultAssets } from "@/lib/county-vault/queries";
import type { CountyVaultSort } from "@/lib/county-vault/types";
import { resolveCountyCommandBySlug } from "@/lib/county/get-county-command-data";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; kind?: string; q?: string }>;
};

export const dynamic = "force-dynamic";

const SORTS = new Set<CountyVaultSort>(["newest", "oldest", "title", "kind"]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const county = await resolveCountyCommandBySlug(slug);
  if (!county) return { title: "Media vault" };
  return {
    title: `${county.displayName} Media Vault — Photos & Videos`,
    description: `Browse campaign photos, videos, and field media from ${county.displayName}, Arkansas — transcripts, summaries, and downloads from Kelly Grappe for Secretary of State.`,
    keywords: ["Kelly Grappe", county.displayName, "Arkansas", "campaign media", county.slug, "county organizing"],
    openGraph: {
      title: `${county.displayName} County Media Vault`,
      description: `Field photos and videos from ${county.displayName} — Kelly Grappe for Arkansas Secretary of State.`,
    },
  };
}

export default async function CountyMediaVaultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const county = await resolveCountyCommandBySlug(slug);
  if (!county) notFound();

  const sortRaw = sp.sort ?? "newest";
  const sort: CountyVaultSort = SORTS.has(sortRaw as CountyVaultSort) ? (sortRaw as CountyVaultSort) : "newest";
  const items = await queryCountyVaultAssets(slug, { sort, kind: sp.kind, q: sp.q });

  return (
    <FullBleedSection padY className="bg-kelly-page">
      <ContentContainer>
        <Suspense>
          <CountyVaultLibrary
            countySlug={slug}
            countyDisplayName={county.displayName}
            items={items}
            initialSort={sort}
            initialKind={sp.kind}
            initialQ={sp.q}
          />
        </Suspense>
      </ContentContainer>
    </FullBleedSection>
  );
}
