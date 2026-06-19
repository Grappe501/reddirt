import { buildAggregateCampaignIntelligenceIndex } from "@/lib/intelligence/aggregateCampaignIntelligence";
import { summarizeStrategicAlignmentRisk } from "@/lib/intelligence/campaignStrategicAlignment";
import { loadCountyBriefingIntelligenceIndex } from "@/lib/intelligence/countyBriefingIntelligence";
import { summarizeLongitudinalIntelligence } from "@/lib/intelligence/intelligenceMemoryEngine";
import { summarizeBorderMediaIntelligence } from "@/lib/intelligence/mediaMarketIntelligence";
import { loadStrategicScenarioRegistry } from "@/lib/intelligence/strategicScenarioRegistry";
import {
  computeStatewideRegistrationRollup,
  loadVoterRegistrationAssumptions,
} from "@/lib/intelligence/voterRegistrationTargetModel";
import type {
  CountyScenarioWatchSummary,
  DebateScenarioPrepSummary,
  ScenarioHumanActionHints,
  StrategicScenarioConfidenceBand,
  StrategicScenarioRegistryEntry,
  StrategicScenarioSignal,
  StrategicScenarioSimulationResult,
  StrategicScenarioSimulationSummary,
  StrategicScenarioType,
} from "@/lib/intelligence/types/strategicScenarioSimulation";
import { SCENARIO_GOVERNANCE_LABEL as GOVERNANCE_LABEL } from "@/lib/intelligence/types/strategicScenarioSimulation";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";
import { generateKimHammerLiveSuggestionCandidates } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { summarizeNarrativeUsageRisk } from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";
import { shouldSkipHumanActionQueueSyncOnRequest } from "@/lib/intelligence/intelligenceLaunchMode";

export { loadStrategicScenarioRegistry, STRATEGIC_SCENARIO_REGISTRY_REL } from "@/lib/intelligence/strategicScenarioRegistry";
export type {
  StrategicScenarioRegistry,
  StrategicScenarioRegistryEntry,
} from "@/lib/intelligence/types/strategicScenarioSimulation";

let cachedSimulation: {
  repoRoot: string;
  results: StrategicScenarioSimulationResult[];
  summary: StrategicScenarioSimulationSummary;
} | null = null;

const EMPTY_DEBATE_SCENARIO_PREP: DebateScenarioPrepSummary = {
  likelyOpponentAttacks: [],
  doctrineSafeResponseNotes: [],
  debateTrapWarnings: [],
  evidenceDependencies: [],
  weakCitationWarnings: [],
  countySensitiveNotes: [],
  bridgeLineGuidance: [],
  whatNotToSay: [],
};

function resolveRepoRoot(repoRoot?: string): string {
  return repoRoot ?? process.cwd();
}

function getCachedSimulation(repoRoot?: string): {
  results: StrategicScenarioSimulationResult[];
  summary: StrategicScenarioSimulationSummary;
} {
  const root = resolveRepoRoot(repoRoot);
  if (cachedSimulation?.repoRoot === root) {
    return { results: cachedSimulation.results, summary: cachedSimulation.summary };
  }
  const results = simulateAllStrategicScenariosUncached(root);
  const summary = buildStrategicScenarioSummary(root, results);
  cachedSimulation = { repoRoot: root, results, summary };
  return { results, summary };
}

type SimulationContext = {
  memory: ReturnType<typeof summarizeLongitudinalIntelligence>;
  narratives: ReturnType<typeof loadKimHammerNarrativeStateIndex>;
  evidence: ReturnType<typeof loadKimHammerEvidenceIndex>;
  alignment: ReturnType<typeof summarizeStrategicAlignmentRisk>;
  registration: ReturnType<typeof computeStatewideRegistrationRollup>;
  registrationAssumptions: ReturnType<typeof loadVoterRegistrationAssumptions>;
  aggregate: ReturnType<typeof buildAggregateCampaignIntelligenceIndex>;
  borderMedia: ReturnType<typeof summarizeBorderMediaIntelligence>;
  pendingSuggestions: number;
  usage: ReturnType<typeof summarizeNarrativeUsageRisk>;
};

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function buildContext(repoRoot?: string): SimulationContext {
  const countyIndex = loadCountyBriefingIntelligenceIndex(repoRoot);
  return {
    memory: summarizeLongitudinalIntelligence(repoRoot),
    narratives: loadKimHammerNarrativeStateIndex(repoRoot),
    registrationAssumptions: loadVoterRegistrationAssumptions(repoRoot),
    registration: computeStatewideRegistrationRollup(repoRoot),
    evidence: loadKimHammerEvidenceIndex(repoRoot),
    alignment: summarizeStrategicAlignmentRisk(repoRoot),
    aggregate: buildAggregateCampaignIntelligenceIndex(countyIndex.counties, repoRoot),
    borderMedia: summarizeBorderMediaIntelligence(repoRoot),
    pendingSuggestions: generateKimHammerLiveSuggestionCandidates(repoRoot).length,
    usage: summarizeNarrativeUsageRisk(repoRoot),
  };
}

