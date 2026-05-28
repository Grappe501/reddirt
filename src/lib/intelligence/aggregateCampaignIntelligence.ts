import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  reconcileCountyOverlayWithWorkbench,
  resolveCampaignCountyIdentity,
  resolveCountyClusterId,
} from "@/lib/intelligence/countyWorkbenchSynchronization";
import type {
  AggregateCampaignIntelligenceIndex,
  CampaignIntelligenceReadAdapterRegistryFile,
  CountyAggregateOperationalEnvironment,
  CountyOperationalSignal,
  CountyOperationalSignalRow,
} from "@/lib/intelligence/types/aggregateCampaignIntelligence";
import { loadKimHammerGeographicNarrativeOverlays } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import type { CountyBriefingIntelligence } from "@/lib/intelligence/types/countyBriefingIntelligence";
import { getVolunteerCapacityRowForCounty } from "@/lib/field-ops/load-volunteer-capacity-model";
import { getGotvCommitmentAllocationForCounty } from "@/lib/field-ops/load-gotv-commitment-allocation";

export const CAMPAIGN_INTELLIGENCE_READ_ADAPTERS_REL =
  "data/intelligence/campaign-intelligence-read-adapters.json";

const ELECTION_HISTORY_REL = "data/election/arkansas-county-election-history.normalized.json";
const TURNOUT_MODELS_REL = "data/simulations/turnout-sensitivity-models.json";
const RESOURCE_PRESSURE_REL = "data/resource-allocation/county-resource-pressure-table.json";
const ISSUE_CLUSTERS_REL = "data/public-narrative/county-issue-clusters.json";

type ElectionHistoryRow = {
  county: string;
  sos2022TotalVotes: number;
  sos2022DemVotes: number;
  presidential2024TotalVotes: number;
  presidential2024DemVotes: number;
};

type TurnoutModelRow = {
  countySlug: string;
  countyName: string;
  baselineTurnout: number;
  projectedTurnout: number;
  turnoutDelta: number;
  confidenceScore: number;
};

type ResourcePressureRow = {
  countySlug: string;
  countyName: string;
  pressureScore: number;
  pressureBand: string;
};

type IssueClusterRow = {
  countySlug: string;
  countyName: string;
  clusterId: string;
  topIssues: string[];
  volatility: string;
};

function readJson<T>(repoRoot: string, rel: string): T | null {
  const abs = path.join(repoRoot, rel);
  if (!existsSync(abs)) return null;
  try {
    return JSON.parse(readFileSync(abs, "utf8")) as T;
  } catch {
    return null;
  }
}

export function loadCampaignIntelligenceReadAdapters(
  repoRoot: string = process.cwd(),
): CampaignIntelligenceReadAdapterRegistryFile {
  const file = readJson<CampaignIntelligenceReadAdapterRegistryFile>(
    repoRoot,
    CAMPAIGN_INTELLIGENCE_READ_ADAPTERS_REL,
  );
  if (!file) {
    return {
      generatedAt: new Date().toISOString(),
      registryVersion: "1.0",
      purpose: "Uninitialized adapter registry",
      aggregateOnlyPolicy: "Aggregate-only",
      adapters: [],
    };
  }
  return file;
}

function loadElectionRow(fieldOpsName: string, repoRoot: string): ElectionHistoryRow | null {
  const file = readJson<{ rows: ElectionHistoryRow[] }>(repoRoot, ELECTION_HISTORY_REL);
  return file?.rows.find((row) => row.county === fieldOpsName) ?? null;
}

function loadTurnoutRow(registrySlug: string, repoRoot: string): TurnoutModelRow | null {
  const file = readJson<{ rows: TurnoutModelRow[] }>(repoRoot, TURNOUT_MODELS_REL);
  return file?.rows.find((row) => row.countySlug === registrySlug) ?? null;
}

function loadResourcePressure(registrySlug: string, repoRoot: string): ResourcePressureRow | null {
  const file = readJson<{ rows: ResourcePressureRow[] }>(repoRoot, RESOURCE_PRESSURE_REL);
  return file?.rows.find((row) => row.countySlug === registrySlug) ?? null;
}

