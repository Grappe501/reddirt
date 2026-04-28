/**
 * Pulaski County — Dashboard v2 (template parity with Pope shell).
 *
 * Uses `buildCountyPoliticalProfile` aggregates only. Does **not** ship Pope relational seed graphs.
 * City / place drilldown lists are intentionally empty until verified place aggregates exist in-repo.
 */

import { getRegistryCountyBySlug, type ArCommandRegionId } from "@/lib/county/arkansas-county-registry";
import { resolveRegionPresentationForCounty } from "../regions/arkansas-campaign-regions";
import type { CountyPoliticalProfileResult, CountyProfileRow } from "../county-political-profile";
import {
  buildPulaskiCountyPoliticalProfile,
  getPulaskiCountyPriorityPlanMeta,
} from "../county-profiles/pulaski-county";
import type {
  CountyDashboardChartBundle,
  CountyDashboardNextAction,
  CountyDashboardRiskRow,
  CountyDashboardStrategyNarrative,
  CountyDashboardV2,
  CountyDashboardVisualLabels,
} from "./types";

export const PULASKI_DASHBOARD_V2_DATA_NOTE =
  "Pulaski v2 briefing: engine-backed aggregates where present; relational Power Team tiles and pipelines are zeros until Pulaski-specific field telemetry connects—no seeded graph in this repo. City drilldown omitted until place-level ingest is verified." as const;

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

function computeOrganizingReadinessPulaski(p: CountyPoliticalProfileResult): { score: number; source: "derived"; note: string } {
  const warnN = p.missingDataWarnings.length;
  const precinctRows = p.dataStatus.electionPrecinctRowCount;
  const precinctOk = precinctRows > 0 ? 12 : 0;
  const base = 42 + precinctOk - Math.min(28, warnN * 3);
  const score = Math.max(14, Math.min(90, base));
  return {
    score,
    source: "derived",
    note:
      "Composite from ingest completeness signals for Pulaski (not a field-grade performance score). " + PULASKI_DASHBOARD_V2_DATA_NOTE,
  };
}