function narrativeBand(scenario: StrategicScenarioRegistryEntry, ctx: SimulationContext, narrativeId: string) {
  return ctx.narratives.narratives.find((row) => row.narrativeId === narrativeId);
}

function memoryHitsScenario(scenario: StrategicScenarioRegistryEntry, ctx: SimulationContext): string[] {
  const hits: string[] = [];
  for (const narrativeId of scenario.linkedNarratives) {
    const weakening = ctx.memory.weakeningNarratives.find((row) => row.entityId === narrativeId);
    if (weakening) hits.push(`Memory: weakening — ${weakening.reason.slice(0, 100)}`);
    const overused = ctx.memory.overusedArguments.find((row) => row.entityId === narrativeId);
    if (overused) hits.push(`Memory: overused — ${overused.reason.slice(0, 100)}`);
    const traps = ctx.memory.recurringDebateTraps.filter((row) => row.reason.toLowerCase().includes(narrativeId.slice(0, 8)));
    if (traps.length > 0) hits.push(`Memory: debate trap pattern — ${traps[0]!.reason.slice(0, 100)}`);
  }
  for (const countyId of scenario.linkedCounties) {
    const drift = ctx.memory.countyDriftWarnings.find((row) => row.entityId === countyId || row.reason.toLowerCase().includes(countyId));
    if (drift) hits.push(`Memory: county drift — ${drift.reason.slice(0, 100)}`);
  }
  if (scenario.scenarioType === "MEDIA_ESCALATION" || scenario.linkedMediaMarkets.length > 0) {
    hits.push(...ctx.memory.mediaCycleChanges.slice(0, 2).map((row) => `Media cycle: ${row.reason.slice(0, 90)}`));
    hits.push(...ctx.memory.opponentMessageEscalation.slice(0, 1).map((row) => `Opponent escalation: ${row.reason.slice(0, 90)}`));
  }
  return hits;
}

function computeEvidenceBlockers(scenario: StrategicScenarioRegistryEntry, ctx: SimulationContext): string[] {
  const blockers: string[] = [];
  if (ctx.evidence.metrics.exportReadyClaims === 0 && scenario.linkedExports.length > 0) {
    blockers.push("No export-ready claims — scenario depends on governed export lineage.");
  }
  const partialClaimCount = ctx.evidence.claims.filter((claim) => claim.citationStatus === "PARTIAL").length;
  if (partialClaimCount > 0 && scenario.linkedBills.length > 0) {
    blockers.push(`${partialClaimCount} partial claim(s) may weaken bill-linked scenario responses.`);
  }
  blockers.push(
    ...ctx.memory.staleCitations.slice(0, 2).map((row) => `Stale citation risk: ${row.entityLabel} — ${row.reason.slice(0, 80)}`),
  );
  blockers.push(...scenario.evidenceDependencies.filter((dep) => dep.length > 0).slice(0, 2).map((dep) => `Required: ${dep}`));
  return [...new Set(blockers)].slice(0, 5);
}

function computeDoctrineWarnings(scenario: StrategicScenarioRegistryEntry, ctx: SimulationContext): string[] {
  const warnings: string[] = [];
  for (const narrativeId of scenario.linkedNarratives) {
    const tension = ctx.alignment.topStrategicTensions?.find((row) => row.narrativeId === narrativeId);
    if (tension) warnings.push(`Doctrine tension: ${tension.signal.slice(0, 120)}`);
  }
  warnings.push(...ctx.memory.doctrineDriftWarnings.slice(0, 2).map((row) => row.reason.slice(0, 120)));
  if (scenario.scenarioType === "NARRATIVE_COLLISION") {
    warnings.push("Narrative collision scenario — verify doctrine-safe sequencing before deployment.");
  }
  return [...new Set(warnings)].slice(0, 4);
}

