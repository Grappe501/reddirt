import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FieldBreadcrumbs } from "@/components/dashboard/field/FieldBreadcrumbs";
import {
  getRegistryCountyBySlug,
  isValidArCommandRegionId,
  regionMetaForId,
} from "@/lib/county/arkansas-county-registry";
import {
  FIELD_TEMPLATE_NEIGHBORHOOD_SLUG,
  fieldCityHref,
  fieldCountyHref,
  fieldDirectorHref,
  fieldNeighborhoodHref,
  fieldRegionsIndexHref,
} from "@/lib/field-structure/field-dashboard-paths";

type Props = { params: Promise<{ regionId: string; countySlug: string; citySlug: string; precinctSlug: string }> };

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId, countySlug, precinctSlug } = await params;
  if (!isValidArCommandRegionId(regionId)) return { title: "Precinct" };
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) return { title: "Precinct" };
  return { title: `${titleCaseSlug(precinctSlug)} · ${county.displayName}` };
}

export default async function FieldPrecinctPage({ params }: Props) {
  const { regionId, countySlug, citySlug, precinctSlug } = await params;
  if (!isValidArCommandRegionId(regionId)) notFound();
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) notFound();
  const regionMeta = regionMetaForId(regionId);
  const precinctLabel = titleCaseSlug(precinctSlug);
  const cityLabel = titleCaseSlug(citySlug);

  const neighborhoodHref = fieldNeighborhoodHref(
    regionId,
    countySlug,
    citySlug,
    precinctSlug,
    FIELD_TEMPLATE_NEIGHBORHOOD_SLUG,
  );

  return (
    <>
      <FieldBreadcrumbs
        items={[
          { label: "Field Director", href: fieldDirectorHref() },
          { label: "Regions", href: fieldRegionsIndexHref() },
          { label: regionMeta?.shortLabel ?? regionId, href: `/dashboard/field/regions/${regionId}` },
          { label: county.displayName, href: fieldCountyHref(regionId, countySlug) },
          { label: cityLabel, href: fieldCityHref(regionId, countySlug, citySlug) },
          { label: precinctLabel },
        ]}
      />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">Precinct · {precinctLabel}</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        Precinct boards connect upward to the city field shell and downward into neighborhood captains. Template
        neighborhood link below.
      </p>
      <Link
        href={neighborhoodHref}
        className="mt-6 inline-flex rounded-lg border border-kelly-navy/20 bg-white px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:border-kelly-navy/40"
      >
        Open template neighborhood →
      </Link>
    </>
  );
}