/** Public-safe Pulaski briefing payload (`CountyDashboardV2` shape — no Pope relational graph attachment). */
export async function buildPulaskiCountyDashboardV2(): Promise<CountyDashboardV2> {
  const [profile, pri] = await Promise.all([buildPulaskiCountyPoliticalProfile(), getPulaskiCountyPriorityPlanMeta()]);

  const regFromFile = pri?.voterOnRollCount ?? profile.registrationProfile.lastKnownRegisteredFromResults ?? null;
  const reg =
    regFromFile != null
      ? regFromFile
      : null;

  const pop = profile.censusAcsBls.censusPopulation;
  const turnout = computeGeneralTurnoutPctFromRow(profile.turnoutProfile.lastGeneral);
  const turnoutForStrip =
    turnout != null ? turnout : null;
  const readiness = computeOrganizingReadinessPulaski(profile);

  const regCounty = getRegistryCountyBySlug("pulaski-county");
  const regionId: ArCommandRegionId = regCounty?.regionId ?? "central";
  const fips = regCounty?.fips ?? "05119";
  const regionPres = resolveRegionPresentationForCounty(fips, regionId);
  const regionLabel = regionPres.campaignRegionDisplayName;
  const displayName = profile.county?.displayName ?? regCounty?.displayName ?? "Pulaski County";

  /** Strategy avoids template lines that mention other counties — uses engine gaps + aggregate posture. */
  const strategy: CountyDashboardStrategyNarrative = {
    strongest:
      "Central Arkansas scale: statewide-capital registration services, media markets, and civil-society anchors can concentrate turnout leverage when relational programs pair with trusted local hosts.",
    weakest:
      profile.precinctMapData.topPrecinctsByBallots.length > 0
        ? profile.missingDataWarnings[0] ??
          profile.precinctMapData.lowTurnoutOpportunities[0]?.note ??
          "Treat turnout and precinct signals as ingestion-dependent—verify certified sources before narratives harden."
        : profile.missingDataWarnings[0] ??
          "Place- and precinct-level aggregates for briefing drilldowns are pending verified ingest—not invented here.",
    nextOrganizingMove:
      "Fill priority gaps from the county profile data warnings first; route neighborhood work through secure relational tools—with public briefings staying aggregate-only.",
    riverValleyRollup:
      "Pulaski sits in central Arkansas coordination with peer counties on the statewide ladder — county KPIs here are modeled to roll upward without bespoke win-number theater on-page.",
    powerOfFiveLift:
      "Power Team completion multiplies follow-ups and relational depth; this Pulaski briefing shows zeroed relational telemetry until telemetry connects—not a Pope County clone graph.",
  };

  const zerosNote = "No Pulaski Power of 5 seed graph in repo — zeros until field tools connect.";

  const charts: CountyDashboardChartBundle = {
    turnoutTrend: turnoutTrendPoints(profile.electionHistory),
    voteShareTrend: [{ label: "Contest party share — pending ingest", value: 0 }],
    powerTeamGrowth: [
      { label: "Field connect", value: 0 },
      { label: "Bench", value: 0 },
      { label: "Active", value: 0 },
    ],
    coverageByCity: [],
    volunteerPipeline: [{ label: "Relational telemetry (Pulaski)", value: 0 }],
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
      id: "pulaski-na1",
      title: "Verify election + ACS ingest for Pulaski before publishing city splits",
      ownerRole: "Data steward",
      urgency: "high",
      expectedImpact: "Unblocks honest city drilldown cards without fabricated place numbers.",
      kpiAffected: "Data completeness",
      nextStep: "Confirm ElectionCountyResult/ElectionPrecinctResult coverage for FIPS 05119 in this environment.",
    },
    {
      id: "pulaski-na2",
      title: "Connect relational / Power Team telemetry when campaign enables Pulaski dashboards",
      ownerRole: "Field ops lead",
      urgency: "medium",
      expectedImpact: "Zeros on this briefing become real KPIs without crossing into public voter rows.",
      kpiAffected: "Power Teams · pipelines",
      nextStep: "Scope staff-only telemetry first — keep aggregates on public briefing routes.",
    },
    {
      id: "pulaski-na3",
      title: "Editorial review: strategy narrative pulls from ingest gaps—not opponent claims",
      ownerRole: "Comms counsel",
      urgency: "medium",
      expectedImpact: "Keeps SOS narrative defensible alongside aggregate tables.",
      kpiAffected: "Public narrative",
      nextStep: "Pair with county profile missing-data banner before external sharing.",
    },
  ];

  const risks: CountyDashboardRiskRow[] = [
    {
      id: "pulaski-r1",
      category: "Data completeness vs narrative",
      severity: "high",
      mitigation: "Label scaffold metrics; cite certified sources—never improvised turnout or precinct claims.",
      ownerRole: "Data steward + counsel",
    },
    {
      id: "pulaski-r2",
      category: "High-population optics",
      severity: "medium",
      mitigation: "Keep maps and KPIs aggregate; route detailed voter geography to gated tools.",
      ownerRole: "Campaign manager",
    },
    {
      id: "pulaski-r3",
      category: "Multi-municipality coverage",
      severity: "medium",
      mitigation: "Wait for place-level ingest before asserting Little Rock vs North Little Rock performance splits.",
      ownerRole: "Regional field lead",
    },
  ];

  const visualLabels: CountyDashboardVisualLabels = {
    countyMap: `${displayName} outline — map asset pending parity pass`,
    cityMap: "Municipal anchors — city drilldown deferred until ingest (see banner)",
    precinctMap: "Precinct aggregates — awaiting verified tabulation ingest for public drilldown",
    teamDensity: "Power Team telemetry —Zeros until field connection (no Pope seed reused)",
    coverageGaps: "Coverage storyline follows engine warnings — not precinct targets here",
    growth: "Historical turnout where rows exist — relational growth pending",
  };

  const precinctPlaceholders = [
    {
      id: "pulaski-city-precinct-gap",
      label: "Precinct and city drilldown data needed",
      note:
        "Places such as Little Rock, North Little Rock, Jacksonville, Sherwood, and Maumelle require verified ACS place aggregates and precinct tabulation ingest before briefing cards mirror the Pope city grid. Aggregate-only policy applies—no invented ward or precinct turnout here.",
    },
  ];

  return {
    countySlug: "pulaski-county",
    displayName,
    fips,
    regionCode: regionId,
    regionLabel,
    registryCommandRegionLabel: regionPres.registryCommandLabel,
    campaignRegionSlug: regionPres.campaignRegionSlug,
    generatedAt: new Date().toISOString(),
    dataWarnings: [
      ...profile.missingDataWarnings.slice(0, 5),
      PULASKI_DASHBOARD_V2_DATA_NOTE,
    ],
    executive: {
      population: {
        value: pop,
        source: "db",
        note:
          pop == null
            ? "ACS population optional—no substitute invented for Pulaski in this briefing."
            : undefined,
      },
      registeredVoters: {
        value: reg,
        source: reg != null ? "db" : "demo",
        note:
          reg == null ? "County roll snapshot not wired in this ingest path — verify SOS export linkage before publishing a number." : undefined,
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
      coverageRate: { value: 0, source: "demo", note: "Coverage model pending Pulaski relational scale — placeholder zero." },
      organizingReadinessScore: {
        value: readiness.score,
        source: readiness.source,
        note: readiness.note,
      },
      candidatePipelineScore: {
        value: 0,
        source: "demo",
        note: "No public pipeline score asserted—placeholder until staffing analytics connect.",
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