function scoreScenario(
  scenario: StrategicScenarioRegistryEntry,
  ctx: SimulationContext,
): StrategicScenarioSimulationResult {
  const reasons: string[] = [];
  const signals: StrategicScenarioSignal[] = [];
  let riskScore = 35;
  let opportunityScore = 35;

  for (const narrativeId of scenario.linkedNarratives) {
    const row = narrativeBand(scenario, ctx, narrativeId);
    if (!row) {
      signals.push("SCENARIO_UNDERDEVELOPED");
      reasons.push(`Narrative ${narrativeId} not found in live state index — scenario evidence thin.`);
      riskScore += 12;
      continue;
    }
    if (row.readinessBand === "BLOCKED") {
      signals.push("SCENARIO_FRAGILE", "SCENARIO_DEBATE_TRAP");
      reasons.push(`${row.title} is BLOCKED — scenario response cannot rely on this frame without new evidence.`);
      riskScore += 22;
    } else if (row.readinessBand === "WEAK") {
      signals.push("SCENARIO_FRAGILE");
      reasons.push(`${row.title} readiness WEAK — deployment risk if opponent presses this lane.`);
      riskScore += 14;
    } else if (row.readinessBand === "STRONG") {
      signals.push("SCENARIO_OPPORTUNITY");
      reasons.push(`${row.title} readiness STRONG — doctrine-safe response capacity exists.`);
      opportunityScore += 18;
    }
    if (row.claimReviewSummary.exportReady === 0 && scenario.linkedExports.length > 0) {
      signals.push("SCENARIO_FRAGILE");
      reasons.push(`${row.title} has zero export-ready claims — citation chain fragile for external use.`);
      riskScore += 10;
    }
  }

  reasons.push(...memoryHitsScenario(scenario, ctx));
  for (const narrativeId of scenario.linkedNarratives) {
    if (ctx.memory.overusedArguments.some((row) => row.entityId === narrativeId)) {
      signals.push("SCENARIO_OVEREXPOSED");
      const label = ctx.memory.overusedArguments.find((row) => row.entityId === narrativeId)?.reason.slice(0, 100);
      reasons.push(`Overexposed narrative: ${narrativeId}${label ? ` — ${label}` : ""}`);
    }
    if (ctx.memory.weakeningNarratives.some((row) => row.entityId === narrativeId)) {
      reasons.push(`Weakening narrative memory: ${narrativeId}`);
    }
  }
  if (reasons.some((r) => r.includes("overused") || r.includes("Overexposed") || r.includes("fatigue"))) {
    signals.push("SCENARIO_OVEREXPOSED");
    riskScore += 15;
    opportunityScore -= 8;
  }
  if (reasons.some((r) => r.includes("debate trap"))) {
    signals.push("SCENARIO_DEBATE_TRAP");
    riskScore += 12;
  }

  if (scenario.scenarioType === "NARRATIVE_COLLISION") {
    signals.push("SCENARIO_COLLISION");
    riskScore += 16;
    reasons.push("Collision scenario — two or more frames may contradict if deployed without county sequencing.");
  }

  if (scenario.scenarioType === "MEDIA_ESCALATION") {
    signals.push("SCENARIO_MEDIA_AMPLIFICATION");
    riskScore += 10;
    if (scenario.linkedMediaMarkets.some((m) => m.includes("border") || m.includes("memphis") || m.includes("texarkana"))) {
      reasons.push(`Border/spillover market risk — ${ctx.borderMedia.coverage.edgeCountyCount} edge counties monitored (NSI-9B).`);
      if (ctx.borderMedia.gaps.length > 0) {
        riskScore += 8;
        reasons.push(`Coverage gaps may miss amplification: ${ctx.borderMedia.gaps.slice(0, 2).map((g) => g.text).join("; ")}`);
      }
    }
  }

  if (scenario.scenarioType === "TURNOUT_REGISTRATION") {
    if (ctx.registration.missingCountyGoalCount > 0) {
      signals.push("SCENARIO_FIELD_CAPACITY_RISK", "SCENARIO_FRAGILE");
      riskScore += 14;
      reasons.push(
        `${ctx.registration.missingCountyGoalCount} counties lack registration goals — pathway math unreliable.`,
      );
    }
    reasons.push(
      `Assumptions: ${Math.round(ctx.registrationAssumptions.registrationTurnoutAssumption * 100)}% turnout · ${Math.round(ctx.registrationAssumptions.supportCaptureAssumption * 100)}% support capture (aggregate only).`,
    );
    if (scenario.scenarioId.includes("underperform") || scenario.scenarioId.includes("capacity")) {
      riskScore += 12;
    }
    if (scenario.scenarioId.includes("meets")) {
      opportunityScore += 10;
    }
  }

  if (scenario.scenarioType === "DEBATE") {
    signals.push("SCENARIO_DEBATE_TRAP");
    riskScore += 8;
    reasons.push(...ctx.memory.recurringDebateTraps.slice(0, 2).map((row) => `Debate memory: ${row.reason.slice(0, 100)}`));
  }

  if (scenario.scenarioType === "OPPONENT_RESPONSE") {
    reasons.push(...ctx.memory.opponentMessageEscalation.slice(0, 2).map((row) => `Messaging drift: ${row.reason.slice(0, 100)}`));
    if (ctx.pendingSuggestions > 5) {
      riskScore += 5;
      reasons.push(`${ctx.pendingSuggestions} pending AI suggestions — human review backlog may slow response prep.`);
    }
  }

  if (scenario.scenarioType === "COUNTY_REACTION") {
    for (const countyId of scenario.linkedCounties) {
      const env = ctx.aggregate.countyEnvironments.find((row) => row.countyId === countyId);
      if (env?.operationalSignals.some((s) => s.signal === "COUNTY_OPERATIONALLY_STRAINED")) {
        signals.push("SCENARIO_FIELD_CAPACITY_RISK");
        riskScore += 10;
        reasons.push(`${env.countyName}: operational strain may limit field execution.`);
      }
      if (env?.operationalSignals.some((s) => s.signal === "COUNTY_HIGH_OPPORTUNITY")) {
        signals.push("SCENARIO_OPPORTUNITY");
        opportunityScore += 12;
        reasons.push(`${env.countyName}: high-opportunity county environment detected.`);
      }
    }
  }

  for (const narrativeId of scenario.linkedNarratives) {
    const fatigue = ctx.usage.topFatigueWarnings.find((row) => row.narrativeId === narrativeId);
    if (fatigue) {
      signals.push("SCENARIO_OVEREXPOSED");
      reasons.push(`Usage fatigue: ${fatigue.narrativeTitle} — ${fatigue.signal}`);
    }
  }

  const missingCounties = scenario.linkedCounties.filter(
    (countyId) => countyId !== "statewide" && !ctx.aggregate.countyEnvironments.some((row) => row.countyId === countyId),
  );
  if (missingCounties.length > 0) {
    signals.push("SCENARIO_UNDERDEVELOPED");
    reasons.push(`County intelligence gap for: ${missingCounties.join(", ")}`);
  } else if (scenario.confidenceBand === "LOW" && scenario.linkedCitations.length === 0) {
    signals.push("SCENARIO_UNDERDEVELOPED");
    reasons.push("Low confidence band with thin citation linkage — evidence/county data underdeveloped.");
  }

  riskScore += scenario.riskFactors.length * 3;
  opportunityScore += scenario.opportunityFactors.length * 4;
  if (scenario.opportunityFactors.length >= 2) {
    signals.push("SCENARIO_OPPORTUNITY");
    reasons.push(`Opportunity factors: ${scenario.opportunityFactors[0]}`);
  }
  riskScore = clamp(riskScore);
  opportunityScore = clamp(opportunityScore);

  if (riskScore >= 65) signals.push("SCENARIO_HIGH_RISK");
  else if (riskScore >= 45) signals.push("SCENARIO_MODERATE_RISK");
  else signals.push("SCENARIO_LOW_RISK");

  if (opportunityScore >= 55 && !signals.includes("SCENARIO_OPPORTUNITY")) {
    signals.push("SCENARIO_OPPORTUNITY");
  }

  const evidenceBlockers = computeEvidenceBlockers(scenario, ctx);
  if (evidenceBlockers.length >= 3) {
    signals.push("SCENARIO_FRAGILE");
    riskScore = clamp(riskScore + 8);
  }

  const doctrineWarnings = computeDoctrineWarnings(scenario, ctx);
  if (doctrineWarnings.length >= 2) {
    signals.push("SCENARIO_COLLISION");
  }

  const primarySignal =
    signals.find((s) => s !== "SCENARIO_LOW_RISK" && s !== "SCENARIO_MODERATE_RISK") ??
    (riskScore >= 55 ? "SCENARIO_MODERATE_RISK" : "SCENARIO_LOW_RISK");

  const whatToWatchNext = [
    ...scenario.assumptions.slice(0, 2).map((a) => `Watch assumption: ${a}`),
    ...scenario.riskFactors.slice(0, 2).map((r) => `Risk factor: ${r}`),
    "Human review required before treating as operational guidance.",
  ];

  const whatNotToDo = [
    "Do not treat scenario output as prediction certainty.",
    "Do not deploy blocked or partial claims as export-ready.",
    ...(signals.includes("SCENARIO_OVEREXPOSED") ? ["Avoid repeating fatigued frames without fresh county examples."] : []),
    ...(signals.includes("SCENARIO_DEBATE_TRAP") ? ["Avoid stale rebuttals flagged in debate memory."] : []),
    ...(signals.includes("SCENARIO_COLLISION") ? ["Do not deploy colliding narratives in same county event without sequencing."] : []),
  ];

  const baseResult: Omit<
    StrategicScenarioSimulationResult,
    | "recommendedHumanAction"
    | "escalationPath"
    | "evidenceBlockerAction"
    | "debatePrepAction"
    | "mediaMonitoringAction"
    | "countyBriefingAction"
  > = {
    scenarioId: scenario.scenarioId,
    scenarioType: scenario.scenarioType,
    title: scenario.title,
    primarySignal,
    signals: [...new Set(signals)],
    reasons: [...new Set(reasons)].slice(0, 8),
    riskScore,
    opportunityScore,
    confidenceBand: scenario.confidenceBand,
    evidenceBlockers,
    doctrineWarnings,
    whatToWatchNext: whatToWatchNext.slice(0, 4),
    whatNotToDo: whatNotToDo.slice(0, 4),
    linkedNarratives: scenario.linkedNarratives,
    linkedCounties: scenario.linkedCounties,
    linkedBills: scenario.linkedBills,
    linkedCitations: scenario.linkedCitations,
    linkedMediaMarkets: scenario.linkedMediaMarkets,
    linkedDoctrines: scenario.linkedDoctrines,
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    scenarioModelLabel: GOVERNANCE_LABEL,
  };

  const hints = buildScenarioHumanActionHints({
    ...baseResult,
    recommendedHumanAction: "",
    escalationPath: "",
    evidenceBlockerAction: "",
    debatePrepAction: "",
    mediaMonitoringAction: "",
    countyBriefingAction: "",
  });

  return { ...baseResult, ...hints };
}

