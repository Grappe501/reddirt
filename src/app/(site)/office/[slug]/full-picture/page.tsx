import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OfficeLayerPage } from "@/components/office/OfficeLayerPage";
import {
  OFFICE_AREA_SLUGS,
  getOfficeArea,
  isOfficeAreaSlug,
  officeLayerPath,
} from "@/content/office/office-three-layer";
import { pageMeta } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return OFFICE_AREA_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  if (!isOfficeAreaSlug(raw)) return {};
  const area = getOfficeArea(raw);
  if (!area) return {};
  return pageMeta({
    title: `${area.title}: Full picture — The Office`,
    description: `${area.layerThree.intro} ${area.metaDescription}`,
    path: officeLayerPath(raw, 3),
    imageSrc: "/media/placeholders/texture-porch-glow.svg",
  });
}

export default async function OfficeAreaLayerThreePage({ params }: PageProps) {
  const { slug: raw } = await params;
  if (!isOfficeAreaSlug(raw)) notFound();
  const area = getOfficeArea(raw);
  if (!area) notFound();
  return <OfficeLayerPage area={area} layer={3} />;
}
