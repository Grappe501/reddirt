import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActingGeographyManagerPanel } from "@/components/dashboard/field/ActingGeographyManagerPanel";
import { FieldBreadcrumbs } from "@/components/dashboard/field/FieldBreadcrumbs";
import {
  getRegistryCountyBySlug,
  isValidArCommandRegionId,
  regionMetaForId,
} from "@/lib/county/arkansas-county-registry";
import {
  fieldCityHref,
  fieldCountyHref,
  fieldDirectorHref,
  fieldPrecinctHref,
  fieldRegionsIndexHref,
} from "@/lib/field-structure/field-dashboard-paths";

type Props = {
  params: Promise<{ regionId: string; countySlug: string; citySlug: string; precinctSlug: string; neighborhoodSlug: string }>;
};

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId, countySlug, neighborhoodSlug } = await params;
  if (!isValidArCommandRegionId(regionId)) return { title: "Neighborhood" };
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) return { title: "Neighborhood" };
  return { title: `${titleCaseSlug(neighborhoodSlug)} · ${county.displayName}` };
}

export default async function FieldNeighborhoodPage({ params }: Props) {
  const { regionId, countySlug, citySlug, precinctSlug, neighborhoodSlug } = await params;
  if (!isValidArCommandRegionId(regionId)) notFound();
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) notFound();
  const regionMeta = regionMetaForId(regionId);
  const neighborhoodLabel = titleCaseSlug(neighborhoodSlug);
  const cityLabel = titleCaseSlug(citySlug);
  const precinctLabel = titleCaseSlug(precinctSlug);

  return (
    <>
      <FieldBreadcrumbs
        items={[
          { label: "Field Director", href: fieldDirectorHref() },
          { label: "Regions", href: fieldRegionsIndexHref() },
          { label: regionMeta?.shortLabel ?? regionId, href: `/dashboard/field/regions/${regionId}` },
          { label: county.displayName, href: fieldCountyHref(regionId, countySlug) },
          { label: cityLabel, href: fieldCityHref(regionId, countySlug, citySlug) },
          { label: precinctLabel, href: fieldPrecinctHref(regionId, countySlug, citySlug, precinctSlug) },
          { label: neighborhoodLabel },
        ]}
      />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">Neighborhood · {neighborhoodLabel}</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        Deepest public template in tonight’s stack. Block captains and relational P5 work meet here once roster data is
        wired.
      </p>
      <div className="mt-6">
        <ActingGeographyManagerPanel geographyLabel={`${neighborhoodLabel} · ${county.displayName}`} />
      </div>
      <p className="mt-8">
        <Link href={fieldCountyHref(regionId, countySlug)} className="font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline">
          ↑ Jump to county field shell
        </Link>
      </p>
    </>
  );
}