export function buildScenarioHumanActionHints(
  result: StrategicScenarioSimulationResult,
): ScenarioHumanActionHints {
  const highRisk = result.signals.includes("SCENARIO_HIGH_RISK") || result.riskScore >= 65;
  const debateTrap = result.signals.includes("SCENARIO_DEBATE_TRAP");
  const media = result.scenarioType === "MEDIA_ESCALATION" || result.signals.includes("SCENARIO_MEDIA_AMPLIFICATION");
  const county = result.scenarioType === "COUNTY_REACTION" || result.linkedCounties.length > 0;

  return {
    recommendedHumanAction: highRisk
      ? `Review scenario ${result.scenarioId} before operational use — ${result.primarySignal}.`
      : `Monitor scenario ${result.scenarioId} — ${result.primarySignal}.`,
    escalationPath: highRisk
      ? "Escalate to Evidence Command + strategy lead for same-day review."
      : "Log in scenario watchlist; review in weekly intelligence sync.",
    evidenceBlockerAction:
      result.evidenceBlockers.length > 0
        ? `Resolve evidence blockers: ${result.evidenceBlockers[0]!.slice(0, 100)}`
        : "No evidence blockers flagged — maintain citation hygiene.",
    debatePrepAction: debateTrap
      ? "Run debate prep center + what-not-to-say review before next public debate."
      : result.scenarioType === "DEBATE"
        ? "Refresh debate drill queue against export-ready claims only."
        : "No immediate debate prep action required.",
    mediaMonitoringAction: media
      ? "Increase media intake triage for linked markets — human review only."
      : "Continue routine media monitoring cadence.",
    countyBriefingAction: county
      ? `Refresh county briefing for ${result.linkedCounties[0] ?? "priority counties"}.`
      : "No county briefing refresh required from this scenario alone.",
  };
}

