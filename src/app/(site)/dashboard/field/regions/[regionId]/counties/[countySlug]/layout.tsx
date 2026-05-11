import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { getRegistryCountyBySlug, isValidArCommandRegionId } from "@/lib/county/arkansas-county-registry";

type Props = {
  children: ReactNode;
  params: Promise<{ regionId: string; countySlug: string }>;
};

export default async function FieldCountyLayout({ children, params }: Props) {
  const { regionId, countySlug } = await params;
  if (!isValidArCommandRegionId(regionId)) notFound();
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) notFound();
  return children;
}