function loadIssueCluster(registrySlug: string, repoRoot: string): IssueClusterRow | null {
  const file = readJson<{ rows: IssueClusterRow[] }>(repoRoot, ISSUE_CLUSTERS_REL);
  return file?.rows.find((row) => row.countySlug === registrySlug) ?? null;
}

function resolveOperationalSignals(input: {
  countyId: string;
  countyName: string;
  briefing: CountyBriefingIntelligence;
  overlay?: ReturnType<typeof loadKimHammerGeographicNarrativeOverlays>["overlays"][number];
  turnout?: TurnoutModelRow | null;
  volunteer?: ReturnType<typeof getVolunteerCapacityRowForCounty>;
  gotv?: ReturnType<typeof getGotvCommitmentAllocationForCounty>;
  pressure?: ResourcePressureRow | null;
}): CountyOperationalSignalRow[] {
  const signals: CountyOperationalSignalRow[] = [];
  const { countyName, briefing, overlay, turnout, volunteer, gotv, pressure } = input;

  const stable =
    briefing.confidenceBand === "STRONG" &&
    (pressure?.pressureBand === "LOW" || !pressure) &&
    briefing.blockedNarratives.length === 0;
  if (stable) {
    signals.push({
      signal: "COUNTY_OPERATIONALLY_STABLE",
      text: `${countyName} shows stable operational environment with strong narrative readiness and manageable resource pressure.`,
    });
  }

  if (
    pressure?.pressureBand === "HIGH" ||
    volunteer?.confidence === "low" ||
    briefing.openResearchNeeds.length >= 4
  ) {
    signals.push({
      signal: "COUNTY_OPERATIONALLY_STRAINED",
      text: `${countyName} governance/field burdens emerging — resource pressure ${pressure?.pressureBand ?? "unknown"} with ${briefing.openResearchNeeds.length} open research item(s).`,
    });
  }

  if (turnout && Math.abs(turnout.turnoutDelta) >= 2) {
    signals.push({
      signal: "COUNTY_TURNOUT_VOLATILE",
      text: `${countyName} participation patterns unstable — projected turnout ${turnout.projectedTurnout}% vs baseline ${turnout.baselineTurnout}% (Δ${turnout.turnoutDelta}).`,
    });
  }

  if (
    gotv &&
    (gotv.volunteerCommitmentTarget ?? 0) > 0 &&
    (gotv.commitmentGap ?? 0) > (gotv.volunteerCommitmentTarget ?? 0) * 0.35
  ) {
    signals.push({
      signal: "COUNTY_VOLUNTEER_WEAK",
      text: `${countyName} limited local campaign capacity — aggregate commitment gap indicates understaffed field operations.`,
    });
  } else if (volunteer && (volunteer.countyVolunteerNeedWeight ?? 0) > 0.7) {
    signals.push({
      signal: "COUNTY_VOLUNTEER_WEAK",
      text: `${countyName} volunteer need weight elevated (${volunteer.countyVolunteerNeedWeight}) — prioritize relational organizing before heavy narrative deployment.`,
    });
  }

  if (overlay?.localMediaRisk === "HIGH" || briefing.briefingSignals.some((row) => row.signal === "COUNTY_MESSAGE_RISK")) {
    signals.push({
      signal: "COUNTY_MEDIA_SATURATED",
      text: `${countyName} narrative/media overload risk — local media risk ${overlay?.localMediaRisk ?? "elevated"} with deployment sensitivity on opposition narratives.`,
    });
  }

  if (turnout && turnout.projectedTurnout < 45) {
    signals.push({
      signal: "COUNTY_CIVIC_DISENGAGED",
      text: `${countyName} weak participation environment — projected aggregate turnout ${turnout.projectedTurnout}% suggests civic engagement framing must lead with access and trust.`,
    });
  }

  if (
    briefing.briefingSignals.some((row) => row.signal === "COUNTY_HIGH_OPPORTUNITY") ||
    (briefing.confidenceBand === "STRONG" && overlay?.localDebateRelevance === "HIGH")
  ) {
    signals.push({
      signal: "COUNTY_HIGH_OPPORTUNITY",
      text: `${countyName} strong strategic conditions for doctrine-aligned county-burden and process-trust messaging when citations are verified.`,
    });
  }

  const complex =
    briefing.confidenceBand === "BLOCKED" ||
    briefing.blockedNarratives.length > 0 ||
    briefing.briefingSignals.some((row) => row.signal === "COUNTY_CITATION_WEAK");
  if (complex) {
    const pulaskiStyle =
      countyName.includes("Pulaski") &&
      briefing.topOpponentBills.some((row) => row.billNumber === "SB487");
    signals.push({
      signal: "COUNTY_STRUCTURALLY_COMPLEX",
      text: pulaskiStyle
        ? `${countyName} operationally strong for county-burden messaging, but media saturation and unresolved SB487 citation risk create elevated deployment sensitivity.`
        : `${countyName} messaging/operations require caution — blocked narratives or citation weakness elevate structural complexity.`,
    });
  }

  return signals;
}