export function simulateStrategicScenario(
  scenarioId: string,
  repoRoot?: string,
): StrategicScenarioSimulationResult | null {
  const registry = loadStrategicScenarioRegistry(repoRoot);
  const scenario = registry.scenarios.find((row) => row.scenarioId === scenarioId);
  if (!scenario) return null;
  const ctx = buildContext(repoRoot);
  switch (scenario.scenarioType) {
    case "OPPONENT_RESPONSE":
      return simulateOpponentResponse(scenario, ctx);
    case "NARRATIVE_COLLISION":
      return simulateNarrativeCollision(scenario, ctx);
    case "DEBATE":
      return simulateDebateScenario(scenario, ctx);
    case "MEDIA_ESCALATION":
      return simulateMediaEscalation(scenario, ctx);
    case "COUNTY_REACTION":
      return simulateCountyReaction(scenario, ctx);
    case "TURNOUT_REGISTRATION":
      return simulateTurnoutRegistrationScenario(scenario, ctx);
    default:
      return scoreScenario(scenario, ctx);
  }
}

export function simulateOpponentResponse(
  scenario: StrategicScenarioRegistryEntry,
  ctx: SimulationContext,
): StrategicScenarioSimulationResult {
  const result = scoreScenario(scenario, ctx);
  result.reasons.unshift("Opponent response scenario — models likely messaging pivot, not certainty.");
  return result;
}

