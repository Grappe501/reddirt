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
import { PulaskiCountyIntelligenceStack } from "@/components/county/pulaski/PulaskiCountyIntelligenceStack";
import { MessageHubLinkCard } from "@/components/integrations/MessageHubLinkCard";
import type { CountyDashboardKpiItem, CountyDashboardV2 } from "@/lib/campaign-engine/county-dashboards/types";
import { PULASKI_DASHBOARD_V2_DATA_NOTE } from "@/lib/campaign-engine/county-dashboards/pulaski-county-dashboard";
import { calculateActivation } from "@/lib/power-of-5/kpi";
import { cn, focusRing } from "@/lib/utils";

const POWER_OF_5_IMPACT =
  "Power Team depth should roll up here when field systems connect. This Pulaski briefing uses zeroed relational counts—not the Pope County seed graph—until telemetry is wired. No individual voter data on this route.";

function buildPulaskiExecutiveKpis(e: CountyDashboardV2["executive"]): CountyDashboardKpiItem[] {
  return [
    { metricKey: "pulaski-exec-population", label: "Population", metric: e.population, actionHint: "ACS block when ingest runs—otherwise null is honest." },
    { metricKey: "pulaski-exec-registered-voters", label: "Registered voters", metric: e.registeredVoters, actionHint: "Prefer SOS roll ingest over static guesses." },
    { metricKey: "pulaski-exec-turnout-2024", label: "General turnout (latest row)", metric: e.turnout2024, actionHint: "Derived from ballots ÷ registrants where both exist." },
    { metricKey: "pulaski-exec-active-p5-teams", label: "Active Power Teams", metric: e.activePowerTeams, actionHint: "Zeros until relational graph lands for Pulaski." },
    { metricKey: "pulaski-exec-complete-p5-teams", label: "Complete Power Teams", metric: e.completePowerTeams, actionHint: "Zeros until telemetry connects." },
    { metricKey: "pulaski-exec-people-signed-up", label: "People signed up", metric: e.peopleSignedUp, actionHint: "Zeros — no public substitute roll." },
    { metricKey: "pulaski-exec-coverage-rate", label: "Coverage rate", metric: e.coverageRate, actionHint: "Placeholder zero—not a pathway-to-victory map." },
    { metricKey: "pulaski-exec-org-readiness", label: "Org. readiness", metric: e.organizingReadinessScore, actionHint: "Composite from ingest warnings—calibrate against field reality." },
    { metricKey: "pulaski-exec-candidate-pipeline", label: "Candidate pipeline", metric: e.candidatePipelineScore, actionHint: "Score not asserted externally—private vetting only." },
    { metricKey: "pulaski-exec-priority", label: "Priority sort", metric: e.priorityLevel, actionHint: "Staff sort key—not a turnout target." },
  ];
}

function buildPulaskiPowerOf5Items(p: CountyDashboardV2["powerOfFive"]): CountyDashboardKpiItem[] {
  const activationRate =
    p.peopleInvited.value > 0
      ? calculateActivation({ activated: p.peopleActivated.value, invited: p.peopleInvited.value })
      : 0;
  return [
    { metricKey: "pulaski-p5-teams-formed", label: "Teams formed", metric: p.teamsFormed, actionHint: "Awaiting ingest." },
    { metricKey: "pulaski-p5-teams-complete", label: "Teams complete", metric: p.teamsComplete, actionHint: "Awaiting ingest." },
    { metricKey: "pulaski-p5-teams-incomplete", label: "Incomplete", metric: p.teamsIncomplete, actionHint: "Awaiting ingest." },
    { metricKey: "pulaski-p5-invited", label: "Invited", metric: p.peopleInvited, actionHint: "Zeros — scaffold only." },
    { metricKey: "pulaski-p5-activated", label: "Activated", metric: p.peopleActivated, actionHint: "Zeros — scaffold only." },
    {
      metricKey: "pulaski-p5-activation-rate",
      label: "Activation rate",
      metric: {
        value: p.peopleInvited.value > 0 ? activationRate : 0,
        source: p.peopleInvited.value > 0 ? "derived" : "demo",
        note:
          p.peopleInvited.value > 0
            ? "peopleActivated ÷ peopleInvited on this page."
            : "Invitation count is zero — rate held at zero (no fabricated invites).",
      },
      actionHint: "Raise invite quality once telemetry exists.",
    },
    { metricKey: "pulaski-p5-conversations", label: "Conversations", metric: p.conversationsLogged, actionHint: "Scaffold zeros." },
    { metricKey: "pulaski-p5-followups-due", label: "Follow-ups due", metric: p.followUpsDue, actionHint: "Scaffold zeros." },
    { metricKey: "pulaski-p5-weekly-growth", label: "Weekly growth", metric: p.weeklyGrowth, actionHint: "Scaffold zeros." },
    { metricKey: "pulaski-p5-leader-gaps", label: "Leader gaps", metric: p.leaderGaps, actionHint: "Scaffold zeros." },
    { metricKey: "pulaski-p5-completion-rate", label: "Completion rate", metric: p.teamCompletionRate, actionHint: "Scaffold zeros." },
  ];
}

