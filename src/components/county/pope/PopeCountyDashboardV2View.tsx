import Link from "next/link";
import {
  CountyActionPanel,
  CountyBattlefieldPanel,
  CountyChartPanel,
  CountyDashboardShell,
  CountyDataGapsPanel,
  CountyDrilldownGrid,
  CountyKpiStrip,
  CountyPowerOf5Panel,
  CountyRegionalContextPanel,
  CountyRiskPanel,
  CountyStrategyPanel,
} from "@/components/county/dashboard";
import { MessageIntelligencePanel } from "@/components/message-engine/MessageIntelligencePanel";
import { PopeIntelligenceStack } from "@/components/county/pope/PopeIntelligenceStack";
import { MessageHubLinkCard } from "@/components/integrations/MessageHubLinkCard";
import { PopeRelationalGraphDemoPanel } from "@/components/county/pope/PopeRelationalGraphDemoPanel";
import type { CountyDashboardKpiItem } from "@/lib/campaign-engine/county-dashboards/types";
import type { PopeCountyDashboardV2 } from "@/lib/campaign-engine/county-dashboards/pope-county-dashboard";
import { POPE_DASHBOARD_V2_DATA_NOTE } from "@/lib/campaign-engine/county-dashboards/pope-county-dashboard";
import { calculateActivation } from "@/lib/power-of-5/kpi";
import { cn, focusRing } from "@/lib/utils";

const POWER_OF_5_IMPACT =
  "Every completed Power Team increases local coverage and contributes to city, county, regional, and statewide rollups. Counts on this page are demo/seed until field systems connect; no individual voter data here.";

function buildPopeExecutiveKpis(e: PopeCountyDashboardV2["executive"]): CountyDashboardKpiItem[] {
  return [
    {
      label: "Population",
      metric: e.population,
      actionHint: "If ACS is missing, block win-number work until import — label shows source.",
    },
    { label: "Registered voters", metric: e.registeredVoters, actionHint: "Compare to general denominator; drive registration help CTAs." },
    {
      label: "’24 general turnout",
      metric: e.turnout2024,
      actionHint: "Close relational gaps where participation lags the county mean.",
    },
    { label: "Active Power Teams", metric: e.activePowerTeams, actionHint: "Recruit in dense tracts with thin relational nets." },
    {
      label: "Complete Power Teams",
      metric: e.completePowerTeams,
      actionHint: "Each completion unlocks a coverage multiplier in the model.",
    },
    { label: "People signed up", metric: e.peopleSignedUp, actionHint: "Move signups to activation + follow-up queues." },
    { label: "Coverage rate", metric: e.coverageRate, actionHint: "Assign captains where peer towns outperform." },
    {
      label: "Org. readiness",
      metric: e.organizingReadinessScore,
      actionHint: "Data gaps first, then people — do not out-organize false precision.",
    },
    {
      label: "Candidate pipeline",
      metric: e.candidatePipelineScore,
      actionHint: "Vet in private; this strip shows score only.",
    },
    { label: "Priority sort", metric: e.priorityLevel, actionHint: "Staff resourcing key — P1 = pull capacity here first." },
  ];
}

function buildPopePowerOf5Items(p: PopeCountyDashboardV2["powerOfFive"]): CountyDashboardKpiItem[] {
  const activationRate = calculateActivation({
    activated: p.peopleActivated.value,
    invited: p.peopleInvited.value,
  });
  return [
    { label: "Teams formed", metric: p.teamsFormed, actionHint: "Recruit where maps show unclaimed turf." },
    { label: "Teams complete", metric: p.teamsComplete, actionHint: "Stabilize rosters; celebrate wins publicly." },
    { label: "Incomplete", metric: p.teamsIncomplete, actionHint: "Two follow-up passes max per week per team lead." },
    { label: "Invited", metric: p.peopleInvited, actionHint: "Log invitation source (relational fairness)." },
    { label: "Activated", metric: p.peopleActivated, actionHint: "Tie to meaningful shifts, not vanity touches." },
    {
      label: "Activation rate (KPI engine)",
      metric: {
        value: activationRate,
        source: "derived",
        note: "peopleActivated ÷ peopleInvited on this page’s demo counts — `lib/power-of-5/kpi`.",
      },
      actionHint: "Raise quality of invites and same-week follow-up before chasing volume.",
    },
    { label: "Conversations", metric: p.conversationsLogged, actionHint: "Depth metrics for coaching, not shaming." },
    { label: "Follow-ups due", metric: p.followUpsDue, actionHint: "Triage before adding new names." },
    { label: "Weekly growth", metric: p.weeklyGrowth, actionHint: "Sustainable cadence; watch leader load." },
    { label: "Leader gaps", metric: p.leaderGaps, actionHint: "Backfill before opening new turf." },
    { label: "Completion rate", metric: p.teamCompletionRate, actionHint: "If stuck, fix onboarding not targets." },
  ];
}