export function simulateNarrativeCollision(
  scenario: StrategicScenarioRegistryEntry,
  ctx: SimulationContext,
): StrategicScenarioSimulationResult {
  const result = scoreScenario(scenario, ctx);
  if (!result.signals.includes("SCENARIO_COLLISION")) result.signals.push("SCENARIO_COLLISION");
  return result;
}

export function simulateDebateScenario(
  scenario: StrategicScenarioRegistryEntry,
  ctx: SimulationContext,
): StrategicScenarioSimulationResult {
  const result = scoreScenario(scenario, ctx);
  result.whatNotToDo.push("No auto-generated final debate answer — INTERNAL_DRAFT only via NSI-12 queue.");
  return result;
}

export function simulateMediaEscalation(
  scenario: StrategicScenarioRegistryEntry,
  ctx: SimulationContext,
): StrategicScenarioSimulationResult {
  const result = scoreScenario(scenario, ctx);
  if (ctx.borderMedia.signals.length > 0) {
    result.reasons.push(
      `Border media readiness: ${ctx.borderMedia.signals.slice(0, 2).map((s) => s.signal).join(", ")}`,
    );
  }
  return result;
}

export function simulateCountyReaction(
  scenario: StrategicScenarioRegistryEntry,
  ctx: SimulationContext,
): StrategicScenarioSimulationResult {
  return scoreScenario(scenario, ctx);
}

export function simulateTurnoutRegistrationScenario(
  scenario: StrategicScenarioRegistryEntry,
  ctx: SimulationContext,
): StrategicScenarioSimulationResult {
  const result = scoreScenario(scenario, ctx);
  result.reasons.push(
    `Statewide registration anchor: ${ctx.registration.statewideRegistrationGoal} (aggregate pathway — no voter-level scoring).`,
  );
  return result;
}

export function summarizeScenarioRisk(result: StrategicScenarioSimulationResult): string {
  return `${result.primarySignal} (risk ${result.riskScore}/100): ${result.reasons[0] ?? "Review scenario assumptions."}`;
}

export function summarizeScenarioOpportunity(result: StrategicScenarioSimulationResult): string {
  const factor = result.reasons.find((r) => r.includes("STRONG") || r.includes("opportunity") || r.includes("HIGH_OPPORTUNITY"));
  return `Opportunity ${result.opportunityScore}/100 — ${factor ?? "Review linked narratives and doctrine alignment."}`;
}

export function rankScenarioPriority(
  results: StrategicScenarioSimulationResult[],
): StrategicScenarioSimulationResult[] {
  return [...results].sort(
    (a, b) => b.riskScore + b.opportunityScore * 0.5 - (a.riskScore + a.opportunityScore * 0.5),
  );
}

export function simulateAllStrategicScenarios(repoRoot?: string): StrategicScenarioSimulationResult[] {
  return getCachedSimulation(repoRoot).results;
}

function simulateAllStrategicScenariosUncached(repoRoot?: string): StrategicScenarioSimulationResult[] {
  const registry = loadStrategicScenarioRegistry(repoRoot);
  const ctx = buildContext(repoRoot);
  return registry.scenarios.map((scenario) => {
    switch (scenario.scenarioType) {
      case "OPPONENT_RESPONSE":
        return simulateOpponentResponse(scenario, ctx);
      case "NARRATIVE_COLLISION":
        return simulateNarrativeCollision(scenario, ctx);
      case "DEBATE":
        return simulateDebateScenario(scenario, ctx);
      case "MEDIA_ESCALATION":
        return simulateMediaEscalation(scenario, ctx);
      case "COUNTY_REACTION":
        return simulateCountyReaction(scenario, ctx);
      case "TURNOUT_REGISTRATION":
        return simulateTurnoutRegistrationScenario(scenario, ctx);
      default:
        return scoreScenario(scenario, ctx);
    }
  });
}

export function summarizeStrategicScenarioSimulation(repoRoot?: string): StrategicScenarioSimulationSummary {
  return getCachedSimulation(repoRoot).summary;
}

