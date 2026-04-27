/**
 * Pope County — County Dashboard v2 data shape (OIS / COUNTY-INTEL prototype).
 * Merges live political profile + priority meta with clearly labeled demo/seed fields
 * where relational Power of 5 and city/precinct maps are not in DB yet.
 */
import { getRegistryCountyBySlug, type ArCommandRegionId } from "@/lib/county/arkansas-county-registry";
import { resolveRegionPresentationForCounty } from "../regions/arkansas-campaign-regions";
import { buildPopeCountyPoliticalProfile, getPopeCountyPriorityPlanMeta } from "../county-profiles/pope-county";
import type { CountyPoliticalProfileResult } from "../county-political-profile";
import type {
  CountyDashboardV2,
  CountyDashboardStrategyNarrative,
  CountyDashboardCityDrilldown,
  CountyDashboardChartBundle,
  CountyDashboardNextAction,
  CountyDashboardRiskRow,
} from "./types";
import type { PopeDemoRelationalGraph } from "@/lib/power-of-5/demo/pope-seed";
import { buildPopeDemoRelationalGraph, getPopeDemoPowerOfFiveRollup } from "@/lib/power-of-5/demo/pope-seed";
import { calculateCoverage } from "@/lib/power-of-5/kpi";
import { buildPowerOf5RelationalChartDemo } from "@/lib/power-of-5/relational-chart-demos";

export const POPE_DASHBOARD_V2_DATA_NOTE =
  "Demo/seed: Power of 5, city splits, map panels, and several KPIs are illustrative until field systems back them." as const;

/** Pope builder output: shared `CountyDashboardV2` + engine profile for audit/honest gaps. */
export type PopeCountyDashboardV2 = CountyDashboardV2 & {
  profile: CountyPoliticalProfileResult;
  /** Pope-only synthetic relational graph; aligns Power of 5 strip with demo seed. */
  relationalGraphDemo: PopeDemoRelationalGraph;
};

export type {
  CountyDashboardLabeledMetric as LabeledMetric,
  CountyDashboardExecutiveKpiStrip as PopeExecutiveKpiStrip,
  CountyDashboardCityDrilldown as PopeCityDrilldown,
  CountyDashboardPowerOfFiveKpis as PopePowerOfFiveKpis,
  CountyDashboardChartPoint as ChartPoint,
  CountyDashboardChartBundle as PopeChartBundle,
  CountyDashboardNextAction as PopeNextAction,
  CountyDashboardRiskRow as PopeRiskRow,
  CountyDashboardStrategyNarrative as PopeStrategyNarrative,
} from "./types";

function computeGeneralTurnoutPct(p: CountyPoliticalProfileResult): number | null {
  const g = p.turnoutProfile.lastGeneral;
  if (!g) return null;
  if (g.ballotsCast != null && g.registeredVoters != null && g.registeredVoters > 0) {
    return Math.round((g.ballotsCast / g.registeredVoters) * 1000) / 10;
  }
  if (g.votePercent != null) return Math.round(g.votePercent * 10) / 10;
  return null;
}

function computeOrganizingReadiness(
  p: CountyPoliticalProfileResult,
  priCount: number | null,
): { score: number; source: "derived" | "demo"; note: string } {
  // Heuristic: fewer missing-data warnings and precinct rows present → higher readiness
  const warnN = p.missingDataWarnings.length;
  const precinctOk = p.dataStatus.electionPrecinctRowCount > 0 ? 1 : 0;
  const voterFile = priCount != null && priCount > 0 ? 1 : 0;
  const base = 45 + (precinctOk ? 12 : 0) + (voterFile ? 10 : 0) - Math.min(25, warnN * 3);
  const score = Math.max(12, Math.min(92, base));
  return {
    score,
    source: "derived",
    note: "Composite from data completeness signals (not a field performance grade). " + POPE_DASHBOARD_V2_DATA_NOTE,
  };
}

/**
 * Assembles Pope v2 dashboard — safe for public route: no PII, demos labeled.
 */
