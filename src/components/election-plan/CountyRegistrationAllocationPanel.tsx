import Link from "next/link";

import {
  countyAllocatedRegistrationTotal,
  countyCityRegistrationAllocation,
} from "@/lib/election-plan/load-city-numeric-targets";
import { cityLocationBriefHref } from "@/lib/election-plan/location-links";
import type { ElectionPlanCity, ElectionPlanCounty } from "@/lib/election-plan/types";
import { formatVotes } from "@/lib/election-plan/electionPlanData";

type Props = {
  county: ElectionPlanCounty;
  cities: ElectionPlanCity[];
};

export function CountyRegistrationAllocationPanel({ county, cities }: Props) {
  const rows = countyCityRegistrationAllocation(county, cities);
  if (rows.length === 0) return null;

  const allocated = countyAllocatedRegistrationTotal(rows);

  return (
    <div className="ep-card mb-8">
      <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Lane 3 registration allocation</h2>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Priority cities share of {county.county} County&apos;s {formatVotes(county.registrationGoal)} chapter-05 goal
        · {allocated.toLocaleString()} allocated across {rows.length} city brief{rows.length === 1 ? "" : "s"}
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="pb-2 pr-3">City</th>
              <th className="pb-2 pr-3">Share</th>
              <th className="pb-2 pr-3">New registrations</th>
              <th className="pb-2 pr-3">Checks</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ city, targets }) => (
              <tr key={city.slug} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3 font-medium">{city.name}</td>
                <td className="py-2 pr-3">{targets.registration.countySharePct}%</td>
                <td className="py-2 pr-3">{targets.registration.newRegistrations.toLocaleString()}</td>
                <td className="py-2 pr-3">{targets.registration.registrationChecks.toLocaleString()}</td>
                <td className="py-2">
                  <Link href={cityLocationBriefHref(city.slug)} className="text-xs font-semibold hover:text-[var(--ep-gold)]">
                    Brief →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
