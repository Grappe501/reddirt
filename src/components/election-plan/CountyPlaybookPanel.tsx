import Link from "next/link";

import { CountyPlaybookOperatorGuidePanel } from "@/components/election-plan/CountyPlaybookOperatorGuidePanel";
import { CountyPlaybookMissingPanel } from "@/components/election-plan/CountyPlaybookMissingPanel";
import { CountyPlaybookMarkdownPanel } from "@/components/election-plan/CountyPlaybookMarkdownPanel";
import { CountyFundraisingRollupPanel } from "@/components/election-plan/CountyFundraisingRollupPanel";
import { CountyIntelligenceNav } from "@/components/election-plan/CountyIntelligenceNav";
import { CountyMissionImpactPanel } from "@/components/election-plan/CountyMissionImpactPanel";
import { CountyWorkbenchV3IntelPanel } from "@/components/election-plan/CountyWorkbenchV3IntelPanel";
import { CountyWorkbenchV4OperationsPanel } from "@/components/election-plan/CountyWorkbenchV4OperationsPanel";
import { ElectionPlanFieldEntryPanel } from "@/components/election-plan/ElectionPlanFieldEntryPanel";
import { CountyVictoryTargetsPanel } from "@/components/election-plan/CountyVictoryTargetsPanel";
import { LocationGopPrimaryRunoffPanel } from "@/components/election-plan/LocationGopPrimaryRunoffPanel";
import { getGopSos2026CountyBySlug } from "@/lib/election-plan/load-gop-sos-2026-results";
import { CountyPartyIntelligencePanel } from "@/components/election-plan/CountyPartyIntelligencePanel";
import { VoterFileCountyIntelSection } from "@/components/election-plan/VoterFileLocationIntelPanel";
import { LocationAudienceStrip } from "@/components/election-plan/voter-audience/LocationAudienceStrip";
import { ImmersionCountyMissionCard } from "@/components/election-plan/ImmersionCountyMissionCard";
import { CountyNetworkingContactsPanel } from "@/components/election-plan/CountyNetworkingContactsPanel";
import { CountyRegistrationAllocationPanel } from "@/components/election-plan/CountyRegistrationAllocationPanel";
import { CountyStrikeTeamPanel } from "@/components/election-plan/CountyStrikeTeamPanel";
import { LegacyCountySystemsPanel } from "@/components/election-plan/LegacyCountySystemsPanel";
import { LocationCalendarBindingPanel } from "@/components/election-plan/LocationCalendarBindingPanel";
import { LocationFieldEventsPanel } from "@/components/election-plan/LocationFieldEventsPanel";
import { SpecialKpiGoalCard } from "@/components/election-plan/SpecialKpiGoalCard";
import type { CountyWorkbenchV4OperationalView } from "@/lib/election-plan/county-workbench/build-county-v4-operational";
import type { CountyWorkbenchV3View } from "@/lib/election-plan/county-workbench/types";
import type { FieldEntryLocationSummary } from "@/lib/election-plan/field-entry/types";
import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import type { CountyStrikeTeam } from "@/lib/election-plan/load-county-strike-team";
import type { LocationCalendarBinding } from "@/lib/election-plan/location-calendar-binding";
import type { ElectionPlanCity, ElectionPlanCounty } from "@/lib/election-plan/types";
import { cityLocationBriefHref, countyPlaybookHref, electionPlanSlugForCountyName } from "@/lib/election-plan/location-links";
import { cityPathToVictoryHref, countyPathToVictoryHref } from "@/lib/election-plan/county-playbook-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import { getCountyVictoryTarget } from "@/lib/election-plan/load-county-victory-targets";
import { getCountyPartyProfileBySlug } from "@/lib/election-plan/load-county-party-intelligence";
import { getCountyAudienceOverlay } from "@/lib/election-plan/voter-audience-models/load";
import {
  filterImmersionMissionForDisplay,
  getImmersionMissionForCounty,
} from "@/lib/election-plan/load-immersion-county-missions";
import { getSpecialKpiGoalForCounty } from "@/lib/election-plan/load-special-kpi-goals";
import type { FosCountyRollup } from "@/lib/election-plan/load-fundraising-operating-system";
import { COUNTY_COVERAGE_EXPLAINER } from "@/lib/election-plan/location-links";
import { CountyVaultPanel } from "@/components/election-plan/CountyVaultPanel";
import { CountyVaultUploadPanel } from "@/components/admin/county/CountyVaultUploadPanel";
import type { CountyVaultListItem } from "@/lib/county-vault/types";
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
  fieldEntrySummary?: FieldEntryLocationSummary;
  operatorInitials?: string | null;
  fosCountyRollup?: FosCountyRollup | null;
  countyIntel?: CountyWorkbenchV3View | null;
  v4Ops?: CountyWorkbenchV4OperationalView | null;
  playbookMarkdown?: string | null;
  vaultStats?: { total: number; publicCount: number; withTranscript: number; videos: number };
  vaultPreview?: CountyVaultListItem[];
  vaultCountySlug?: string;
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
  fieldEntrySummary,
  operatorInitials,
  fosCountyRollup = null,
  countyIntel = null,
  v4Ops = null,
  playbookMarkdown = null,
  vaultStats,
  vaultPreview = [],
  vaultCountySlug,
}: Props) {
  const specialKpi = getSpecialKpiGoalForCounty(county.slug);
  const victoryTarget = getCountyVictoryTarget(county.county, county.tier);
  const countyAudience = getCountyAudienceOverlay(county.slug);
  const countyParty = getCountyPartyProfileBySlug(county.slug);
  const immersionMission = filterImmersionMissionForDisplay(getImmersionMissionForCounty(county.slug), {
    surface: "county",
  });
  const gopSos2026 = getGopSos2026CountyBySlug(county.slug);

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
          ← County intelligence index
        </Link>
      )}

      <CountyIntelligenceNav
        hasDbIntel={Boolean(countyIntel)}
        hasVault={Boolean(vaultStats && vaultCountySlug && (vaultStats.total > 0 || vaultPreview.length > 0))}
      />

      <CountyPlaybookOperatorGuidePanel countySlug={county.slug} countyName={county.county} tier={county.tier} />

      <div className="ep-card-glass mb-6 border border-[var(--ep-gold)]/30 px-4 py-3 text-sm">
        <p className="font-semibold text-[var(--ep-navy)]">County operating center · Election Plan</p>
        <p className="mt-1 text-[var(--ep-navy-muted)]">
          You are on the primary county surface. Legacy{" "}
          <code className="text-xs">/county-briefings</code> and{" "}
          <code className="text-xs">/counties</code> paths are not used from this page — all county workbench links
          stay in Election Plan at{" "}
          <code className="text-xs">/election-plan/counties/{county.slug}</code>.
        </p>
      </div>

      <div id="overview" className="scroll-mt-24">
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[var(--ep-gold)]">
              County intelligence · Election Plan
              {" · "}
              <span className={tierClass(county.tier)}>Tier {county.tier}</span>
              {" · "}VCI #{county.vciRank}
            </p>
            <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{county.county} County</h1>
            <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{county.strategicRole}</p>
          </div>
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

        {gopSos2026 ? <LocationGopPrimaryRunoffPanel view={gopSos2026} variant="hero" showDrillDown /> : null}

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

        {countyIntel ? (
          <div className="mb-8 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="ep-card py-2 px-3">
              <span className="text-xs text-[var(--ep-navy-muted)]">FIPS</span>
              <p className="font-semibold">{countyIntel.fips || "—"}</p>
            </div>
            <div className="ep-card py-2 px-3">
              <span className="text-xs text-[var(--ep-navy-muted)]">Region</span>
              <p className="font-semibold">{countyIntel.regionLabel}</p>
            </div>
            <div className="ep-card py-2 px-3">
              <span className="text-xs text-[var(--ep-navy-muted)]">County seat</span>
              <p className="font-semibold">{countyIntel.countySeat ?? "—"}</p>
            </div>
            <div className="ep-card py-2 px-3">
              <span className="text-xs text-[var(--ep-navy-muted)]">Population</span>
              <p className="font-semibold">
                {countyIntel.censusDemographics.population?.toLocaleString("en-US") ?? "—"}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {playbookMarkdown ? (
        <CountyPlaybookMarkdownPanel countyName={county.county} countySlug={county.slug} markdown={playbookMarkdown} />
      ) : (
        <CountyPlaybookMissingPanel countyName={county.county} playbookPath={county.playbookPath} />
      )}

      <div id="strategy" className="scroll-mt-24">
        {victoryTarget ? (
          <div className="mb-8">
            <CountyVictoryTargetsPanel target={victoryTarget} variant="hero" />
          </div>
        ) : null}

        {immersionMission ? (
          <div className="mb-8">
            <ImmersionCountyMissionCard mission={immersionMission} />
          </div>
        ) : null}

        {countyParty ? (
          <div className="mb-8">
            <CountyPartyIntelligencePanel profile={countyParty} hidePlaybookLink />
          </div>
        ) : null}

        <VoterFileCountyIntelSection countySlug={county.slug} countyName={county.county} />

        {countyAudience ? <LocationAudienceStrip overlay={countyAudience} /> : null}

        <CountyMissionImpactPanel county={county} victoryTarget={victoryTarget} />

        {specialKpi ? (
          <div className="mb-8">
            <SpecialKpiGoalCard goal={specialKpi} variant="panel" />
          </div>
        ) : null}

        <div className="ep-card mb-8 border-l-4 border-[var(--ep-gold)] text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-heading text-base font-bold text-[var(--ep-navy)]">Path to victory</h2>
            <Link href={countyPathToVictoryHref(county.slug)} className="ep-chapter-link text-xs font-semibold">
              Full drill-down →
            </Link>
          </div>
          {countyIntel?.campaignReasoning.pathToVictory ? (
            <p className="mt-2 line-clamp-4 text-[var(--ep-navy-muted)]">{countyIntel.campaignReasoning.pathToVictory}</p>
          ) : (
            <p className="mt-2 text-[var(--ep-navy-muted)]">
              Lane vote math, registration, house parties, fundraising, coalition frameworks, and weekly volunteer focus
              for {county.county} County.
            </p>
          )}
          {victoryTarget ? (
            <div className="mt-3 border-t border-[var(--ep-border)] pt-3">
              <CountyVictoryTargetsPanel target={victoryTarget} variant="inline" />
            </div>
          ) : null}
        </div>
      </div>

      {fosCountyRollup ? (
        <div id="fundraising" className="mb-8 scroll-mt-24">
          <CountyFundraisingRollupPanel rollup={fosCountyRollup} />
        </div>
      ) : (
        <div id="fundraising" className="mb-8 scroll-mt-24">
          <div className="ep-card border-dashed text-sm text-[var(--ep-navy-muted)]">
            <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Fundraising</h2>
            <p className="mt-2">Data gap — FOS county rollup not available for this county slug.</p>
          </div>
        </div>
      )}

      <div className="scroll-mt-24">
        {strikeTeam ? (
          <div className="mb-8">
            <CountyStrikeTeamPanel team={strikeTeam} />
          </div>
        ) : null}
        {v4Ops ? <CountyWorkbenchV4OperationsPanel countyName={county.county} ops={v4Ops} /> : (
          <div id="leadership" className="ep-card mb-8 border-dashed scroll-mt-24">
            <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Leadership</h2>
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">Data gap — county leadership framework not loaded.</p>
          </div>
        )}
      </div>

      {priorityCities.length > 0 ? (
        <div id="cities" className="ep-card mb-8 scroll-mt-24">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Cities & communities in {county.county}</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            Priority cities open community workbenches — Sherwood and other cities live under{" "}
            <code className="text-xs">/election-plan/workbenches/{`{slug}`}</code>, not as county slugs.
          </p>
          <ul className="mt-4 space-y-2">
            {priorityCities.map((city) => (
              <li
                key={city.slug}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ep-border)] py-2 last:border-0"
              >
                <div>
                  <Link
                    href={cityLocationBriefHref(city.slug)}
                    className="font-semibold text-[var(--ep-navy)] hover:text-[var(--ep-gold)]"
                  >
                    #{city.rank} {city.name}
                  </Link>
                  <p className="text-xs text-[var(--ep-navy-muted)]">
                    {formatVotes(city.targetVotes)} target · {city.visitFrequency}
                    {city.population2020 ? ` · pop. ${city.population2020.toLocaleString("en-US")}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={cityLocationBriefHref(city.slug)}
                    className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
                  >
                    Location brief →
                  </Link>
                  <Link
                    href={cityPathToVictoryHref(city.slug)}
                    className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
                  >
                    Path to victory →
                  </Link>
                  <Link
                    href={`/election-plan/workbenches/${city.slug}`}
                    className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
                  >
                    Community workbench →
                  </Link>
                  {gopSos2026 ? (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        gopSos2026.runoff.winner === "norris" ? "bg-orange-100 text-orange-900" : "bg-red-100 text-red-900",
                      )}
                      title="GOP runoff winner for this county — municipal splits require precinct export"
                    >
                      GOP runoff · {gopSos2026.runoff.winner === "norris" ? "Norris" : "Hammer"}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div id="cities" className="ep-card mb-8 scroll-mt-24 border-dashed">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Cities & communities</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">Data gap — no priority cities mapped in election plan snapshot.</p>
        </div>
      )}

      <div id="field" className="scroll-mt-24">
        {fieldEntrySummary ? (
          <div className="mb-8">
            <ElectionPlanFieldEntryPanel
              countySlug={county.slug}
              countyName={county.county}
              initial={fieldEntrySummary}
              operatorInitials={operatorInitials ?? null}
            />
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

        <div id="events" className="mb-8 scroll-mt-24">
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
      </div>

      <div id="relationships" className="mb-8 scroll-mt-24">
        <CountyNetworkingContactsPanel countySlug={county.slug} countyName={county.county} />
      </div>

      {countyIntel ? (
        <CountyWorkbenchV3IntelPanel intel={countyIntel} hideNav skipStrategySection skipIdentitySection />
      ) : (
        <div id="gaps" className="ep-card mb-8 scroll-mt-24 border-dashed">
          <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Reference data gaps</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
            Census, BLS, election history, and elected officials require database ingest. Campaign snapshot metrics
            (VCI, tier, missions, cities) above remain available offline.
          </p>
        </div>
      )}

      {vaultStats && vaultCountySlug && (vaultStats.total > 0 || vaultPreview.length > 0) ? (
        <div id="county-media-vault" className="mb-8 scroll-mt-24 space-y-6">
          <CountyVaultPanel
            countySlug={vaultCountySlug}
            countyDisplayName={`${county.county} County`}
            stats={vaultStats}
            previewItems={vaultPreview}
            isOperator={Boolean(operatorInitials)}
          />
          {operatorInitials ? (
            <CountyVaultUploadPanel
              countySlug={vaultCountySlug}
              countyDisplayName={`${county.county} County`}
              uploadEndpoint="/api/election-plan/county-vault/upload"
            />
          ) : null}
        </div>
      ) : null}

      <LegacyCountySystemsPanel countyName={county.county} />
    </section>
  );
}