function buildStrategicScenarioSummary(
  repoRoot: string,
  allResults: StrategicScenarioSimulationResult[],
): StrategicScenarioSimulationSummary {
  const assumptions = loadVoterRegistrationAssumptions(repoRoot);
  const registration = computeStatewideRegistrationRollup(repoRoot);
  const registry = loadStrategicScenarioRegistry(repoRoot);

  const byType = allResults.reduce(
    (acc, row) => {
      acc[row.scenarioType] = (acc[row.scenarioType] ?? 0) + 1;
      return acc;
    },
    {} as Record<StrategicScenarioType, number>,
  );

  const highestRisk = [...allResults].sort((a, b) => b.riskScore - a.riskScore).slice(0, 8);
  const strongestOpportunity = [...allResults].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 8);
  const debateTraps = allResults.filter((row) => row.signals.includes("SCENARIO_DEBATE_TRAP")).slice(0, 6);
  const mediaEscalationWarnings = allResults.filter((row) => row.scenarioType === "MEDIA_ESCALATION").slice(0, 6);
  const countyReactionScenarios = allResults.filter((row) => row.scenarioType === "COUNTY_REACTION").slice(0, 6);
  const turnoutRegistrationScenarios = allResults.filter((row) => row.scenarioType === "TURNOUT_REGISTRATION").slice(0, 6);
  const narrativeCollisionWarnings = allResults.filter((row) => row.signals.includes("SCENARIO_COLLISION")).slice(0, 6);
  const fieldCapacityRisks = allResults.filter((row) => row.signals.includes("SCENARIO_FIELD_CAPACITY_RISK")).slice(0, 6);

  const evidenceDependencyBlockers = [
    ...new Set(allResults.flatMap((row) => row.evidenceBlockers)),
  ].slice(0, 8);
  const doctrineAlignmentWarnings = [
    ...new Set(allResults.flatMap((row) => row.doctrineWarnings)),
  ].slice(0, 8);

  const recommendedHumanReviewActions = [
    "Review highest-risk scenarios before debate prep or field deployment.",
    "Resolve evidence blockers on fragile narrative scenarios.",
    "Validate registration assumptions with field leadership (aggregate only).",
    "Route scenario brief drafts through NSI-12 LLM queue if narrative explanation needed.",
    ...debateTraps.slice(0, 2).map((row) => `Debate trap review: ${row.title}`),
    ...narrativeCollisionWarnings.slice(0, 2).map((row) => `Collision review: ${row.title}`),
  ];

  const registrationAssumptionNotes = [
    `registrationTurnoutAssumption: ${Math.round(assumptions.registrationTurnoutAssumption * 100)}%`,
    `supportCaptureAssumption: ${Math.round(assumptions.supportCaptureAssumption * 100)}%`,
    `Missing county goals: ${registration.missingCountyGoalCount}/${registration.countyRows.length}`,
    assumptions.notes,
  ];

  return {
    generatedAt: new Date().toISOString(),
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    scenarioModelLabel: GOVERNANCE_LABEL,
    totalScenarios: registry.scenarios.length,
    byType,
    highestRisk,
    strongestOpportunity,
    debateTraps,
    mediaEscalationWarnings,
    countyReactionScenarios,
    turnoutRegistrationScenarios,
    narrativeCollisionWarnings,
    fieldCapacityRisks,
    evidenceDependencyBlockers,
    doctrineAlignmentWarnings,
    recommendedHumanReviewActions,
    topScenarioWatchlist: rankScenarioPriority(allResults).slice(0, 10),
    registrationAssumptionNotes,
    allResults,
  };
}

export function resolveCountyScenarioWatch(
  countyId: string,
  repoRoot?: string,
): CountyScenarioWatchSummary {
  const summary = summarizeStrategicScenarioSimulation(repoRoot);
  const countyResults = summary.allResults.filter((row) => row.linkedCounties.includes(countyId));
  const countyIndex = loadCountyBriefingIntelligenceIndex(repoRoot);
  const briefing = countyIndex.counties.find((row) => row.countyId === countyId);

  return {
    countyId,
    countyName: briefing?.countyName ?? countyId,
    likelyOpponentFrames: countyResults
      .filter((row) => row.scenarioType === "OPPONENT_RESPONSE" || row.scenarioType === "COUNTY_REACTION")
      .slice(0, 3)
      .map((row) => `${row.title}: ${row.reasons[0]?.slice(0, 100) ?? ""}`),
    mediaEscalationRisks: countyResults
      .filter((row) => row.scenarioType === "MEDIA_ESCALATION")
      .slice(0, 3)
      .map((row) => summarizeScenarioRisk(row)),
    narrativeCollisionRisks: countyResults
      .filter((row) => row.signals.includes("SCENARIO_COLLISION"))
      .slice(0, 3)
      .map((row) => row.title),
    turnoutRegistrationNotes: summary.turnoutRegistrationScenarios
      .slice(0, 2)
      .map((row) => row.reasons[0] ?? row.title),
    fieldCapacityRisks: countyResults
      .filter((row) => row.signals.includes("SCENARIO_FIELD_CAPACITY_RISK"))
      .map((row) => summarizeScenarioRisk(row)),
    evidenceBlockers: [...new Set(countyResults.flatMap((row) => row.evidenceBlockers))].slice(0, 4),
    whatToWatch: countyResults.slice(0, 4).flatMap((row) => row.whatToWatchNext).slice(0, 5),
  };
}

