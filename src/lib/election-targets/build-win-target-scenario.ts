import type { CountyFactsFileRow } from "@/lib/calendar/load-travel-calendar-data";
import type { CountyPrioritySnapshotRow } from "@/lib/calendar/campaign-calendar-item";

import {
  BASELINE_DEM_WEIGHTS,
  DEFAULT_WIN_TARGET_CONFIG,
  PROJECTED_TURNOUT_WEIGHTS,
  type CountyElectionHistoryRow,
  type CountyWinTargetRow,
  type KellyWinTargetScenarioFile,
  type VoterRegistrationGoalRow,
  type WinTargetModelConfig,
} from "@/lib/election-targets/win-target-types";

export type BuildWinTargetRegistryEntry = { county: string; slug: string; fips: string };

export type BuildWinTargetInput = {
  registry: readonly BuildWinTargetRegistryEntry[];
  electionByCounty: Map<string, CountyElectionHistoryRow>;
  registrationGoalsByCounty: Map<string, VoterRegistrationGoalRow>;
  prioritiesByCounty: Map<string, CountyPrioritySnapshotRow>;
  countyFactsBySlug: Map<string, CountyFactsFileRow>;
  config?: Partial<WinTargetModelConfig>;
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function mergeConfig(partial?: Partial<WinTargetModelConfig>): WinTargetModelConfig {
  const clean = Object.fromEntries(
    Object.entries(partial ?? {}).filter(([, value]) => value !== undefined),
  ) as Partial<WinTargetModelConfig>;
  return {
    ...DEFAULT_WIN_TARGET_CONFIG,
    ...clean,
    capacityWeights: {
      ...DEFAULT_WIN_TARGET_CONFIG.capacityWeights,
      ...partial?.capacityWeights,
    },
  };
}

function factsSlugVariants(slug: string): string[] {
  const base = slug.replace(/-county$/i, "").toLowerCase();
  return [slug.toLowerCase(), base];
}

function rowFacts(slug: string, bySlug: Map<string, CountyFactsFileRow>): CountyFactsFileRow | undefined {
  for (const k of factsSlugVariants(slug)) {
    const hit = bySlug.get(k);
    if (hit) return hit;
  }
  return undefined;
}

function parseNumericCell(s: string | undefined): number | undefined {
  if (!s) return undefined;
  if (/needs\s*data/i.test(s)) return undefined;
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

type TurnoutLeg = {
  key: keyof typeof PROJECTED_TURNOUT_WEIGHTS;
  total?: number;
  dem?: number;
  baseWeight: number;
};

function projectedTotalVotesForRow(
  h: CountyElectionHistoryRow,
  midtermDropoffFactor: number,
): { value: number; missing: string[]; usedWeights: Record<string, number> } {
  const legs: TurnoutLeg[] = [
    { key: "secretaryOfState2022", total: h.sos2022TotalVotes, dem: h.sos2022DemVotes, baseWeight: PROJECTED_TURNOUT_WEIGHTS.secretaryOfState2022 },
    { key: "treasurer2022", total: h.treasurer2022TotalVotes, dem: h.treasurer2022DemVotes, baseWeight: PROJECTED_TURNOUT_WEIGHTS.treasurer2022 },
    { key: "treasurer2024", total: h.treasurer2024TotalVotes, dem: h.treasurer2024DemVotes, baseWeight: PROJECTED_TURNOUT_WEIGHTS.treasurer2024 },
    {
      key: "presidential2024",
      total: h.presidential2024TotalVotes,
      dem: h.presidential2024DemVotes,
      baseWeight: PROJECTED_TURNOUT_WEIGHTS.presidential2024 * midtermDropoffFactor,
    },
  ];
  const active = legs.filter((l) => typeof l.total === "number" && (l.total as number) > 0);
  const missing: string[] = [];
  for (const l of legs) {
    if (!active.find((a) => a.key === l.key)) missing.push(`turnout_total_${l.key}`);
  }
  if (active.length === 0) return { value: 0, missing: ["turnout_all_races"], usedWeights: {} };
  const wSum = active.reduce((s, l) => s + l.baseWeight, 0);
  let acc = 0;
  const usedWeights: Record<string, number> = {};
  for (const l of active) {
    const w = l.baseWeight / wSum;
    usedWeights[l.key] = w;
    acc += (l.total as number) * w;
  }
  return { value: acc, missing, usedWeights };
}

function baselineDemVotesForRow(h: CountyElectionHistoryRow): { value: number; missing: string[] } {
  type BLeg = { key: string; dem?: number; w: number };
  const legs: BLeg[] = [
    { key: "sos2022", dem: h.sos2022DemVotes, w: BASELINE_DEM_WEIGHTS.secretaryOfState2022 },
    { key: "treasurer2022", dem: h.treasurer2022DemVotes, w: BASELINE_DEM_WEIGHTS.treasurer2022 },
    { key: "treasurer2024", dem: h.treasurer2024DemVotes, w: BASELINE_DEM_WEIGHTS.treasurer2024 },
    { key: "presidential2024", dem: h.presidential2024DemVotes, w: BASELINE_DEM_WEIGHTS.presidential2024 },
  ];
  const active = legs.filter((l) => typeof l.dem === "number" && (l.dem as number) >= 0);
  const missing: string[] = [];
  for (const l of legs) {
    if (!active.find((a) => a.key === l.key)) missing.push(`baseline_dem_${l.key}`);
  }
  if (active.length === 0) return { value: 0, missing: ["baseline_dem_all"] };
  const wSum = active.reduce((s, l) => s + l.w, 0);
  let acc = 0;
  for (const l of active) acc += (l.dem as number) * (l.w / wSum);
  return { value: acc, missing };
}

function recentGrowthScoreFn(h: CountyElectionHistoryRow): number {
  const t22 = h.treasurer2022DemVotes;
  const t24 = h.treasurer2024DemVotes;
  if (typeof t22 !== "number" || typeof t24 !== "number" || t22 <= 0) return 0.5;
  const delta = (t24 - t22) / t22;
  return clamp01(0.5 + Math.min(0.25, Math.max(-0.25, delta)));
}

function registrationGoalScoreFn(goalRow: VoterRegistrationGoalRow | undefined, reg: number | undefined, projected: number): { score: number; missing: string[] } {
  const missing: string[] = [];
  if (!goalRow?.goal) {
    missing.push("registration_goal");
    return { score: 0.5, missing };
  }
  if (reg && reg > 0) {
    return { score: clamp01(goalRow.goal / reg), missing };
  }
  if (projected > 0) {
    return { score: clamp01(goalRow.goal / (projected * 1.15)), missing: [...missing, "registered_voters_for_goal_ratio"] };
  }
  return { score: 0.55, missing: [...missing, "registered_voters_for_goal_ratio"] };
}

function turnoutHeadroomScoreFn(reg: number | undefined, projected: number): { score: number; headroom?: number; missing: string[] } {
  const missing: string[] = [];
  if (!reg || reg <= 0) {
    missing.push("registered_voters_turnout_headroom");
    return { score: 0.5, missing };
  }
  const headroom = reg - projected;
  const raw = headroom / Math.max(reg, 1);
  return { score: clamp01(0.5 + raw * 0.9), headroom, missing };
}

function opportunityScoreFn(p: CountyPrioritySnapshotRow | undefined): { score: number; missing: string[] } {
  if (!p) return { score: 0.5, missing: ["county_priority_row"] };
  const ps = p.priorityScore ?? 0;
  return { score: clamp01(ps / 36), missing: [] };
}

function travelEfficiencyFn(p: CountyPrioritySnapshotRow | undefined): number {
  if (!p) return 0.5;
  if (p.fewOpportunities) return 0.42;
  return 0.58;
}

function localInfrastructureFn(facts: CountyFactsFileRow | undefined): { score: number; missing: string[] } {
  if (!facts) return { score: 0.48, missing: ["county_facts"] };
  const st = facts.countyMeetingStatus ?? "";
  if (/needs\s*data/i.test(st)) return { score: 0.46, missing: ["county_meeting_status"] };
  return { score: 0.66, missing: [] };
}

function baselineShareScore(share: number): number {
  return clamp01(share / 0.55);
}

function pickDashboardLabel(r: {
  missingData: string[];
  targetVoteGain: number;
  projectedTotalVotes: number;
  registrationGoal?: number;
  turnoutHeadroom?: number;
  turnoutHeadroomScore: number;
  baselineDemShare: number;
}): CountyWinTargetRow["dashboardLabel"] {
  if (r.missingData.length >= 3 || r.projectedTotalVotes <= 0) return "needs_data";
  const headroomStrong =
    (r.turnoutHeadroom ?? 0) > r.projectedTotalVotes * 0.08 && r.turnoutHeadroomScore > 0.62;
  if (headroomStrong) return "turnout_headroom";
  if (r.registrationGoal && r.registrationGoal > 0) return "registration_opportunity";
  if (r.targetVoteGain >= 250) return "growth_county";
  return "base_hold";
}

export function buildWinTargetScenario(input: BuildWinTargetInput): KellyWinTargetScenarioFile {
  const config = mergeConfig(input.config);
  const modelWarnings: string[] = [];
  const { cushionPct, midtermDropoffFactor, capacityWeights: cw } = config;

  const preRows: Omit<CountyWinTargetRow, "legalTarget50Plus1Statewide" | "workingTargetWithCushionStatewide">[] = [];

  for (const reg of input.registry) {
    const h: CountyElectionHistoryRow = input.electionByCounty.get(reg.county) ?? { county: reg.county };
    const priority = input.prioritiesByCounty.get(reg.county);
    const goalRow = input.registrationGoalsByCounty.get(reg.county);
    const facts = rowFacts(reg.slug, input.countyFactsBySlug);

    const missingData: string[] = [];

    const proj = projectedTotalVotesForRow(h, midtermDropoffFactor);
    missingData.push(...proj.missing);

    const base = baselineDemVotesForRow(h);
    missingData.push(...base.missing);

    const projectedTotalVotes = Math.max(0, Math.round(proj.value));
    const baselineDemVotes = Math.max(0, Math.round(base.value));
    const baselineDemShare = projectedTotalVotes > 0 ? baselineDemVotes / projectedTotalVotes : 0;

    const priorComparableDemVotes = typeof h.sos2022DemVotes === "number" ? Math.round(h.sos2022DemVotes) : baselineDemVotes;

    const regParsed = parseNumericCell(facts?.registeredVoters);
    const { score: regGoalScore, missing: regMiss } = registrationGoalScoreFn(goalRow, regParsed, projectedTotalVotes);
    missingData.push(...regMiss);

    const { score: thScore, headroom: turnoutHeadroomVal, missing: thMiss } = turnoutHeadroomScoreFn(
      regParsed,
      projectedTotalVotes,
    );
    missingData.push(...thMiss);

    const recentGrowthScore = recentGrowthScoreFn(h);
    const { score: countyOpportunityScore, missing: coMiss } = opportunityScoreFn(priority);
    missingData.push(...coMiss);
    const travelEfficiencyScore = travelEfficiencyFn(priority);
    const { score: localInfrastructureScore, missing: liMiss } = localInfrastructureFn(facts);
    missingData.push(...liMiss);

    const baselineDemVoteShareScore = baselineShareScore(baselineDemShare);

    const countyCapacityScore =
      cw.baselineDemVoteShare * baselineDemVoteShareScore +
      cw.registrationGoal * regGoalScore +
      cw.turnoutHeadroom * thScore +
      cw.recentGrowth * recentGrowthScore +
      cw.countyOpportunity * countyOpportunityScore +
      cw.travelEfficiency * travelEfficiencyScore +
      cw.localInfrastructure * localInfrastructureScore;

    preRows.push({
      county: reg.county,
      projectedTotalVotes,
      baselineDemVotes,
      baselineDemShare,
      registrationGoal: goalRow?.goal,
      registrationGoalSource: goalRow?.source,
      turnoutHeadroom: turnoutHeadroomVal,
      turnoutHeadroomScore: thScore,
      recentGrowthScore,
      countyOpportunityScore,
      travelEfficiencyScore,
      localInfrastructureScore,
      countyCapacityScore,
      targetVotes: baselineDemVotes,
      targetShare: 0,
      targetVoteGain: 0,
      confidence:
        missingData.length === 0 ? "high" : missingData.length <= 2 ? "medium" : "low",
      missingData: [...new Set(missingData)],
      dashboardLabel: "base_hold",
      priorComparableDemVotes,
      countyWinContribution: 0,
    });
  }

  const projectedStatewideVotes = preRows.reduce((s, r) => s + r.projectedTotalVotes, 0);
  const legalTarget50Plus1 = Math.floor(projectedStatewideVotes / 2) + 1;
  const workingTargetWithCushion = Math.ceil(legalTarget50Plus1 + projectedStatewideVotes * cushionPct);

  const statewideBaselineVotes = preRows.reduce((s, r) => s + r.baselineDemVotes, 0);
  const statewideVoteGap = workingTargetWithCushion - statewideBaselineVotes;

  const capSum = preRows.reduce((s, r) => s + Math.max(0.0001, r.countyCapacityScore), 0);

  const guardrailCounties = new Set<string>();

  const countiesFull: CountyWinTargetRow[] = preRows.map((r) => {
    const legalTarget50Plus1Statewide = legalTarget50Plus1;
    const workingTargetWithCushionStatewide = workingTargetWithCushion;

    let targetVotes = r.baselineDemVotes;
    let targetVoteGain = 0;

    if (statewideVoteGap > 0) {
      const share = r.countyCapacityScore / capSum;
      targetVoteGain = Math.round(statewideVoteGap * share);
      targetVotes = Math.round(r.baselineDemVotes + targetVoteGain);
    }

    const recentDemShare = r.baselineDemShare;
    const maxPlausibleShare = Math.max(recentDemShare + 0.12, recentDemShare * 1.25);
    const capVotes = Math.floor(r.projectedTotalVotes * maxPlausibleShare);
    if (targetVotes > capVotes) {
      targetVotes = capVotes;
      targetVoteGain = Math.max(0, targetVotes - r.baselineDemVotes);
      guardrailCounties.add(r.county);
    }

    const targetShare = r.projectedTotalVotes > 0 ? targetVotes / r.projectedTotalVotes : 0;
    const countyWinContribution = targetVotes - r.priorComparableDemVotes;

    const dashboardLabel = pickDashboardLabel({
      ...r,
      targetVoteGain,
      missingData: r.missingData,
    });

    return {
      ...r,
      legalTarget50Plus1Statewide,
      workingTargetWithCushionStatewide,
      targetVotes,
      targetShare,
      targetVoteGain,
      countyWinContribution,
      dashboardLabel,
    };
  });

  for (const c of guardrailCounties) {
    modelWarnings.push(`Guardrail applied: ${c} target capped at plausible share.`);
  }

  if (projectedStatewideVotes <= 0) {
    modelWarnings.push("projectedStatewideVotes_zero_check_inputs");
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    modelNote:
      "Scenario model for planning — not a forecast. Replace synthetic or partial inputs with official SOS / county results and registration goals as they are ingested.",
    config,
    statewide: {
      projectedStatewideVotes,
      legalTarget50Plus1,
      workingTargetWithCushion,
      statewideBaselineVotes,
      statewideVoteGap,
    },
    counties: countiesFull,
    modelWarnings: [...new Set(modelWarnings)].slice(0, 80),
  };
}
