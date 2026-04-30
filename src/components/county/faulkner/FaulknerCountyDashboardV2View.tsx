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
import { FaulknerCountyIntelligenceStack } from "@/components/county/faulkner/FaulknerCountyIntelligenceStack";
import { MessageHubLinkCard } from "@/components/integrations/MessageHubLinkCard";
import type { CountyDashboardKpiItem, CountyDashboardV2 } from "@/lib/campaign-engine/county-dashboards/types";
import { FAULKNER_DASHBOARD_V2_DATA_NOTE } from "@/lib/campaign-engine/county-dashboards/faulkner-county-dashboard";
import { calculateActivation } from "@/lib/power-of-5/kpi";
import { cn, focusRing } from "@/lib/utils";

const POWER_OF_5_IMPACT =
  "Kelly trains teams on humane follow-up loops for civic conversations. This briefing uses empty relationship KPIs by design so marketing viewers never mistake the page for internal dashboards.";

function buildFaulknerExecutiveKpis(e: CountyDashboardV2["executive"]): CountyDashboardKpiItem[] {
  return [
    { metricKey: "faulkner-exec-population", label: "Population", metric: e.population, actionHint: "ACS block when ingest runs—otherwise null is honest." },
    { metricKey: "faulkner-exec-registered-voters", label: "Registered voters", metric: e.registeredVoters, actionHint: "Prefer SOS roll ingest over guesses." },
    { metricKey: "faulkner-exec-turnout-2024", label: "General turnout (latest row)", metric: e.turnout2024, actionHint: "Derived from ballots ÷ registrants where both exist." },
    { metricKey: "faulkner-exec-active-p5-teams", label: "Relational team slots (illustrative)", metric: e.activePowerTeams, actionHint: "Zeros — instructional placeholders only." },
    { metricKey: "faulkner-exec-complete-p5-teams", label: "Completed relationship circles (illustrative)", metric: e.completePowerTeams, actionHint: "Zeros — not live engagement counts." },
    { metricKey: "faulkner-exec-people-signed-up", label: "Supporter pledges tracked", metric: e.peopleSignedUp, actionHint: "Zeros — backend tools handle detail." },
    { metricKey: "faulkner-exec-coverage-rate", label: "Coverage index", metric: e.coverageRate, actionHint: "Placeholder zero — turnout modeling layered later." },
    { metricKey: "faulkner-exec-org-readiness", label: "Briefing completeness index", metric: e.organizingReadinessScore, actionHint: "Composite from ingest warnings." },
    { metricKey: "faulkner-exec-candidate-pipeline", label: "Bench depth (illustrative)", metric: e.candidatePipelineScore, actionHint: "Placeholder — not a hiring signal on this page." },
    { metricKey: "faulkner-exec-priority", label: "Priority band (illustrative)", metric: e.priorityLevel, actionHint: "Planning sort key — not a goal." },
  ];
}