export function PopeCountyDashboardV2View({ data }: { data: PopeCountyDashboardV2 }) {
  const e = data.executive;

  return (
    <CountyDashboardShell>
      <p className="text-sm text-kelly-text/65">
        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings/pope">
          ← Original Pope briefing
        </Link>{" "}
        ·{" "}
        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings">
          County briefings
        </Link>{" "}
        ·{" "}
        <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/counties/pope-county">
          County command
        </Link>
      </p>
      <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-kelly-slate/80">Gold sample · v2</p>
      <h1 className="font-heading mt-1 text-3xl font-bold tracking-tight text-kelly-navy md:text-4xl">{data.displayName}</h1>
      <p className="mt-0.5 text-lg font-semibold text-kelly-navy/80">Command dashboard</p>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-text/75">
        Dense, visual-first, drilldown-first. {POPE_DASHBOARD_V2_DATA_NOTE}
      </p>
      <p className="mt-3 rounded-md border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-sm text-amber-950">
        <strong>Data mix.</strong> Gold badges: <strong>DB / Derived</strong> = from ingest or profile math.{" "}
        <strong>Demo / seed</strong> = labeled illustration until field tools back it. No individual voter PII.
      </p>

      <CountyKpiStrip
        className="mt-7"
        overline="Executive + Power of 5"
        title="KPI command strip"
        description="Executive scale first, then relational depth (P5). Every metric shows source. Ask: who acts, and on what clock?"
        items={[...buildPopeExecutiveKpis(e), ...buildPopePowerOf5Items(data.powerOfFive)]}
        compact
      />

      <PopeIntelligenceStack className="mt-8" />

      <section className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CountyBattlefieldPanel
            labels={data.visualLabels}
            countyNameHint="Pope"
            primaryCityLabel="Russellville"
          />
        </div>
        <CountyStrategyPanel
          strongest={data.strategy.strongest}
          weakest={data.strategy.weakest}
          nextMove={data.strategy.nextOrganizingMove}
          footnote={
            data.registryCommandRegionLabel
              ? `Campaign: ${data.regionLabel} (${data.campaignRegionSlug ?? "—"}) · Registry command: ${data.registryCommandRegionLabel} — ids unchanged.`
              : `Campaign: ${data.regionLabel}.`
          }
        />
      </section>

      <CountyDrilldownGrid
        className="mt-8"
        pathwayCallout={
          <>
            <span className="font-bold text-kelly-navy/95">Path:</span> you are on <strong>County</strong> (this page) → open a{" "}
            <strong>City</strong> card below (design route: <code className="text-[10px]">/counties/pope-county/cities/…</code>
            ) → <strong>Community</strong> layer when neighborhood routes ship → <strong>Precinct</strong> from list + ethics gate
            → <strong>Power Team</strong> rosters in secure tools. Public view stays aggregate-only.
          </>
        }
        description="What does this turf mean, and what is the very next field move? Badges = demo city splits unless source says otherwise."
        cities={data.cities}
        precinctPlaceholders={data.precinctPlaceholders}
      />

      <CountyPowerOf5Panel
        className="mt-8"
        impactExplanation={POWER_OF_5_IMPACT}
        intro="Relational organiser view — not a public social graph. KPI counts sit in the strip above; this block is the shared six-stage ladder."
        items={[]}
        pipelineVariant="full"
      />

      <PopeRelationalGraphDemoPanel className="mt-8" graph={data.relationalGraphDemo} />

      <MessageIntelligencePanel
        className="mt-8"
        scope={{ level: "county", countyDisplayName: data.displayName, regionDisplayName: data.regionLabel }}
      />

      <MessageHubLinkCard
        className="mt-8"
        title="County message packet"
        description={
          <>
            County-colored lines and share copy for <strong>{data.displayName}</strong> volunteers live in the public message hub (narrative distribution
            registry). Message intelligence above stays aggregate; the hub holds the conversational shelf.
          </>
        }
        linkLabel="Open message hub — county shelf →"
      />

      <CountyChartPanel className="mt-8" charts={data.charts} />

      <CountyActionPanel
        className="mt-8"
        description="Queue for county leads. Each line item is assignable; next step is the smallest verifiable action."
        actions={data.nextActions}
      />

      <CountyRiskPanel
        className="mt-8"
        description="Not a media hit list — operational risks with owners. Severity drives stand-up order."
        risks={data.risks}
      />

      <CountyRegionalContextPanel
        className="mt-8"
        riverValleyNarrative={data.strategy.riverValleyRollup}
        regionLabel={data.regionLabel}
        registryCommandRegionLabel={data.registryCommandRegionLabel}
        stateOrganizingIntelligenceHref="/organizing-intelligence"
        regionOrganizingIntelligenceHref={
          data.campaignRegionSlug
            ? `/organizing-intelligence/regions/${data.campaignRegionSlug}`
            : "/organizing-intelligence/regions/river-valley"
        }
      />

      <CountyDataGapsPanel className="mt-8" dataWarnings={data.dataWarnings} priorityVoterOnRoll={data.priorityVoterOnRoll} />
    </CountyDashboardShell>
  );
}