export async function buildPopeCountyDashboardV2(): Promise<PopeCountyDashboardV2> {
  const relationalGraphDemo = buildPopeDemoRelationalGraph();
  const demoP5 = getPopeDemoPowerOfFiveRollup(relationalGraphDemo);

  const [profile, pri] = await Promise.all([buildPopeCountyPoliticalProfile(), getPopeCountyPriorityPlanMeta()]);

  const c = profile.county;
  const regFromFile = pri?.voterOnRollCount ?? profile.registrationProfile.lastKnownRegisteredFromResults ?? null;
  /** When file roll is missing, show a rounded demo for UX — always labeled. */
  const reg =
    regFromFile ??
    38_200;
  const regSource: "db" | "demo" = regFromFile != null ? "db" : "demo";
  const regNote = regFromFile == null ? "Illustrative county roll (verify against SOS export)." : undefined;
  const pop = profile.censusAcsBls.censusPopulation;
  const turnout = computeGeneralTurnoutPct(profile);
  const turnoutForStrip = turnout ?? 51.2;
  const turnoutSource: "derived" | "demo" = turnout != null ? "derived" : "demo";
  const turnoutNote = turnout == null ? "Placeholders use ~51% when general row is incomplete—verify with certified results." : undefined;
  const readiness = computeOrganizingReadiness(profile, regFromFile);

  const teamsIncomplete = demoP5.teamsIncomplete;
  const completionRate = demoP5.completionRate;

  // Coverage: demo target team count (aligned with relational seed scale) via shared KPI engine
  const targetTeams = 16;
  const coverageDemo = calculateCoverage({ activeUnits: demoP5.activeTeams, targetUnits: targetTeams });

  const regCounty = getRegistryCountyBySlug("pope-county");
  const regionId: ArCommandRegionId = regCounty?.regionId ?? "central";
  const fips = regCounty?.fips ?? "05115";
  /** CANON-REGION-1: registry stays `central`; stakeholder display via FIPS override → River Valley. */
  const regionPres = resolveRegionPresentationForCounty(fips, regionId);
  const regionLabel = regionPres.campaignRegionDisplayName;

  const strategy: CountyDashboardStrategyNarrative = {
    strongest: profile.talkingPoints.strong[0] ?? "Civic anchors and student/community hubs when organized.",
    weakest:
      profile.precinctMapData.lowTurnoutOpportunities[0]?.note ??
      profile.missingDataWarnings[0] ??
      "List-driven GOTV and precinct coverage are still being filled in—treat public numbers as planning signals only.",
    nextOrganizingMove:
      "Close complete Power Team gaps in the largest city card (Russellville) while recruiting block-level captains in smaller towns to lift coverage without over-centralizing the county.",
    riverValleyRollup:
      "Pope is modeled under the same regional ladder as the River Valley / central belt unless taxonomy is re-mapped. County KPIs are designed to roll into region and state without bespoke math per page.",
    powerOfFiveLift:
      "Each complete Power Team adds a multiplier: follow-ups, relational invitations, and local hosts—feeding aggregate coverage % and lowering turnout gaps in the drilldown cards.",
  };

  const cities: CountyDashboardCityDrilldown[] = [
    {
      key: "russellville",
      displayName: "Russellville",
      population: { value: 29524, source: "demo", note: "Rounded demo stand-in (verify against ACS place table)." },
      registeredVoters: { value: 18000, source: "demo", note: "Illustrative share of county roll; not a file export." },
      powerTeams: { value: 5, source: "demo", note: "Illustrative split; county total matches demo graph (10 teams)." },
      coveragePct: { value: 58, source: "demo" },
      turnoutGapPct: { value: 6.2, source: "demo", note: "Gap vs planning turnout target (illustration)." },
      priorityScore: { value: 88, source: "demo" },
      nextAction: "Complete two more Power Teams; assign a city captain to weekly follow-up rhythm.",
      futureCityHref: "/counties/pope-county/cities/russellville",
      futurePrecinctPattern: "/counties/pope-county/cities/russellville/precincts/[id]",
    },
    {
      key: "atkins",
      displayName: "Atkins",
      population: { value: 3200, source: "demo" },
      registeredVoters: { value: 2400, source: "demo" },
      powerTeams: { value: 2, source: "demo" },
      coveragePct: { value: 32, source: "demo" },
      turnoutGapPct: { value: 9.1, source: "demo" },
      priorityScore: { value: 62, source: "demo" },
      nextAction: "Recruit a town captain; pair with a Russellville lead for a joint weekend listening session.",
      futureCityHref: "/counties/pope-county/cities/atkins",
      futurePrecinctPattern: "/counties/pope-county/cities/atkins/precincts/[id]",
    },
    {
      key: "dover",
      displayName: "Dover",
      population: { value: 1800, source: "demo" },
      registeredVoters: { value: 1200, source: "demo" },
      powerTeams: { value: 1, source: "demo" },
      coveragePct: { value: 24, source: "demo" },
      turnoutGapPct: { value: 11.4, source: "demo" },
      priorityScore: { value: 55, source: "demo" },
      nextAction: "Lightweight church/service club outreach to stand up one complete team this month.",
      futureCityHref: "/counties/pope-county/cities/dover",
      futurePrecinctPattern: "/counties/pope-county/cities/dover/precincts/[id]",
    },
    {
      key: "pottsville",
      displayName: "Pottsville",
      population: { value: 2000, source: "demo" },
      registeredVoters: { value: 1500, source: "demo" },
      powerTeams: { value: 1, source: "demo" },
      coveragePct: { value: 28, source: "demo" },
      turnoutGapPct: { value: 10.2, source: "demo" },
      priorityScore: { value: 58, source: "demo" },
      nextAction: "Map hosts for neighborhood canvasses; route invites through existing Power Team members.",
      futureCityHref: "/counties/pope-county/cities/pottsville",
      futurePrecinctPattern: "/counties/pope-county/cities/pottsville/precincts/[id]",
    },
    {
      key: "hector",
      displayName: "Hector",
      population: { value: 400, source: "demo" },
      registeredVoters: { value: 310, source: "demo" },
      powerTeams: { value: 1, source: "demo", note: "City rows sum to 10 teams — matches county demo graph." },
      coveragePct: { value: 12, source: "demo" },
      turnoutGapPct: { value: 14, source: "demo" },
      priorityScore: { value: 44, source: "demo" },
      nextAction: "Pair with a regional organizer to avoid burnout—goal is one reliable team, not full density yet.",
      futureCityHref: "/counties/pope-county/cities/hector",
      futurePrecinctPattern: "/counties/pope-county/cities/hector/precincts/[id]",
    },
  ];

  const charts: CountyDashboardChartBundle = {
    turnoutTrend: [
      { label: "2020", value: 58 },
      { label: "2022", value: 52 },
      { label: "2024", value: Math.round(turnoutForStrip * 10) / 10 },
    ],
    voteShareTrend: [
      { label: "’20 D share (demo)", value: 36 },
      { label: "’22 D share (demo)", value: 35 },
      { label: "’24 D share (demo)", value: 38 },
    ],
    powerTeamGrowth: [
      { label: "Jan", value: 4 },
      { label: "Feb", value: 6 },
      { label: "Mar", value: 8 },
      { label: "Apr", value: demoP5.activeTeams },
    ],
    coverageByCity: cities.map((x) => ({ label: x.displayName, value: x.coveragePct.value })),
    volunteerPipeline: [
      { label: "signed interest", value: relationalGraphDemo.summary.userCount },
      { label: "onboarded", value: relationalGraphDemo.summary.usersWithNode },
      { label: "active shifts", value: relationalGraphDemo.summary.activeNodes },
    ],
    candidatePipeline: [
      { label: "prospect pipeline", value: 6 },
      { label: "in conversation", value: 3 },
      { label: "ready to public launch", value: 1 },
    ],
    issueIntensity: [
      { issue: "Election access / early voting", score: 78 },
      { issue: "Youth + campus civic hubs", score: 64 },
      { issue: "Rural service delivery", score: 52 },
    ],
    relational: buildPowerOf5RelationalChartDemo({
      invited: demoP5.invited,
      activated: demoP5.activated,
      conversations: demoP5.conversations,
      followUpsDue: demoP5.followUps,
      teamsLinkedApprox: demoP5.completeTeams,
    }),
  };

  const nextActions: CountyDashboardNextAction[] = [
    {
      id: "a1",
      title: "Complete Power Teams in Russellville (close the largest coverage bucket).",
      ownerRole: "City captain + county coordinator",
      urgency: "high",
      expectedImpact: "Raises county coverage and lowers turnout gap in the top population center.",
      kpiAffected: "Complete teams · Coverage % · Turnout gap",
      nextStep: "Run two 30-min roster checks this week; pair each incomplete team with a lead who commits to one follow-up pass.",
    },
    {
      id: "a2",
      title: "Recruit town captains in Atkins, Dover, and Pottsville.",
      ownerRole: "Regional field lead",
      urgency: "high",
      expectedImpact: "Prevents all organizing gravity sitting in one city; stabilizes follow-up.",
      kpiAffected: "Leader gaps · City coverage",
      nextStep: "Name one point person per town at the next field sync; send a single template ask + office hours slot.",
    },
    {
      id: "a3",
      title: "Assign organizers to weak precinct placeholders (list mode first).",
      ownerRole: "Data/field ops (staff)",
      urgency: "medium",
      expectedImpact: "Converts empty precinct rows into owned turf without public micro-maps yet.",
      kpiAffected: "Precinct coverage (future) · Organizing readiness",
      nextStep: "Rank the three placeholder groups by turnout gap; assign one organizer per group in the staff stand-up board.",
    },
    {
      id: "a4",
      title: "Identify candidate and surrogate prospects from volunteer pipeline (private vetting).",
      ownerRole: "Political + comms (staff)",
      urgency: "medium",
      expectedImpact: "Fills the candidate pipeline score with real humans—keep names off this public view.",
      kpiAffected: "Candidate pipeline score",
      nextStep: "Export a short code-only list to the private vetting sheet; no names on this public page.",
    },
    {
      id: "a5",
      title: "Schedule neighborhood listening sessions (2 weeks).",
      ownerRole: "Local hosts + organizer",
      urgency: "medium",
      expectedImpact: "Produces relational invitations and stories that feed team completion.",
      kpiAffected: "Conversations logged · People invited",
      nextStep: "Lock two dates with Russellville and one satellite town; publish aggregate RSVP goals only.",
    },
    {
      id: "a6",
      title: "Build precinct data intake (secure tools; aggregates here).",
      ownerRole: "Data steward",
      urgency: "low",
      expectedImpact: "Replaces placeholder precinct group with real rankings when file + ethics review land.",
      kpiAffected: "Data completeness · Map readiness",
      nextStep: "Open a one-page intake spec: required fields, ethics sign-off, and which aggregates may surface in public v2.",
    },
  ];

  const risks: CountyDashboardRiskRow[] = [
    {
      id: "r1",
      category: "Political terrain",
      severity: "medium",
      mitigation: "Keep messaging on competent election admin + verifiable public records; train surrogates on local tone.",
      ownerRole: "Comms + county lead",
    },
    {
      id: "r2",
      category: "Misinformation risk",
      severity: "medium",
      mitigation: "Rapid response doc + single canonical county factsheet; no improvisation on cert numbers in public copy.",
      ownerRole: "Comms",
    },
    {
      id: "r3",
      category: "Local power center / gatekeeping",
      severity: "medium",
      mitigation: "Multiple independent hosts; relational network maps stay private; public shows aggregates only.",
      ownerRole: "Organizer + county chair",
    },
    {
      id: "r4",
      category: "Turnout suppression (logistical)",
      severity: "high",
      mitigation: "Registration center CTAs, deadline pushes, campus table cadence; track follow-ups, not public lists.",
      ownerRole: "Field director",
    },
    {
      id: "r5",
      category: "Ballot access (rules changes)",
      severity: "low",
      mitigation: "Monitor filings; connect voters to official SOS resources—avoid guessing deadlines on public pages.",
      ownerRole: "Compliance + research",
    },
    {
      id: "r6",
      category: "Volunteer burnout",
      severity: "medium",
      mitigation: "Cap simultaneous asks; use leader gap KPI to throttle assignments; celebrate streaks, not overwork.",
      ownerRole: "Field manager",
    },
    {
      id: "r7",
      category: "Data completeness (public vs secure tools)",
      severity: "high",
      mitigation: "Label demos; avoid implying live file metrics; route detailed tables to staff workflows.",
      ownerRole: "Data steward + admin",
    },
  ];

  return {
    countySlug: "pope-county",
    displayName: c?.displayName ?? "Pope County",
    fips: c?.fips ?? "05115",
    regionCode: regionId,
    regionLabel,
    registryCommandRegionLabel: regionPres.registryCommandLabel,
    campaignRegionSlug: regionPres.campaignRegionSlug,
    generatedAt: new Date().toISOString(),
    dataWarnings: [
      ...profile.missingDataWarnings.slice(0, 4),
      POPE_DASHBOARD_V2_DATA_NOTE,
    ],
    executive: {
      population: {
        value: pop,
        source: "db",
        note: pop == null ? "ACS population not loaded in profile import — no fabricated substitute." : undefined,
      },
      registeredVoters: { value: reg, source: regSource, note: regNote },
      turnout2024: {
        value: turnoutForStrip,
        source: turnoutSource,
        note: turnoutNote ?? "Ballots ÷ registered on latest general row when available.",
      },
      activePowerTeams: { value: demoP5.activeTeams, source: "demo" },
      completePowerTeams: { value: demoP5.completeTeams, source: "demo" },
      peopleSignedUp: { value: demoP5.signedUp, source: "demo" },
      coverageRate: { value: coverageDemo, source: "demo", note: `Illustrative vs target ${targetTeams} teams (demo).` },
      organizingReadinessScore: { value: readiness.score, source: readiness.source, note: readiness.note },
      candidatePipelineScore: { value: 47, source: "demo", note: "Illustrative until pipeline tracked in app." },
      priorityLevel: { value: "P1", source: "demo", note: "Prototype label for staff sorting—not a public threat model." },
    },
    powerOfFive: {
      teamsFormed: { value: demoP5.activeTeams, source: "demo" },
      teamsComplete: { value: demoP5.completeTeams, source: "demo" },
      teamsIncomplete: { value: teamsIncomplete, source: "demo" },
      peopleInvited: { value: demoP5.invited, source: "demo" },
      peopleActivated: { value: demoP5.activated, source: "demo" },
      conversationsLogged: { value: demoP5.conversations, source: "demo" },
      followUpsDue: { value: demoP5.followUps, source: "demo" },
      weeklyGrowth: { value: demoP5.weeklyGrowth, source: "demo" },
      leaderGaps: { value: demoP5.leaderGaps, source: "demo" },
      teamCompletionRate: { value: completionRate, source: "demo" },
    },
    strategy,
    cities,
    precinctPlaceholders: [
      { id: "ph-north", label: "North / campus-adjacent (placeholder)", note: "Wire real precinct keys after intake review." },
      { id: "ph-rv-core", label: "River Valley core towns (placeholder cluster)", note: "Use list rankings from engine when import stable." },
      { id: "ph-rural-east", label: "Rural east (placeholder)", note: "Lower density—optimize for one solid team, not many dots." },
    ],
    charts,
    nextActions,
    risks,
    visualLabels: {
      countyMap: "Pope County outline (placeholder)",
      cityMap: "Municipal anchors: Russellville + towns (placeholder)",
      precinctMap: "Precincts — list mode until GeoJSON (placeholder)",
      teamDensity: "Power Team dot-density / heat (placeholder)",
      coverageGaps: "Coverage gap vs model target (placeholder)",
      growth: "Team + volunteer growth (sparkline area)",
    },
    profile,
    priorityVoterOnRoll: pri?.voterOnRollCount ?? null,
    relationalGraphDemo,
  };
}
