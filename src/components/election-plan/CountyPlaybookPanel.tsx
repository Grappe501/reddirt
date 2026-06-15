import Link from "next/link";

import { CountyNetworkingContactsPanel } from "@/components/election-plan/CountyNetworkingContactsPanel";
import type { ElectionPlanCounty } from "@/lib/election-plan/types";
import { countyWorkbenchExternalHref } from "@/lib/election-plan/location-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { COUNTY_COVERAGE_EXPLAINER } from "@/lib/election-plan/location-links";

type Props = {
  county: ElectionPlanCounty;
  backHref?: string;
  backLabel?: string;
};

export function CountyPlaybookPanel({ county, backHref, backLabel }: Props) {
  const external = countyWorkbenchExternalHref(county.county, county.slug);

  return (
    <section>
      {backHref ? (
        <Link href={backHref} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
          ← {backLabel ?? "Back"}
        </Link>
      ) : (
        <Link
          href="/election-plan?tab=countyPlaybooks"
          className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
        >
          ← County playbooks
        </Link>
      )}

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--ep-gold)]">Tier {county.tier} · VCI #{county.vciRank}</p>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{county.county} County</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{county.strategicRole}</p>
        </div>
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          className="ep-chapter-link text-sm"
        >
          Full county workbench ↗
        </a>
      </div>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(county.vci)}</div>
          <div className="ep-stat-label">VCI</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">
            {county.coverageCompleted}/{county.coveragePlanned}
          </div>
          <div className="ep-stat-label" title={COUNTY_COVERAGE_EXPLAINER}>
            Visit contacts
          </div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(county.registrationGoal)}</div>
          <div className="ep-stat-label">Registration goal</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(county.lane2Recovery50)}</div>
          <div className="ep-stat-label">Lane 2 @ 50%</div>
        </div>
      </div>

      <div className="ep-card-glass mb-8 text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">{county.primaryMission}</p>
        <p className="mt-1 text-[var(--ep-navy-muted)]">{county.secondaryMission}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{county.recommendedAction}</p>
      </div>

      <CountyNetworkingContactsPanel countySlug={county.slug} countyName={county.county} />
    </section>
  );
}
