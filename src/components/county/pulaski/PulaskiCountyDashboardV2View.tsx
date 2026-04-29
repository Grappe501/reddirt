import Link from "next/link";
import {
  CountyActionPanel,
  CountyBattlefieldPanel,
  CountyBriefingDemoIntro,
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
  "Kelly’s relational training materials use an invite-and-follow-up scaffold to keep civic conversations humane at scale—this briefing shows empty slots intentionally so we never mimic live field dashboards on a marketing URL.";

function buildPulaskiExecutiveKpis(e: CountyDashboardV2["executive"]): CountyDashboardKpiItem[] {
  return [
    { metricKey: "pulaski-exec-population", label: "Population", metric: e.population, actionHint: "ACS block when ingest runs—otherwise null is honest." },
    { metricKey: "pulaski-exec-registered-voters", label: "Registered voters", metric: e.registeredVoters, actionHint: "Prefer SOS roll ingest over guesses." },
    { metricKey: "pulaski-exec-turnout-2024", label: "General turnout (latest row)", metric: e.turnout2024, actionHint: "Derived from ballots ÷ registrants where both exist." },
    { metricKey: "pulaski-exec-active-p5-teams", label: "Relational team slots (illustrative)", metric: e.activePowerTeams, actionHint: "Zeros — instructional placeholders only." },
    { metricKey: "pulaski-exec-complete-p5-teams", label: "Completed relationship circles (illustrative)", metric: e.completePowerTeams, actionHint: "Zeros — not live engagement counts." },
    { metricKey: "pulaski-exec-people-signed-up", label: "Supporter pledges tracked", metric: e.peopleSignedUp, actionHint: "Zeros — backend tools handle detail." },
    { metricKey: "pulaski-exec-coverage-rate", label: "Coverage index", metric: e.coverageRate, actionHint: "Placeholder zero — turnout modeling layered later." },
    { metricKey: "pulaski-exec-org-readiness", label: "Briefing completeness index", metric: e.organizingReadinessScore, actionHint: "Composite from ingest warnings — not an approval score." },
    { metricKey: "pulaski-exec-candidate-pipeline", label: "Bench depth (illustrative)", metric: e.candidatePipelineScore, actionHint: "Placeholder — not a hiring signal on this page." },
    { metricKey: "pulaski-exec-priority", label: "Priority band (illustrative)", metric: e.priorityLevel, actionHint: "Sort key for planning decks — not a goal." },
  ];
}

function buildPulaskiPowerOf5Items(p: CountyDashboardV2["powerOfFive"]): CountyDashboardKpiItem[] {
  const activationRate =
    p.peopleInvited.value > 0
      ? calculateActivation({ activated: p.peopleActivated.value, invited: p.peopleInvited.value })
      : 0;
  return [
    { metricKey: "pulaski-p5-teams-formed", label: "Teams formed", metric: p.teamsFormed, actionHint: "Data integration in progress." },
    { metricKey: "pulaski-p5-teams-complete", label: "Teams complete", metric: p.teamsComplete, actionHint: "Data integration in progress." },
    { metricKey: "pulaski-p5-teams-incomplete", label: "Incomplete", metric: p.teamsIncomplete, actionHint: "Data integration in progress." },
    { metricKey: "pulaski-p5-invited", label: "Invited", metric: p.peopleInvited, actionHint: "Illustrative zero." },
    { metricKey: "pulaski-p5-activated", label: "Activated", metric: p.peopleActivated, actionHint: "Illustrative zero." },
    {
      metricKey: "pulaski-p5-activation-rate",
      label: "Activation rate",
      metric: {
        value: p.peopleInvited.value > 0 ? activationRate : 0,
        source: p.peopleInvited.value > 0 ? "derived" : "demo",
        note:
          p.peopleInvited.value > 0
            ? "peopleActivated ÷ peopleInvited on this page."
            : "Invitation count is zero — rate held at zero (no invented invites).",
      },
      actionHint: "Turnout modeling to be layered when feeds qualify.",
    },
    { metricKey: "pulaski-p5-conversations", label: "Conversations", metric: p.conversationsLogged, actionHint: "Illustrative zero." },
    { metricKey: "pulaski-p5-followups-due", label: "Follow-ups due", metric: p.followUpsDue, actionHint: "Illustrative zero." },
    { metricKey: "pulaski-p5-weekly-growth", label: "Weekly growth", metric: p.weeklyGrowth, actionHint: "Illustrative zero." },
    { metricKey: "pulaski-p5-leader-gaps", label: "Leader gaps", metric: p.leaderGaps, actionHint: "Illustrative zero." },
    { metricKey: "pulaski-p5-completion-rate", label: "Completion rate", metric: p.teamCompletionRate, actionHint: "Illustrative zero." },
  ];
}

export function PulaskiCountyDashboardV2View({ data }: { data: CountyDashboardV2 }) {
  const e = data.executive;
  const pop = e.population.value ?? null;

  return (
    <CountyDashboardShell>
      <article aria-labelledby="pulaski-county-dashboard-title">
        <nav className="text-sm text-kelly-text/65" aria-label="County briefing navigation">
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings/pope/v2">
            Pope v2 reference (gold sample)
          </Link>{" "}
          <span aria-hidden>·</span>{" "}
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings/faulkner/v2">
            Faulkner v2 (central corridor)
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
        <p className="mt-0.5 text-lg font-semibold text-kelly-navy/80">County intelligence briefing</p>

        <CountyBriefingDemoIntro
          className="mt-6"
          eyebrow="Kelly for SOS · briefing deck"
          countyDisplayName={data.displayName}
          executiveSummary={`Pulaski anchors the capital, major in-state media markets, and one of Arkansas’s largest county electorates—so election administration credibility here echoes statewide. Figures below come from the county profile engine plus public demographic layers; granular city precinct cards stay off until sourced tabulations land.`}
          whyMattersBody={`As home to Little Rock and the seat of Arkansas government, Pulaski draws outsized scrutiny for registration access, filings, and ballot operations—exactly why this page publishes only verified aggregates.`}
          populationDisplay={pop}
          majorCitiesLine="County seat Little Rock anchors the county alongside North Little Rock, Jacksonville, Sherwood, and Maumelle—central Arkansas hubs with distinct precinct stories once integrated."
          growthPatternsNote="Commuting corridors and sub-town growth comparisons draw on ACS and census releases; municipality-level deltas for this deck are flagged data integration in progress until each place row attaches."
          politicalLandscape="Competitive elections and diverse precinct coalitions reward neutral administration: accurate voter lists, understandable ballot materials, and reliable reporting under press and legal scrutiny. Party-specific modeling belongs in sourced filings—not on this briefing."
          priorityWhyCountyMatters="Because the state capital and largest metro communities sit here, how Secretary of State services feel in Pulaski shapes trust for neighbors well beyond these lines on the map."
          whatWinningLooksLike={`Trustworthy turnout is consistent access to services—not a partisan “score”—plus timely reporting journalists can trace to certified canvass; no fabricated registration or GOTV quotas appear on this route.`}
          cityAnchors={[
            { name: "Little Rock", status: "Precinct-level breakdown pending — place integration in progress" },
            { name: "North Little Rock", status: "Turnout modeling to be layered after verified ingest" },
            { name: "Jacksonville", status: "Data integration in progress" },
            { name: "Sherwood", status: "Data integration in progress" },
            { name: "Maumelle", status: "Data integration in progress" },
          ]}
        />

        <div className="mt-6 rounded-lg border border-amber-300/70 bg-amber-50/90 px-3 py-3 text-sm text-amber-950" role="region" aria-label="City and precinct drilldown status">
          <p className="font-heading text-base font-bold text-kelly-navy">City & precinct detail</p>
          <p className="mt-1.5 leading-relaxed">
            Little Rock, North Little Rock, Jacksonville, Sherwood, Maumelle, and peer municipalities still need verified ACS place rolls + precinct canvass rows before mirrored city cards match the Pope template—no invented ward turnout on this public page.
          </p>
        </div>
        <p className="mt-3 rounded-md border border-kelly-blue/25 bg-kelly-blue/[0.06] px-3 py-2.5 text-sm text-kelly-navy/95">
          <strong>Data mix.</strong> Gold badges: <strong>DB / Derived</strong> = ingest or profile math. <strong>Demo</strong> = explicit
          scaffolding (zeros or placeholder bands)—never substituted as live certainty. {PULASKI_DASHBOARD_V2_DATA_NOTE}
        </p>

        <CountyKpiStrip
          className="mt-7"
          sectionHeadingId="pulaski-county-kpi-strip-heading"
          overline="County snapshot · model evolving"
          title="Key indicators (current snapshot)"
          description="Executive scale first, then instructional relationship metrics. Zeros mark slots reserved for future sourced rollups—never copied from other counties’ samples."
          items={[...buildPulaskiExecutiveKpis(e), ...buildPulaskiPowerOf5Items(data.powerOfFive)]}
          compact
        />

        <PulaskiCountyIntelligenceStack className="mt-8" />

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CountyBattlefieldPanel labels={data.visualLabels} countyNameHint="Pulaski" primaryCityLabel="Metro core — city cards pending ingest" />
          </div>
          <CountyStrategyPanel
            nextMoveLead="Next sourcing step"
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
          description="City tiles await verified ingest—see the community table above for named anchors and honest status lines."
          cities={data.cities}
          precinctPlaceholders={data.precinctPlaceholders}
          precinctGroupTitle="Precinct & city placeholders (verification pending)"
        />

        <CountyPowerOf5Panel
          className="mt-8"
          overline="Instructional relationship model"
          title="“Power of 5” ladder (teaching shape)"
          showOrganizingPipelines
          impactExplanation={POWER_OF_5_IMPACT}
          intro="Used in training to show how neighbor-to-neighbor follow-up scales—public marketing pages never host live field telemetry."
          items={[]}
          pipelineVariant="full"
        />

        <MessageIntelligencePanel
          className="mt-8"
          audience="publicBriefing"
          scope={{ level: "county", countyDisplayName: data.displayName, regionDisplayName: data.regionLabel }}
        />

        <MessageHubLinkCard
          className="mt-8"
          title={`How Kelly talks about ${data.displayName}`}
          description={
            <>
              Story shelf on <strong>Stories &amp; voices</strong> rotates messages that match this county&apos;s electorate—everything stays thematic,
              aggregate, and reviewer-friendly.
            </>
          }
          linkLabel="Open Stories & voices →"
        />

        <CountyChartPanel
          className="mt-8"
          charts={data.charts}
          description="Historical turnout pulls from county election rows where present—vote-share arcs stay at neutral until ingest supplies contest splits."
          title="Election history & illustrative pipelines"
        />

        <CountyActionPanel
          className="mt-8"
          description="Integrity checklist tied to sourcing—no staffing queues on public pages."
          actions={data.nextActions}
        />

        <CountyRiskPanel
          className="mt-8"
          description="Governance tensions that show up around big-county administrations."
          risks={data.risks}
        />

        <CountyRegionalContextPanel
          className="mt-8"
          overline="How this sits in Arkansas"
          title="Statewide posture"
          riverValleyNarrative={data.strategy.riverValleyRollup}
          regionLabel={data.regionLabel}
          registryCommandRegionLabel={data.registryCommandRegionLabel}
          stateCampaignHref="/priorities"
        />

        <CountyDataGapsPanel className="mt-8" dataWarnings={data.dataWarnings} priorityVoterOnRoll={data.priorityVoterOnRoll} />
      </article>
    </CountyDashboardShell>
  );
}
