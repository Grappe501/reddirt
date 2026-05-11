import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActingGeographyManagerPanel } from "@/components/dashboard/field/ActingGeographyManagerPanel";
import { FieldBreadcrumbs } from "@/components/dashboard/field/FieldBreadcrumbs";
import { FieldCountyTriadLinks } from "@/components/dashboard/field/FieldCountyTriadLinks";
import {
  getRegistryCountyBySlug,
  isValidArCommandRegionId,
  regionMetaForId,
} from "@/lib/county/arkansas-county-registry";
import {
  FIELD_TEMPLATE_CITY_SLUG,
  fieldCityHref,
  fieldDirectorHref,
  fieldRegionsIndexHref,
} from "@/lib/field-structure/field-dashboard-paths";

type Props = { params: Promise<{ regionId: string; countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId, countySlug } = await params;
  if (!isValidArCommandRegionId(regionId)) return { title: "County" };
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) return { title: "County" };
  return { title: `${county.displayName} · Field` };
}

export default async function FieldCountyPage({ params }: Props) {
  const { regionId, countySlug } = await params;
  if (!isValidArCommandRegionId(regionId)) notFound();
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) notFound();
  const regionMeta = regionMetaForId(regionId);

  const communityHub = `/dashboard/community/county-democrats/${countySlug}`;

  return (
    <>
      <FieldBreadcrumbs
        items={[
          { label: "Field Director", href: fieldDirectorHref() },
          { label: "Regions", href: fieldRegionsIndexHref() },
          { label: regionMeta?.shortLabel ?? regionId, href: `/dashboard/field/regions/${regionId}` },
          { label: county.displayName },
        ]}
      />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">{county.displayName}</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        County field shell: triad lanes mirror the regional board and statewide functional leads. Cities chain under the
        county; precincts chain under cities; neighborhoods chain under precincts — use template slugs until real
        geography is claimed.
      </p>

      <div className="mt-6">
        <ActingGeographyManagerPanel geographyLabel={county.displayName} />
      </div>

      <FieldCountyTriadLinks regionId={regionId} countySlug={countySlug} countyDisplayName={county.displayName} />

      <section className="mt-10" aria-labelledby="city-drill">
        <h3 id="city-drill" className="font-heading text-lg font-bold text-kelly-text">
          Cities · precincts · neighborhoods
        </h3>
        <p className="mt-2 max-w-3xl font-body text-sm text-kelly-text/75">
          Open the template city path to see precinct and neighborhood placeholders. Replace slugs with real municipal
          and VRD geography when volunteers onboard.
        </p>
        <div className="mt-4">
          <Link
            href={fieldCityHref(regionId, countySlug, FIELD_TEMPLATE_CITY_SLUG)}
            className="inline-flex rounded-lg border border-kelly-navy/20 bg-kelly-fog/30 px-4 py-2 font-body text-sm font-semibold text-kelly-navy hover:bg-white"
          >
            Template city workspace →
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-kelly-text/10 bg-kelly-fog/20 p-4">
        <h3 className="font-heading text-base font-bold text-kelly-text">Related public hub</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          County party organizing content (when enabled) lives on the community county Democrats dashboard — separate
          from this field command shell.
        </p>
        <Link href={communityHub} className="mt-3 inline-block font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline">
          Open county community hub →
        </Link>
      </section>
    </>
  );
}