export function computeCountyOperationalEnvironment(
  countyId: string,
  repoRoot: string = process.cwd(),
  briefingOverride?: CountyBriefingIntelligence,
): CountyAggregateOperationalEnvironment | undefined {
  const briefing = briefingOverride;
  if (!briefing) return undefined;

  const identity = resolveCampaignCountyIdentity(countyId);
  const sync = reconcileCountyOverlayWithWorkbench(countyId, repoRoot);
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);

  const election = countyId === "statewide" ? null : loadElectionRow(identity.fieldOpsName, repoRoot);
  const turnout = countyId === "statewide" ? null : loadTurnoutRow(identity.registrySlug, repoRoot);
  const volunteer =
    countyId === "statewide" ? null : getVolunteerCapacityRowForCounty(identity.fieldOpsName, repoRoot);
  const gotv =
    countyId === "statewide" ? null : getGotvCommitmentAllocationForCounty(identity.fieldOpsName, repoRoot);
  const pressure = countyId === "statewide" ? null : loadResourcePressure(identity.registrySlug, repoRoot);
  const issues = countyId === "statewide" ? null : loadIssueCluster(identity.registrySlug, repoRoot);

  const adapterIdsUsed: string[] = ["adapter-media-market"];
  if (election) adapterIdsUsed.push("adapter-election-results");
  if (turnout) adapterIdsUsed.push("adapter-turnout-history");
  if (volunteer) adapterIdsUsed.push("adapter-volunteer-systems");
  if (gotv) adapterIdsUsed.push("adapter-field-operations");
  if (pressure) adapterIdsUsed.push("adapter-resource-pressure");
  if (issues) adapterIdsUsed.push("adapter-demographic-overlays");
  if (sync.workbenchConnected) adapterIdsUsed.push("adapter-county-workbench");

  const operationalEnvironment: string[] = [
    overlay?.localOperationalImpact ?? "Statewide operational framing applies across 75 counties.",
    sync.workbenchConnected
      ? `CountyWorkbench connected (${sync.workbenchDepth}) — aggregate profile depth available.`
      : "CountyWorkbench bridge not connected for this county — overlay-driven composition only.",
    pressure
      ? `Resource pressure: ${pressure.pressureBand} (${pressure.pressureScore}/100).`
      : "Resource pressure data unavailable for aggregate briefing.",
  ];

  const turnoutParticipationEnvironment: string[] = [];
  if (election) {
    const sosDemShare =
      election.sos2022TotalVotes > 0
        ? ((election.sos2022DemVotes / election.sos2022TotalVotes) * 100).toFixed(1)
        : "—";
    turnoutParticipationEnvironment.push(
      `2022 SOS aggregate: ${election.sos2022TotalVotes.toLocaleString()} ballots · ${sosDemShare}% Dem share (county aggregate only).`,
    );
    const presDemShare =
      election.presidential2024TotalVotes > 0
        ? ((election.presidential2024DemVotes / election.presidential2024TotalVotes) * 100).toFixed(1)
        : "—";
    turnoutParticipationEnvironment.push(
      `2024 presidential aggregate: ${election.presidential2024TotalVotes.toLocaleString()} ballots · ${presDemShare}% Dem share.`,
    );
  }
  if (turnout) {
    turnoutParticipationEnvironment.push(
      `Turnout forecast: baseline ${turnout.baselineTurnout}% → projected ${turnout.projectedTurnout}% (confidence ${turnout.confidenceScore}).`,
    );
  }
  if (countyId === "statewide") {
    turnoutParticipationEnvironment.push("Statewide participation context uses cross-county aggregate adapters — no voter-level outputs.");
  }

  const volunteerFieldReadiness: string[] = [];
  if (volunteer) {
    volunteerFieldReadiness.push(
      `Volunteer need weight: ${volunteer.countyVolunteerNeedWeight ?? "—"} · event staffing need: ${volunteer.eventStaffingNeed}.`,
    );
    volunteerFieldReadiness.push(
      `Aggregate field needs: house parties ${volunteer.housePartyHostNeed}, follow-up volunteers ${volunteer.followUpVolunteerNeed}.`,
    );
  }
  if (gotv) {
    volunteerFieldReadiness.push(
      `GOTV commitment target ${gotv.volunteerCommitmentTarget} · gap ${gotv.commitmentGap} · opportunity load ${gotv.opportunityLoadScore}.`,
    );
  }

  const mediaEcosystemEnvironment: string[] = [
    `Local media risk: ${overlay?.localMediaRisk ?? "unknown"}.`,
    `Debate relevance: ${overlay?.localDebateRelevance ?? "unknown"}.`,
    sync.mediaRegionGroup ? `Media region group: ${sync.mediaRegionGroup}.` : "Media market DMA artifact pending (SYNC-3).",
  ];

  const demographicEconomicContext: string[] = [];
  if (issues) {
    demographicEconomicContext.push(
      `Issue cluster ${issues.clusterId}: ${issues.topIssues.slice(0, 3).join("; ")} (volatility ${issues.volatility}).`,
    );
  }
  demographicEconomicContext.push(
    "Census/BLS aggregate overlays planned — acs-bls-import-template.csv not yet populated for this county.",
  );

  const strategicOpportunityAnalysis: string[] = [
    ...briefing.countyStrategyNotes.slice(0, 2),
    briefing.topNarratives[0]
      ? `Strongest narrative: ${briefing.topNarratives[0].narrativeTitle}.`
      : "No strong local narrative cell — prioritize research before deployment.",
  ];
  if (gotv && (gotv.opportunityLoadScore ?? 0) >= 0.6) {
    strategicOpportunityAnalysis.push("Aggregate field opportunity load score suggests favorable organizational upside if volunteer gap closes.");
  }

  const operationalRiskAnalysis: string[] = [
    ...briefing.localRiskSummary,
    ...briefing.whatToAvoid.slice(0, 2),
  ];
  if (pressure?.pressureBand === "HIGH") {
    operationalRiskAnalysis.push("High resource pressure — avoid over-deploying narratives without field support.");
  }

  const operationalSignals = resolveOperationalSignals({
    countyId,
    countyName: briefing.countyName,
    briefing,
    overlay,
    turnout,
    volunteer,
    gotv,
    pressure,
  });

  return {
    countyId,
    countyName: briefing.countyName,
    registrySlug: identity.registrySlug,
    operationalEnvironment,
    turnoutParticipationEnvironment,
    volunteerFieldReadiness,
    mediaEcosystemEnvironment,
    demographicEconomicContext,
    strategicOpportunityAnalysis,
    operationalRiskAnalysis,
    operationalSignals,
    adapterIdsUsed: [...new Set(adapterIdsUsed)],
    regionalClusterId: resolveCountyClusterId(countyId),
    computedAt: new Date().toISOString(),
  };
}

