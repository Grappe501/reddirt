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
  FIELD_TEMPLATE_PRECINCT_SLUG,
  fieldCountyHref,
  fieldDirectorHref,
  fieldNeighborhoodHref,
  fieldPrecinctHref,
  fieldRegionsIndexHref,
} from "@/lib/field-structure/field-dashboard-paths";

type Props = { params: Promise<{ regionId: string; countySlug: string; citySlug: string }> };

function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId, countySlug, citySlug } = await params;
  if (!isValidArCommandRegionId(regionId)) return { title: "City" };
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) return { title: "City" };
  return { title: `${titleCaseSlug(citySlug)} · ${county.displayName}` };
}

export default async function FieldCityPage({ params }: Props) {
  const { regionId, countySlug, citySlug } = await params;
  if (!isValidArCommandRegionId(regionId)) notFound();
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) notFound();
  const regionMeta = regionMetaForId(regionId);
  const cityLabel = titleCaseSlug(citySlug);

  const precinctHref = fieldPrecinctHref(regionId, countySlug, citySlug, FIELD_TEMPLATE_PRECINCT_SLUG);
  const neighborhoodHref = fieldNeighborhoodHref(
    regionId,
    countySlug,
    citySlug,
    FIELD_TEMPLATE_PRECINCT_SLUG,
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
          { label: cityLabel },
        ]}
      />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">City · {cityLabel}</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        City workspaces sit under the county and inherit the same three-lane logic at smaller geography. Precincts
        chain under cities; neighborhoods chain under precincts.
      </p>

      <section className="mt-8" aria-labelledby="precinct-next">
        <h3 id="precinct-next" className="font-heading text-lg font-bold text-kelly-text">
          Precinct template
        </h3>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          Use this link as the canonical drill-down until real precinct slugs are assigned.
        </p>
        <Link
          href={precinctHref}
          className="mt-3 inline-flex rounded-lg border border-kelly-navy/20 bg-white px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:border-kelly-navy/40"
        >
          Open template precinct →
        </Link>
      </section>

      <section className="mt-8" aria-labelledby="hood-skip">
        <h3 id="hood-skip" className="font-heading text-lg font-bold text-kelly-text">
          Neighborhood template (under precinct)
        </h3>
        <Link
          href={neighborhoodHref}
          className="mt-3 inline-flex rounded-lg border border-kelly-text/15 bg-kelly-fog/30 px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:bg-white"
        >
          Open template neighborhood →
        </Link>
      </section>
    </>
  );
}
