import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { CountyVaultAssetExperience } from "@/components/county/vault/CountyVaultAssetExperience";
import { getCountyVaultAssetDetail } from "@/lib/county-vault/queries";
import { resolveCountyCommandBySlug } from "@/lib/county/get-county-command-data";

type Props = { params: Promise<{ slug: string; assetId: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, assetId } = await params;
  const asset = await getCountyVaultAssetDetail(slug, assetId);
  if (!asset) return { title: "Media" };
  const seo = asset.seo;
  return {
    title: seo?.title ?? asset.title,
    description: seo?.description ?? asset.summary ?? undefined,
    keywords: seo?.keywords,
    openGraph: {
      title: seo?.ogTitle ?? seo?.title ?? asset.title,
      description: seo?.ogDescription ?? seo?.description ?? undefined,
    },
    alternates: seo?.canonicalPath ? { canonical: seo.canonicalPath } : undefined,
  };
}

export default async function CountyMediaAssetPage({ params }: Props) {
  const { slug, assetId } = await params;
  const county = await resolveCountyCommandBySlug(slug);
  if (!county) notFound();

  const asset = await getCountyVaultAssetDetail(slug, assetId);
  if (!asset) notFound();

  return (
    <FullBleedSection padY className="bg-kelly-page">
      <ContentContainer>
        <CountyVaultAssetExperience countySlug={slug} countyDisplayName={county.displayName} asset={asset} />
      </ContentContainer>
    </FullBleedSection>
  );
}
