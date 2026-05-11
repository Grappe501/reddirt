import type { Metadata } from "next";

import { CountyPartyRollupStrip } from "@/components/dashboard/community/county-democrats/CountyPartyRollupStrip";
import { COUNTY_PARTY_KPI_DEFINITIONS } from "@/lib/campaign-ops/county-democrats-dashboard-plan";
import { getRegistryCountyBySlug } from "@/lib/county/arkansas-county-registry";

type Props = { params: Promise<{ countySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);
  return { title: `${reg?.displayName ?? "County"} · Rollup` };
}

export default async function CountyDemocratsRollupPage({ params }: Props) {
  const { countySlug } = await params;
  const reg = getRegistryCountyBySlug(countySlug);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-xl font-bold text-kelly-navy">Rollup KPIs</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          County-wide scorecard for {reg?.displayName ?? "your county"} — meeting attendance, P5 invites, volunteers, registrations,
          precinct teams, social lane health, and GOTV readiness. Stripe below is demo visualization; wire Prisma aggregates to replace
          seed values.
        </p>
      </div>

      <CountyPartyRollupStrip />

      <div>
        <p className="font-body text-xs font-bold uppercase text-kelly-text/55">KPI framework (ids for data layer)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-sm text-kelly-text/85">
          {COUNTY_PARTY_KPI_DEFINITIONS.map((k) => (
            <li key={k.id}>
              <span className="font-mono text-[11px] text-kelly-navy">{k.id}</span> — {k.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