export function summarizeDebateScenarioPrep(repoRoot?: string): DebateScenarioPrepSummary {
  if (shouldSkipHumanActionQueueSyncOnRequest()) {
    return EMPTY_DEBATE_SCENARIO_PREP;
  }
  const summary = summarizeStrategicScenarioSimulation(repoRoot);
  const debateResults = summary.allResults.filter((row) => row.scenarioType === "DEBATE" || row.scenarioType === "OPPONENT_RESPONSE");
  const memory = summarizeLongitudinalIntelligence(repoRoot);

  return {
    likelyOpponentAttacks: debateResults
      .filter((row) => row.scenarioType === "OPPONENT_RESPONSE")
      .slice(0, 5)
      .map((row) => `${row.title} — ${row.primarySignal}`),
    doctrineSafeResponseNotes: debateResults
      .slice(0, 4)
      .flatMap((row) => row.doctrineWarnings)
      .slice(0, 4),
    debateTrapWarnings: summary.debateTraps.map((row) => `${row.title}: ${row.reasons[0]?.slice(0, 100) ?? ""}`),
    evidenceDependencies: summary.evidenceDependencyBlockers.slice(0, 5),
    weakCitationWarnings: memory.staleCitations.slice(0, 4).map((row) => `${row.entityLabel}: ${row.reason.slice(0, 80)}`),
    countySensitiveNotes: summary.countyReactionScenarios
      .slice(0, 3)
      .map((row) => `${row.linkedCounties.join(", ")}: ${row.title}`),
    bridgeLineGuidance: [
      "Bridge from people-powered democracy to county partnership examples.",
      "Bridge from transparency to legal ballot secrecy protections.",
      "Use export-ready claims only — cite governed lineage.",
    ],
    whatNotToSay: [
      ...summary.debateTraps.slice(0, 2).flatMap((row) => row.whatNotToDo),
      ...memory.recurringDebateTraps.slice(0, 2).map((row) => row.reason.slice(0, 100)),
      "No unsourced opponent intent claims.",
      "No auto-generated final debate answer — INTERNAL_DRAFT only.",
    ].slice(0, 6),
  };
}

export function getCopilotScenarioHints(
  toolCategory: "opposition_research" | "debate_prep" | "writing_tools" | "briefing_papers" | "intelligence_gathering" | "general",
  repoRoot?: string,
): string[] {
  if (shouldSkipHumanActionQueueSyncOnRequest()) {
    return [
      GOVERNANCE_LABEL,
      "Scenario simulation deferred on serverless — open /admin/intelligence/scenario-simulation for trap and mock-debate context.",
    ];
  }
  const summary = summarizeStrategicScenarioSimulation(repoRoot);
  const hints: string[] = [GOVERNANCE_LABEL];

  switch (toolCategory) {
    case "debate_prep":
      hints.push(
        ...summary.debateTraps.slice(0, 2).map((row) => `Scenario debate trap: ${row.title} — ${row.primarySignal}`),
        ...summary.highestRisk.filter((r) => r.scenarioType === "DEBATE").slice(0, 1).map((r) => `High-risk debate scenario: ${r.title}`),
      );
      break;
    case "opposition_research":
      hints.push(
        ...summary.highestRisk.filter((r) => r.scenarioType === "OPPONENT_RESPONSE").slice(0, 2).map((r) => `Likely opponent response: ${r.title}`),
        ...summary.mediaEscalationWarnings.slice(0, 1).map((r) => `Media escalation: ${r.title}`),
      );
      break;
    case "writing_tools":
      hints.push(
        ...summary.narrativeCollisionWarnings.slice(0, 2).map((r) => `Collision warning: ${r.title}`),
        ...summary.allResults.filter((r) => r.signals.includes("SCENARIO_OVEREXPOSED")).slice(0, 1).map((r) => `Overexposed frame: ${r.title}`),
      );
      break;
    default:
      hints.push(
        ...summary.topScenarioWatchlist.slice(0, 2).map((r) => `${r.primarySignal}: ${r.title}`),
      );
  }
  return hints.filter(Boolean);
}