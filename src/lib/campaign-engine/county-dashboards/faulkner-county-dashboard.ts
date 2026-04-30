/**
 * Faulkner County — Dashboard v2 (template parity with Pulaski/Pope shells).
 *
 * Aggregates via `buildCountyPoliticalProfile` only. No Pope relational seed; city list empty until place ingest verifies.
 */

import { getRegistryCountyBySlug, type ArCommandRegionId } from "@/lib/county/arkansas-county-registry";
import { resolveRegionPresentationForCounty } from "../regions/arkansas-campaign-regions";
import type { CountyPoliticalProfileResult, CountyProfileRow } from "../county-political-profile";
import {
  buildFaulknerCountyPoliticalProfile,
  getFaulknerCountyPriorityPlanMeta,
} from "../county-profiles/faulkner-county";
import type {
  CountyDashboardChartBundle,
  CountyDashboardNextAction,
  CountyDashboardRiskRow,
  CountyDashboardStrategyNarrative,
  CountyDashboardV2,
  CountyDashboardVisualLabels,
} from "./types";

export const FAULKNER_DASHBOARD_V2_DATA_NOTE =
  "Faulkner v2 briefing: engine-backed aggregates where present; relational Power Team tiles stay at zero until Faulkner-specific field telemetry exists—no seeded graph in this repo. City drilldown omitted until verified place-level ingest." as const;

function computeGeneralTurnoutPctFromRow(g: CountyProfileRow | null | undefined): number | null {
  if (!g) return null;
  if (g.ballotsCast != null && g.registeredVoters != null && g.registeredVoters > 0) {
    return Math.round((g.ballotsCast / g.registeredVoters) * 1000) / 10;
  }
  if (g.votePercent != null) return Math.round(Number(g.votePercent) * 10) / 10;
  return null;
}

function turnoutTrendPoints(generals: CountyProfileRow[]): { label: string; value: number }[] {
  const rows = [...generals]
    .filter((r) => r.contestName == null)
    .sort((a, b) => a.electionDate.localeCompare(b.electionDate));
  const pts: { label: string; value: number }[] = [];
  for (const row of rows) {
    const y = row.electionDate.slice(0, 4);
    const pct = computeGeneralTurnoutPctFromRow(row);
    if (pct != null) pts.push({ label: y, value: pct });
  }
  const tail = pts.slice(-6);
  if (tail.length > 0) return tail;
  return [{ label: "No turnout rows ingested yet", value: 0 }];
}

function computeOrganizingReadinessFaulkner(p: CountyPoliticalProfileResult): { score: number; source: "derived"; note: string } {
  const warnN = p.missingDataWarnings.length;
  const precinctRows = p.dataStatus.electionPrecinctRowCount;
  const precinctOk = precinctRows > 0 ? 12 : 0;
  const base = 42 + precinctOk - Math.min(28, warnN * 3);
  const score = Math.max(14, Math.min(90, base));
  return {
    score,
    source: "derived",
    note:
      "Composite from ingest completeness signals for Faulkner (not a field-grade performance score). " + FAULKNER_DASHBOARD_V2_DATA_NOTE,
  };
}

