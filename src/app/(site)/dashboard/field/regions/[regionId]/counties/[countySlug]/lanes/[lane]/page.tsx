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
  fieldCountyHref,
  fieldDirectorHref,
  fieldRegionsIndexHref,
} from "@/lib/field-structure/field-dashboard-paths";

const LANES = {
  events: { title: "Events lane", blurb: "Tablings, house parties, county rhythm, and immersion weekends." },
  "social-media": { title: "Social & media lane", blurb: "Owned social, local press, and amplification." },
  "power-of-5": { title: "Power of 5 / voter registration", blurb: "Relational recruiting and registration goals." },
} as const;

type LaneKey = keyof typeof LANES;

type Props = { params: Promise<{ regionId: string; countySlug: string; lane: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId, countySlug, lane } = await params;
  if (!isValidArCommandRegionId(regionId)) return { title: "Lane" };
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) return { title: "Lane" };
  const def = LANES[lane as LaneKey];
  if (!def) return { title: "Lane" };
  return { title: `${def.title} · ${county.displayName}` };
}

export default async function FieldCountyLanePage({ params }: Props) {
  const { regionId, countySlug, lane } = await params;
  if (!isValidArCommandRegionId(regionId)) notFound();
  const county = getRegistryCountyBySlug(countySlug);
  if (!county || county.regionId !== regionId) notFound();
  const def = LANES[lane as LaneKey];
  if (!def) notFound();
  const regionMeta = regionMetaForId(regionId);

  return (
    <>
      <FieldBreadcrumbs
        items={[
          { label: "Field Director", href: fieldDirectorHref() },
          { label: "Regions", href: fieldRegionsIndexHref() },
          { label: regionMeta?.shortLabel ?? regionId, href: `/dashboard/field/regions/${regionId}` },
          { label: county.displayName, href: fieldCountyHref(regionId, countySlug) },
          { label: def.title },
        ]}
      />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">
        {def.title} · {county.displayName}
      </h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">{def.blurb}</p>
      <p className="mt-4 max-w-3xl font-body text-sm text-kelly-text/70">
        Metrics, tasks, and roster wiring attach here in a later pass. For now, use this URL as the stable lane entry
        point from regional and statewide lead dashboards.
      </p>
      <p className="mt-6">
        <Link href={fieldCountyHref(regionId, countySlug)} className="font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline">
          ← Back to county field shell
        </Link>
      </p>
    </>
  );
}
