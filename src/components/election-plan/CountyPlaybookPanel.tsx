import Link from "next/link";

import { CountyNetworkingContactsPanel } from "@/components/election-plan/CountyNetworkingContactsPanel";
import { CountyRegistrationAllocationPanel } from "@/components/election-plan/CountyRegistrationAllocationPanel";
import { CountyStrikeTeamPanel } from "@/components/election-plan/CountyStrikeTeamPanel";
import { LocationCalendarBindingPanel } from "@/components/election-plan/LocationCalendarBindingPanel";
import { LocationFieldEventsPanel } from "@/components/election-plan/LocationFieldEventsPanel";
import { SpecialKpiGoalCard } from "@/components/election-plan/SpecialKpiGoalCard";
import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import type { CountyStrikeTeam } from "@/lib/election-plan/load-county-strike-team";
import type { LocationCalendarBinding } from "@/lib/election-plan/location-calendar-binding";
import type { ElectionPlanCity, ElectionPlanCounty } from "@/lib/election-plan/types";
import { countyWorkbenchExternalHref } from "@/lib/election-plan/location-links";
import { cityLocationBriefHref } from "@/lib/election-plan/location-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { getSpecialKpiGoalForCounty } from "@/lib/election-plan/load-special-kpi-goals";
import { COUNTY_COVERAGE_EXPLAINER } from "@/lib/election-plan/location-links";
import { cn } from "@/lib/utils";

type Props = {
  county: ElectionPlanCounty;
  priorityCities: ElectionPlanCity[];
  allCities: ElectionPlanCity[];
  strikeTeam?: CountyStrikeTeam;
  fieldEvents: {
    upcoming: ExecutiveCalendarEntry[];
    recent: ExecutiveCalendarEntry[];
    totalInCounty: number;
    cityScoped?: boolean;
  };
  calendarBinding: LocationCalendarBinding;
  referenceDate: string;
  backHref?: string;
  backLabel?: string;
};

function guardrailClass(status: string) {
  if (status === "violation") return "ep-guardrail-violation";
  if (status === "warning") return "ep-guardrail-warning";
  return "ep-guardrail-ok";
}

function tierClass(tier: string) {
  if (tier === "A") return "ep-tier-a";
  if (tier === "B") return "ep-tier-b";
  if (tier === "C") return "ep-tier-c";
  return "ep-tier-d";
}

export function CountyPlaybookPanel({
  county,
  priorityCities,
  allCities,
  strikeTeam,
  fieldEvents,
  calendarBinding,
  referenceDate,
  backHref,
  backLabel,
}: Props) {
  const external = countyWorkbenchExternalHref(county.county, county.slug);
  const specialKpi = getSpecialKpiGoalForCounty(county.slug);

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
          <p className="text-xs font-semibold text-[var(--ep-gold)]">
            <span className={tierClass(county.tier)}>Tier {county.tier}</span>
            {" · "}VCI #{county.vciRank}
          </p>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{county.county} County</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{county.strategicRole}</p>
        </div>
        <a href={external} target="_blank" rel="noopener noreferrer" className="ep-chapter-link text-sm">
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
            Visit contacts ({county.coveragePct}%)
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

      <div className="mb-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{formatVotes(county.gopConversionPotential)}</div>
          <div className="ep-stat-label">GOP conversion pool</div>
        </div>
        <div className="ep-stat">
          <div className={cn("ep-stat-value text-base", guardrailClass(county.guardrailStatus))}>
            {county.guardrailStatus}
          </div>
          <div className="ep-stat-label">Visit guardrail</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{fieldEvents.totalInCounty}</div>
          <div className="ep-stat-label">Field calendar stops</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{priorityCities.length}</div>
          <div className="ep-stat-label">Priority cities</div>
        </div>
      </div>

      <div className="ep-card-glass mb-8 text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">{county.primaryMission}</p>
        <p className="mt-1 text-[var(--ep-navy-muted)]">{county.secondaryMission}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{county.recommendedAction}</p>
      </div>

      {specialKpi ? (
        <div className="mb-8">
          <SpecialKpiGoalCard goal={specialKpi} variant="panel" />
        </div>
      ) : null}

      {strikeTeam ? (
        <div className="mb-8">
          <CountyStrikeTeamPanel team={strikeTeam} />
        </div>
      ) : null}

      {priorityCities.length > 0 ? (
        <div className="ep-card mb-8">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Priority cities in {county.county}</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            City location briefs ↔ county playbook ↔ field calendar worksheets
          </p>
          <ul className="mt-4 space-y-2">
            {priorityCities.map((city) => (
              <li key={city.slug} className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ep-border)] py-2 last:border-0">
                <div>
                  <Link href={cityLocationBriefHref(city.slug)} className="font-semibold text-[var(--ep-navy)] hover:text-[var(--ep-gold)]">
                    #{city.rank} {city.name}
                  </Link>
                  <p className="text-xs text-[var(--ep-navy-muted)]">
                    {formatVotes(city.targetVotes)} target · {city.visitFrequency}
                  </p>
                </div>
                <Link href={cityLocationBriefHref(city.slug)} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
                  Location brief →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <CountyRegistrationAllocationPanel county={county} cities={allCities} />

      <LocationCalendarBindingPanel
        binding={{
          ...calendarBinding,
          weekPlans: calendarBinding.weekPlans,
          currentWeekPlan: calendarBinding.weekPlans.find((w) => w.isCurrentWeek) ?? null,
        }}
        locationLabel={`${county.county} County`}
        countyName={county.county}
      />

      <div className="mb-8">
        <LocationFieldEventsPanel
          title={`${county.county} County field calendar`}
          subtitle={`${fieldEvents.upcoming.length} upcoming from reference date ${referenceDate} · cross-linked to city briefs`}
          upcoming={fieldEvents.upcoming}
          recent={fieldEvents.recent}
          cities={priorityCities}
          countyName={county.county}
          countySlug={county.slug}
          showCountyLink={false}
        />
      </div>

      <CountyNetworkingContactsPanel countySlug={county.slug} countyName={county.county} />
    </section>
  );
}