export async function buildFaulknerCountyDashboardV2(): Promise<CountyDashboardV2> {
  const [profile, pri] = await Promise.all([buildFaulknerCountyPoliticalProfile(), getFaulknerCountyPriorityPlanMeta()]);

  const regFromFile = pri?.voterOnRollCount ?? profile.registrationProfile.lastKnownRegisteredFromResults ?? null;
  const reg = regFromFile != null ? regFromFile : null;

  const pop = profile.censusAcsBls.censusPopulation;
  const turnout = computeGeneralTurnoutPctFromRow(profile.turnoutProfile.lastGeneral);
  const turnoutForStrip = turnout != null ? turnout : null;
  const readiness = computeOrganizingReadinessFaulkner(profile);

  const regCounty = getRegistryCountyBySlug("faulkner-county");
  const regionId: ArCommandRegionId = regCounty?.regionId ?? "central";
  const fips = regCounty?.fips ?? "05045";
  const regionPres = resolveRegionPresentationForCounty(fips, regionId);
  const regionLabel = regionPres.campaignRegionDisplayName;
  const displayName = profile.county?.displayName ?? regCounty?.displayName ?? "Faulkner County";

  const strategy: CountyDashboardStrategyNarrative = {
    strongest:
      "Central Arkansas growth corridor: county-seat and municipal anchors—school systems, employers, and civic groups—signal how statewide election services intersect daily life before block-level ingest finishes.",
    weakest:
      profile.precinctMapData.topPrecinctsByBallots.length > 0
        ? profile.missingDataWarnings[0] ??
          profile.precinctMapData.lowTurnoutOpportunities[0]?.note ??
          "Treat turnout and precinct signals as ingestion-dependent—verify certified sources before narratives harden."
        : profile.missingDataWarnings[0] ??
          "Place- and precinct-level aggregates for municipal drilldowns are pending verified ingest—not invented here.",
    nextOrganizingMove:
      "Publish the county profile’s ingestion warnings alongside any precinct story—certified aggregates first, illustrative layers second.",
    riverValleyRollup:
      "Faulkner aligns with central Arkansas coordination on the statewide ladder—county tiles here lift into region views without bespoke win-number theater on-page.",
    powerOfFiveLift:
      "Power Team math applies when telemetry exists; this Faulkner briefing keeps relational counts at zero until connected—not a Pope County seed clone.",
  };

  const zerosNote = "No multi-county seed graph in this repo — illustrative zeros only until sourced engagement rollups qualify.";

  const charts: CountyDashboardChartBundle = {
    turnoutTrend: turnoutTrendPoints(profile.electionHistory),
    voteShareTrend: [{ label: "Contest party share — pending ingest", value: 0 }],
    powerTeamGrowth: [
      { label: "Field connect", value: 0 },
      { label: "Bench", value: 0 },
      { label: "Active", value: 0 },
    ],
    coverageByCity: [],
    volunteerPipeline: [{ label: "Relational telemetry (Faulkner)", value: 0 }],
    candidatePipeline: [{ label: "Pipeline scaffold", value: 0 }],
    issueIntensity: [
      {
        issue: "Import verified issue snapshots before scoring — not asserted on this briefing",
        score: 0,
      },
    ],
  };

  const nextActions: CountyDashboardNextAction[] = [
    {
      id: "faulkner-na1",
      title: "Verify election + ACS ingest for Faulkner before publishing city splits",
      ownerRole: "Data steward",
      urgency: "high",
      expectedImpact: "Unblocks honest city drilldown cards without fabricated place numbers.",
      kpiAffected: "Data completeness",
      nextStep: "Confirm ElectionCountyResult/ElectionPrecinctResult coverage for FIPS 05045 in this environment.",
    },
    {
      id: "faulkner-na2",
      title: "Layer engagement telemetry only when licensing allows public-safe rollups",
      ownerRole: "Data + compliance",
      urgency: "medium",
      expectedImpact: "Illustrative slots can evolve into sourced KPIs without person-level disclosure on marketing routes.",
      kpiAffected: "Engagement depth (private tooling first)",
      nextStep: "Authenticated workspaces carry detail; county briefings stay aggregate.",
    },
    {
      id: "faulkner-na3",
      title: "Editorial review: Conway (city) vs Conway County routing in copy",
      ownerRole: "Comms counsel",
      urgency: "low",
      expectedImpact: "Avoids accidental cross-county confusion when municipal cards ship.",
      kpiAffected: "Public narrative",
      nextStep: "Use Arkansas registry slugs; city of Conway in Faulkner is not Conway County.",
    },
  ];

  const risks: CountyDashboardRiskRow[] = [
    {
      id: "faulkner-r1",
      category: "Data completeness vs narrative",
      severity: "high",
      mitigation: "Label scaffold metrics; cite certified turnout—never improvised precinct claims.",
      ownerRole: "Data steward + counsel",
    },
    {
      id: "faulkner-r2",
      category: "Suburban / small-town coverage balance",
      severity: "medium",
      mitigation: "When place data arrives, give each municipal anchor equitable explanation—not only the county seat storyline.",
      ownerRole: "Regional planning",
    },
    {
      id: "faulkner-r3",
      category: "Municipality name collisions (Conway city vs Conway County elsewhere)",
      severity: "low",
      mitigation: "Slug and map labels from registry; verify before paid media cites a place split.",
      ownerRole: "Research + data",
    },
  ];

  const visualLabels: CountyDashboardVisualLabels = {
    countyMap: `${displayName} outline — map asset pending parity pass`,
    cityMap: "Municipal anchors — city drilldown deferred until ingest (see banner)",
    precinctMap: "Precinct aggregates — awaiting verified tabulation ingest for public drilldown",
    teamDensity: "Engagement telemetry — illustrative zeros until sourced rollups exist",
    coverageGaps: "Coverage storyline follows engine warnings —not invented precinct targets",
    growth: "Historical turnout where county rows exist — future trend layers labeled when integrated",
  };

  const precinctPlaceholders = [
    {
      id: "faulkner-city-precinct-gap",
      label: "Precinct and city drilldown data needed",
      note:
        "Places such as Conway (city—in Faulkner County), Greenbrier, Vilonia, Mayflower, and peers need verified ACS place aggregates and precinct tabulation before briefing city cards mirror the Pope grid—not fabricated ward turnout here.",
    },
  ];

  return {
    countySlug: "faulkner-county",
    displayName,
    fips,
    regionCode: regionId,
    regionLabel,
    registryCommandRegionLabel: regionPres.registryCommandLabel,
    campaignRegionSlug: regionPres.campaignRegionSlug,
    generatedAt: new Date().toISOString(),
    dataWarnings: [...profile.missingDataWarnings.slice(0, 5), FAULKNER_DASHBOARD_V2_DATA_NOTE],
    executive: {
      population: {
        value: pop,
        source: "db",
        note: pop == null ? "ACS population optional—no substitute invented for Faulkner in this briefing." : undefined,
      },
      registeredVoters: {
        value: reg,
        source: reg != null ? "db" : "demo",
        note:
          reg == null
            ? "County roll snapshot not wired in this ingest path — verify SOS export linkage before publishing a number."
            : undefined,
      },
      turnout2024: {
        value: turnoutForStrip,
        source: turnoutForStrip != null ? "derived" : "demo",
        note:
          turnoutForStrip == null ? "Incomplete general turnout row — no fabricated percentage substituted." : undefined,
      },
      activePowerTeams: { value: 0, source: "demo", note: zerosNote },
      completePowerTeams: { value: 0, source: "demo", note: zerosNote },
      peopleSignedUp: { value: 0, source: "demo", note: zerosNote },
      coverageRate: { value: 0, source: "demo", note: "Coverage model pending Faulkner relational scale — placeholder zero." },
      organizingReadinessScore: {
        value: readiness.score,
        source: readiness.source,
        note: readiness.note,
      },
      candidatePipelineScore: {
        value: 0,
        source: "demo",
        note: "No public pipeline score asserted until staffing analytics connect.",
      },
      priorityLevel: {
        value: "P2",
        source: "demo",
        note: "Prototype staffing sort key — verify with ops before external use.",
      },
    },
    powerOfFive: {
      teamsFormed: { value: 0, source: "demo", note: zerosNote },
      teamsComplete: { value: 0, source: "demo", note: zerosNote },
      teamsIncomplete: { value: 0, source: "demo", note: zerosNote },
      peopleInvited: { value: 0, source: "demo", note: zerosNote },
      peopleActivated: { value: 0, source: "demo", note: zerosNote },
      conversationsLogged: { value: 0, source: "demo", note: zerosNote },
      followUpsDue: { value: 0, source: "demo", note: zerosNote },
      weeklyGrowth: { value: 0, source: "demo", note: zerosNote },
      leaderGaps: { value: 0, source: "demo", note: zerosNote },
      teamCompletionRate: { value: 0, source: "demo", note: zerosNote },
    },
    strategy,
    cities: [],
    precinctPlaceholders,
    charts,
    nextActions,
    risks,
    visualLabels,
    priorityVoterOnRoll: pri?.voterOnRollCount ?? null,
  };
}