export function resolveCountyAggregateSignals(
  countyId: string,
  repoRoot?: string,
): CountyOperationalSignalRow[] {
  return computeCountyOperationalEnvironment(countyId, repoRoot)?.operationalSignals ?? [];
}

export function computeCountyTurnoutSignals(countyId: string, repoRoot?: string): string[] {
  return computeCountyOperationalEnvironment(countyId, repoRoot)?.turnoutParticipationEnvironment ?? [];
}

export function computeCountyVolunteerReadiness(countyId: string, repoRoot?: string): string[] {
  return computeCountyOperationalEnvironment(countyId, repoRoot)?.volunteerFieldReadiness ?? [];
}

export function computeCountyMediaEnvironment(countyId: string, repoRoot?: string): string[] {
  return computeCountyOperationalEnvironment(countyId, repoRoot)?.mediaEcosystemEnvironment ?? [];
}

export function summarizeCountyOperationalRisk(
  countyId: string,
  repoRoot?: string,
): {
  countyId: string;
  countyName: string;
  primarySignal: CountyOperationalSignal | "NONE";
  primarySignalText: string;
  riskLines: string[];
} {
  const env = computeCountyOperationalEnvironment(countyId, repoRoot);
  const primary = env?.operationalSignals[0];
  return {
    countyId,
    countyName: env?.countyName ?? countyId,
    primarySignal: primary?.signal ?? "NONE",
    primarySignalText: primary?.text ?? "No operational signals computed.",
    riskLines: env?.operationalRiskAnalysis ?? [],
  };
}