export function PulaskiCountyDashboardV2View({ data }: { data: CountyDashboardV2 }) {
  const e = data.executive;

  return (
    <CountyDashboardShell>
      <article aria-labelledby="pulaski-county-dashboard-title">
        <nav className="text-sm text-kelly-text/65" aria-label="County briefing navigation">
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings/pope/v2">
            Pope v2 reference (gold sample)
          </Link>{" "}
          <span aria-hidden>·</span>{" "}
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings">
            County briefings hub
          </Link>{" "}
          <span aria-hidden>·</span>{" "}
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/counties/pulaski-county">
            County overview
          </Link>
        </nav>
        <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-kelly-slate/80">Central Arkansas · Pulaski · v2</p>
        <h1 id="pulaski-county-dashboard-title" className="font-heading mt-1 text-3xl font-bold tracking-tight text-kelly-navy md:text-4xl">
          {data.displayName}
        </h1>
        <p className="mt-0.5 text-lg font-semibold text-kelly-navy/80">County briefing dashboard</p>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-kelly-text/75">
          Dense shell matching the Pope template; Pulaski relational metrics are scaffold zeros until ingest connects.{" "}
          <span className="font-medium">{PULASKI_DASHBOARD_V2_DATA_NOTE}</span>
        </p>
        <div className="mt-4 rounded-lg border border-amber-300/70 bg-amber-50/90 px-3 py-3 text-sm text-amber-950" role="region" aria-label="City and precinct drilldown status">
          <p className="font-heading text-base font-bold text-kelly-navy">Precinct and city data needed</p>
          <p className="mt-1.5 leading-relaxed">
            Verified place splits for Little Rock, North Little Rock, Jacksonville, Sherwood, Maumelle, and peer municipalities are{" "}
            <strong>not</strong> on this briefing yet—no invented city or precinct turnout. When ACS place aggregates and precinct
            tabulations are approved for ingest, municipal cards can mirror the Pope grid.
          </p>
        </div>
        <p className="mt-3 rounded-md border border-kelly-blue/25 bg-kelly-blue/[0.06] px-3 py-2.5 text-sm text-kelly-navy/95">
          <strong>Data mix.</strong> Gold badges: <strong>DB / Derived</strong> = ingest or profile math. <strong>Demo</strong> = explicit
          scaffolding (zeros or placeholder bands)—never substituted as live field certainty.
        </p>

        <CountyKpiStrip
          className="mt-7"
          sectionHeadingId="pulaski-county-kpi-strip-heading"
          overline="Executive + Power of 5"
          title="KPI overview strip"
          description="Executive scale first, then relational depth. Pulaski relational counts are scaffold zeros—not copied from Pope."
          items={[...buildPulaskiExecutiveKpis(e), ...buildPulaskiPowerOf5Items(data.powerOfFive)]}
          compact
        />

        <PulaskiCountyIntelligenceStack className="mt-8" />

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CountyBattlefieldPanel labels={data.visualLabels} countyNameHint="Pulaski" primaryCityLabel="Metro core — city cards pending ingest" />
          </div>
          <CountyStrategyPanel
            strongest={data.strategy.strongest}
            weakest={data.strategy.weakest}
            nextMove={data.strategy.nextOrganizingMove}
            footnote={
              data.registryCommandRegionLabel
                ? `Campaign: ${data.regionLabel} (${data.campaignRegionSlug ?? "—"}) · Registry command: ${data.registryCommandRegionLabel}.`
                : `Campaign: ${data.regionLabel}.`
            }
          />
        </section>

        <CountyDrilldownGrid
          className="mt-8"
          pathwayCallout={
            <>
              <span className="font-bold text-kelly-navy/95">Path:</span> you are on <strong>County</strong>; <strong>City</strong> drilldown routes
              (e.g. <code className="text-[10px]">/counties/pulaski-county/cities/…</code>) activate after ingest—not mocked here.
            </>
          }
          title="City & town drilldown"
          description="No city tiles yet — see “Precinct and city data needed” above. Placeholders list stands in for precinct keys until geography is verified."
          cities={data.cities}
          precinctPlaceholders={data.precinctPlaceholders}
          precinctGroupTitle="Precinct & city placeholders (verification pending)"
        />

        <CountyPowerOf5Panel
          className="mt-8"
          impactExplanation={POWER_OF_5_IMPACT}
          intro="Relational organiser stance — scaffold zeros until Pulaski field tools echo aggregates here."
          items={[]}
          pipelineVariant="full"
        />

        <MessageIntelligencePanel
          className="mt-8"
          scope={{ level: "county", countyDisplayName: data.displayName, regionDisplayName: data.regionLabel }}
        />

        <MessageHubLinkCard
          className="mt-8"
          title="County message packet"
          description={
            <>
              Narrative shelves for <strong>{data.displayName}</strong> organizers stay aggregate-only until counsel approves localizations.
            </>
          }
          linkLabel="Open message hub — county shelf →"
        />

        <CountyChartPanel
          className="mt-8"
          charts={data.charts}
          description="Historical turnout pulls from county election rows when present. Vote-share and relational spark lines stay at zero—not fabricated substitutes. Volunteer/candidate pipelines are scaffold until CRM fields map."
          title="Trends & pipelines"
        />

        <CountyActionPanel
          className="mt-8"
          description="Assignable queue — focused on ingest and ethics gates before granular turf claims."
          actions={data.nextActions}
        />

        <CountyRiskPanel
          className="mt-8"
          description="Operational risks with owners—not media hits. Severity informs stand-ups."
          risks={data.risks}
        />

        <CountyRegionalContextPanel
          className="mt-8"
          riverValleyNarrative={data.strategy.riverValleyRollup}
          regionLabel={data.regionLabel}
          registryCommandRegionLabel={data.registryCommandRegionLabel}
          stateOrganizingIntelligenceHref="/organizing-intelligence"
          regionOrganizingIntelligenceHref={
            data.campaignRegionSlug ? `/organizing-intelligence/regions/${data.campaignRegionSlug}` : "/organizing-intelligence/regions/central-arkansas"
          }
        />

        <CountyDataGapsPanel className="mt-8" dataWarnings={data.dataWarnings} priorityVoterOnRoll={data.priorityVoterOnRoll} />
      </article>
    </CountyDashboardShell>
  );
}