function buildFaulknerPowerOf5Items(p: CountyDashboardV2["powerOfFive"]): CountyDashboardKpiItem[] {
  const activationRate =
    p.peopleInvited.value > 0
      ? calculateActivation({ activated: p.peopleActivated.value, invited: p.peopleInvited.value })
      : 0;
  return [
    { metricKey: "faulkner-p5-teams-formed", label: "Teams formed", metric: p.teamsFormed, actionHint: "Data integration in progress." },
    { metricKey: "faulkner-p5-teams-complete", label: "Teams complete", metric: p.teamsComplete, actionHint: "Data integration in progress." },
    { metricKey: "faulkner-p5-teams-incomplete", label: "Incomplete", metric: p.teamsIncomplete, actionHint: "Data integration in progress." },
    { metricKey: "faulkner-p5-invited", label: "Invited", metric: p.peopleInvited, actionHint: "Illustrative zero." },
    { metricKey: "faulkner-p5-activated", label: "Activated", metric: p.peopleActivated, actionHint: "Illustrative zero." },
    {
      metricKey: "faulkner-p5-activation-rate",
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
    { metricKey: "faulkner-p5-conversations", label: "Conversations", metric: p.conversationsLogged, actionHint: "Illustrative zero." },
    { metricKey: "faulkner-p5-followups-due", label: "Follow-ups due", metric: p.followUpsDue, actionHint: "Illustrative zero." },
    { metricKey: "faulkner-p5-weekly-growth", label: "Weekly growth", metric: p.weeklyGrowth, actionHint: "Illustrative zero." },
    { metricKey: "faulkner-p5-leader-gaps", label: "Leader gaps", metric: p.leaderGaps, actionHint: "Illustrative zero." },
    { metricKey: "faulkner-p5-completion-rate", label: "Completion rate", metric: p.teamCompletionRate, actionHint: "Illustrative zero." },
  ];
}

export function FaulknerCountyDashboardV2View({ data }: { data: CountyDashboardV2 }) {
  const e = data.executive;
  const pop = e.population.value ?? null;

  return (
    <CountyDashboardShell>
      <article aria-labelledby="faulkner-county-dashboard-title">
        <nav className="text-sm text-kelly-text/65" aria-label="County briefing navigation">
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings/pope/v2">
            Pope v2 reference (gold sample)
          </Link>{" "}
          <span aria-hidden>·</span>{" "}
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings/pulaski/v2">
            Pulaski v2 (metro central)
          </Link>{" "}
          <span aria-hidden>·</span>{" "}
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/county-briefings">
            County briefings hub
          </Link>{" "}
          <span aria-hidden>·</span>{" "}
          <Link className={cn(focusRing, "rounded-sm font-semibold text-kelly-navy underline")} href="/counties/faulkner-county">
            County overview
          </Link>
        </nav>
        <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-kelly-slate/80">Central Arkansas · Faulkner · v2</p>
        <h1 id="faulkner-county-dashboard-title" className="font-heading mt-1 text-3xl font-bold tracking-tight text-kelly-navy md:text-4xl">
          {data.displayName}
        </h1>
        <p className="mt-0.5 text-lg font-semibold text-kelly-navy/80">County intelligence briefing</p>

        <CountyBriefingDemoIntro
          className="mt-6"
          eyebrow="Kelly for SOS · briefing deck"
          countyDisplayName={data.displayName}
          executiveSummary={`Faulkner’s growth along the Little Rock–Conway corridor makes everyday interactions with the Secretary of State’s office — registration, filings, election operations — a live test of accessibility for suburban and small-town Arkansans alike. This route only publishes figures that clear the county profile engine; city and precinct narratives stay labeled “in progress” until ACS and canvass rows attach.`}
          whyMattersBody={`Fast-growing central Arkansas counties are where Arkansans first feel whether state agencies keep pace—with clear forms, fair deadlines, and services that respect commuters and rural enclaves equally.`}
          populationDisplay={pop}
          majorCitiesLine="Conway serves as county seat with Greenbrier, Vilonia, and Mayflower among familiar community anchors—plus smaller towns that still depend on dependable SOS touchpoints."
          growthPatternsNote="Place-level demographic deltas are cited only after ingest; until then statistical portraits are marked data integration in progress. Remember: Conway (city) sits in Faulkner County—separate from Conway County elsewhere in the state."
          politicalLandscape="Election seasons bring simultaneous metro media attention and hometown races; credible SOS administration shows up in accurate rosters, precinct maps people can read, and calm handling of close contests—never in unverified place-level claims."
          priorityWhyCountyMatters="When suburbs and small cities share a ballot ecosystem, sloppy paperwork or confusing portals hit working families before they ever make headlines in the capital."
          whatWinningLooksLike={`Winning the argument for this office means voters recognize the Secretary of State delivered clarity—registration that works, filings that are navigable, election information that is complete—without publishing invented turnout or funding targets on a marketing page.`}
          cityAnchors={[
            { name: "Conway (city — Faulkner County)", status: "Precinct-level breakdown pending — not Conway County elsewhere" },
            { name: "Greenbrier", status: "Data integration in progress" },
            { name: "Vilonia", status: "Data integration in progress" },
            { name: "Mayflower", status: "Data integration in progress" },
          ]}
        />

        <div className="mt-6 rounded-lg border border-amber-300/70 bg-amber-50/90 px-3 py-3 text-sm text-amber-950" role="region" aria-label="City and precinct drilldown status">
          <p className="font-heading text-base font-bold text-kelly-navy">City & precinct detail</p>
          <p className="mt-1.5 leading-relaxed">
            Conway (city), Greenbrier, Vilonia, Mayflower, and peer municipalities still need verified ACS place aggregates plus precinct canvass rows before city mirror cards rival the Pope sample—no invented ward turnout here.
          </p>
        </div>
        <p className="mt-3 rounded-md border border-kelly-blue/25 bg-kelly-blue/[0.06] px-3 py-2.5 text-sm text-kelly-navy/95">
          <strong>Data mix.</strong> Gold badges: <strong>DB / Derived</strong> = ingest or profile math. <strong>Demo</strong> = explicit
          scaffolding (zeros or placeholder bands)—never substituted as live certainty. {FAULKNER_DASHBOARD_V2_DATA_NOTE}
        </p>

        <CountyKpiStrip
          className="mt-7"
          sectionHeadingId="faulkner-county-kpi-strip-heading"
          overline="County snapshot · model evolving"
          title="Key indicators (current snapshot)"
          description="Executive scale first, then instructional relationship metrics—zeros mark honest gaps, not hidden failures."
          items={[...buildFaulknerExecutiveKpis(e), ...buildFaulknerPowerOf5Items(data.powerOfFive)]}
          compact
        />

        <FaulknerCountyIntelligenceStack className="mt-8" />

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CountyBattlefieldPanel
              labels={data.visualLabels}
              countyNameHint="Faulkner"
              primaryCityLabel="County-seat & corridor cities — municipal cards pending ingest"
            />
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
              <span className="font-bold text-kelly-navy/95">Path:</span> you are on <strong>County</strong>; city drilldown routes
              (e.g. <code className="text-[10px]">/counties/faulkner-county/cities/…</code>) open once verified geography ships.
            </>
          }
          title="City & town drilldown"
          description="City tiles await verified ingest—see the community table above for honest placeholder language."
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
          intro="Same pedagogical ladder as staff manuals—this public surface keeps empty slots instead of simulating private dashboards."
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
              The Stories &amp; voices shelf captures the tone Kelly brings to central Arkansas—aggregate themes only, ready for press or
              curious neighbors.
            </>
          }
          linkLabel="Open Stories & voices →"
        />

        <CountyChartPanel
          className="mt-8"
          charts={data.charts}
          description="Turnout bars reflect whatever general-election rows exist for this county; illustrative relationship pipelines stay at neutral until sourced feeds qualify."
          title="Election history & illustrative pipelines"
        />

        <CountyActionPanel
          className="mt-8"
          description="Integrity checklist tied to sourcing—no staffing queues on public pages."
          actions={data.nextActions}
        />

        <CountyRiskPanel
          className="mt-8"
          description="Risks that show up when rapid growth collides with election administration expectations."
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
