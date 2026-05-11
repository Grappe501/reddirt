import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FieldBreadcrumbs } from "@/components/dashboard/field/FieldBreadcrumbs";
import {
  countiesByRegionOrdered,
  isValidArCommandRegionId,
  regionMetaForId,
} from "@/lib/county/arkansas-county-registry";
import { fieldCountyHref, fieldDirectorHref, fieldRegionsIndexHref } from "@/lib/field-structure/field-dashboard-paths";

type Props = { params: Promise<{ regionId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { regionId } = await params;
  if (!isValidArCommandRegionId(regionId)) return { title: "Region" };
  const meta = regionMetaForId(regionId);
  return { title: `${meta?.shortLabel ?? regionId} · Regional field` };
}

export default async function FieldRegionPage({ params }: Props) {
  const { regionId } = await params;
  if (!isValidArCommandRegionId(regionId)) notFound();
  const meta = regionMetaForId(regionId);
  const counties = countiesByRegionOrdered().get(regionId) ?? [];

  return (
    <>
      <FieldBreadcrumbs
        items={[
          { label: "Field Director", href: fieldDirectorHref() },
          { label: "Regions", href: fieldRegionsIndexHref() },
          { label: meta?.shortLabel ?? regionId },
        ]}
      />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">{meta?.label ?? regionId}</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        Regional boards connect upward to campaign leads and downward into every county in this geography. Pick a county
        to open the three-lane county shell (events, social & media, Power of 5 / VR), then drill into cities, precincts,
        and neighborhoods as teams stand up.
      </p>

      <section className="mt-8" aria-labelledby="county-list">
        <h3 id="county-list" className="font-heading text-lg font-bold text-kelly-text">
          Counties in this region
        </h3>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {counties.map((c) => (
            <li key={c.slug}>
              <Link
                href={fieldCountyHref(regionId, c.slug)}
                className="block rounded-lg border border-kelly-text/10 bg-white px-3 py-2 font-body text-sm font-semibold text-kelly-navy shadow-sm hover:border-kelly-navy/25"
              >
                {c.displayName}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
