import type { Metadata } from "next";
import Link from "next/link";

import { FieldBreadcrumbs } from "@/components/dashboard/field/FieldBreadcrumbs";
import { ARKANSAS_COMMAND_REGIONS, countiesByRegionOrdered } from "@/lib/county/arkansas-county-registry";
import { fieldDirectorHref, fieldRegionHref } from "@/lib/field-structure/field-dashboard-paths";

export const metadata: Metadata = {
  title: "Regions · Field command",
  description: "Arkansas regional field dashboards — template drill-down into counties.",
};

export default function FieldRegionsIndexPage() {
  const byRegion = countiesByRegionOrdered();

  return (
    <>
      <FieldBreadcrumbs items={[{ label: "Field Director", href: fieldDirectorHref() }, { label: "Regions" }]} />
      <h2 className="font-heading text-2xl font-bold text-kelly-text">Regional dashboards</h2>
      <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-kelly-text/80">
        Each region links to campaign leadership roll-ups and every county in that geography. You do not need every
        county team built before the shell appears — empty lanes stay labeled as templates until volunteers claim them.
      </p>

      <div className="mt-10 space-y-10">
        {ARKANSAS_COMMAND_REGIONS.map((region) => {
          const counties = byRegion.get(region.id) ?? [];
          return (
            <section key={region.id} aria-labelledby={`region-${region.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-kelly-text/10 pb-2">
                <h3 id={`region-${region.id}`} className="font-heading text-lg font-bold text-kelly-navy">
                  {region.label}
                </h3>
                <Link
                  href={fieldRegionHref(region.id)}
                  className="font-body text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
                >
                  Open regional board →
                </Link>
              </div>
              <ul className="mt-3 columns-1 gap-x-8 text-sm sm:columns-2 lg:columns-3">
                {counties.map((c) => (
                  <li key={c.slug} className="break-inside-avoid py-1">
                    <Link href={`${fieldRegionHref(region.id)}/counties/${c.slug}`} className="text-kelly-text/85 hover:text-kelly-navy hover:underline">
                      {c.displayName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