export function buildAggregateCampaignIntelligenceIndex(
  countyBriefings: CountyBriefingIntelligence[],
  repoRoot: string = process.cwd(),
): AggregateCampaignIntelligenceIndex {
  const adapters = loadCampaignIntelligenceReadAdapters(repoRoot);
  const countyEnvironments = countyBriefings
    .map((briefing) => computeCountyOperationalEnvironment(briefing.countyId, repoRoot, briefing))
    .filter((row): row is CountyAggregateOperationalEnvironment => Boolean(row));

  return {
    generatedAt: new Date().toISOString(),
    adapterCount: adapters.adapters.length,
    liveAdapterCount: adapters.adapters.filter((row) => row.sourceStatus === "LIVE").length,
    countiesEnriched: countyEnvironments.length,
    countyEnvironments,
  };
}

export function loadAggregateCampaignIntelligence(
  repoRoot: string = process.cwd(),
  countyBriefings: CountyBriefingIntelligence[],
): AggregateCampaignIntelligenceIndex {
  return buildAggregateCampaignIntelligenceIndex(countyBriefings, repoRoot);
}

export function summarizeOperationalIntelligenceForEvidenceCommand(
  countyBriefings: CountyBriefingIntelligence[],
  repoRoot?: string,
): {
  adapterCount: number;
  liveAdapterCount: number;
  turnoutVolatileCounties: Array<{ countyId: string; countyName: string; signal: string }>;
  mediaSaturationWarnings: Array<{ countyId: string; countyName: string; signal: string }>;
  countyOpportunityRankings: Array<{ countyId: string; countyName: string; signal: string }>;
  structurallyFragileCounties: Array<{ countyId: string; countyName: string; signal: string }>;
  volunteerReadinessSummaries: Array<{ countyId: string; countyName: string; summary: string }>;
} {
  const index = buildAggregateCampaignIntelligenceIndex(countyBriefings, repoRoot);

  const turnoutVolatileCounties = index.countyEnvironments
    .flatMap((env) =>
      env.operationalSignals
        .filter((row) => row.signal === "COUNTY_TURNOUT_VOLATILE")
        .map((row) => ({ countyId: env.countyId, countyName: env.countyName, signal: row.text.slice(0, 140) })),
    );

  const mediaSaturationWarnings = index.countyEnvironments
    .flatMap((env) =>
      env.operationalSignals
        .filter((row) => row.signal === "COUNTY_MEDIA_SATURATED")
        .map((row) => ({ countyId: env.countyId, countyName: env.countyName, signal: row.text.slice(0, 140) })),
    );

  const countyOpportunityRankings = index.countyEnvironments
    .flatMap((env) =>
      env.operationalSignals
        .filter((row) => row.signal === "COUNTY_HIGH_OPPORTUNITY")
        .map((row) => ({ countyId: env.countyId, countyName: env.countyName, signal: row.text.slice(0, 140) })),
    );

  const structurallyFragileCounties = index.countyEnvironments
    .flatMap((env) =>
      env.operationalSignals
        .filter((row) => row.signal === "COUNTY_STRUCTURALLY_COMPLEX")
        .map((row) => ({ countyId: env.countyId, countyName: env.countyName, signal: row.text.slice(0, 160) })),
    );

  const volunteerReadinessSummaries = index.countyEnvironments.map((env) => ({
    countyId: env.countyId,
    countyName: env.countyName,
    summary: env.volunteerFieldReadiness[0] ?? "No volunteer aggregate data attached.",
  }));

  return {
    adapterCount: index.adapterCount,
    liveAdapterCount: index.liveAdapterCount,
    turnoutVolatileCounties,
    mediaSaturationWarnings,
    countyOpportunityRankings,
    structurallyFragileCounties,
    volunteerReadinessSummaries,
  };
}
