import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import { loadKimHammerAiSuggestionSandbox } from "@/lib/opposition/kimHammerSuggestionSandbox";
import {
  resolveKimHammerNarrativeState,
} from "@/lib/opposition/kimHammerNarrativeState";
import type {
  KimHammerGeographicCountyState,
  KimHammerGeographicNarrativeIndex,
  KimHammerGeographicNarrativeOverlaysFile,
  KimHammerGeographicOverlayEntry,
  KimHammerGeographicReadinessSignal,
  KimHammerNarrativeCountyState,
} from "@/lib/opposition/types/kimHammerGeographicNarrative";

export const KIM_HAMMER_GEOGRAPHIC_NARRATIVE_OVERLAYS_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-geographic-narrative-overlays.json";

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

function readJsonFile<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, relPath), "utf8")) as T;
}

export function loadKimHammerGeographicNarrativeOverlays(
  repoRoot: string = process.cwd(),
): KimHammerGeographicNarrativeOverlaysFile {
  if (!existsSync(absPath(repoRoot, KIM_HAMMER_GEOGRAPHIC_NARRATIVE_OVERLAYS_REL))) {
    return {
      generatedAt: new Date().toISOString(),
      overlayVersion: "1.0",
      purpose: "Geographic overlays not yet initialized.",
      overlays: [],
    };
  }
  return readJsonFile<KimHammerGeographicNarrativeOverlaysFile>(
    repoRoot,
    KIM_HAMMER_GEOGRAPHIC_NARRATIVE_OVERLAYS_REL,
  );
}

function resolveCountyExportUsage(
  countyId: string,
  repoRoot: string,
): number {
  const history = loadKimHammerExportHistory(repoRoot);
  if (countyId === "statewide") {
    return history.entries.filter((entry) => entry.scope !== "COUNTY").length;
  }
  return history.entries.filter(
    (entry) => entry.scope === "COUNTY" && entry.countyId?.toLowerCase() === countyId.toLowerCase(),
  ).length;
}

function resolveGeographicSignal(
  baseScore: number,
  baseBand: string,
  exportUsage: number,
  overlayExportUsage: number,
  localDebateRelevance: string,
  blockers: string[],
  hasCountyResearchGap: boolean,
): KimHammerGeographicReadinessSignal {
  if (blockers.some((row) => row.startsWith("CITATION_BLOCKED:") || row.startsWith("BLOCKED:"))) {
    return "COUNTY_BLOCKED";
  }
  if (baseBand === "BLOCKED") {
    return "COUNTY_BLOCKED";
  }

  const totalExports = exportUsage + overlayExportUsage;

  if (totalExports >= 2 && baseScore < 0.7) {
    return "COUNTY_OVEREXPOSED";
  }
  if (totalExports >= 1 && baseScore < 0.65) {
    return "COUNTY_OVEREXPOSED";
  }

  if (
    hasCountyResearchGap &&
    totalExports === 0 &&
    localDebateRelevance !== "HIGH" &&
    baseScore < 0.75
  ) {
    return "COUNTY_UNDERDEVELOPED";
  }
  if (totalExports === 0 && baseBand === "WEAK" && localDebateRelevance === "LOW") {
    return "COUNTY_UNDERDEVELOPED";
  }

  if (baseScore >= 0.85) return "COUNTY_STRONG";
  if (baseScore >= 0.65) return "COUNTY_MODERATE";
  return "COUNTY_WEAK";
}

function buildGeographicSignalText(
  countyName: string,
  narrativeTitle: string,
  signal: KimHammerGeographicReadinessSignal,
  blockers: string[],
  exportUsage: number,
  strategicNotes: string,
): string {
  if (signal === "COUNTY_BLOCKED" && blockers.length > 0) {
    return `${countyName} · ${narrativeTitle}: ${blockers[0]}`;
  }
  if (signal === "COUNTY_OVEREXPOSED") {
    return `${countyName}: ${narrativeTitle} exported ${exportUsage} time(s) but dependencies remain weak — review before reuse.`;
  }
  if (signal === "COUNTY_UNDERDEVELOPED") {
    return `${countyName}: ${narrativeTitle} underdeveloped locally — ${strategicNotes}`;
  }
  if (signal === "COUNTY_STRONG") {
    return `${countyName}: ${narrativeTitle} geographically strong — export-ready dependencies and local relevance align.`;
  }
  if (signal === "COUNTY_MODERATE") {
    return `${countyName}: ${narrativeTitle} usable with caution — verify county-specific sourcing before local deployment.`;
  }
  return `${countyName}: ${narrativeTitle} geographically weak — ${blockers[0] ?? strategicNotes}`;
}

export function resolveNarrativeCountyState(
  narrativeId: string,
  countyId: string,
  repoRoot: string = process.cwd(),
): KimHammerNarrativeCountyState | undefined {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const overlay = overlays.overlays.find((row) => row.countyId === countyId);
  if (!overlay || !overlay.narrativeIds.includes(narrativeId)) {
    return undefined;
  }

  const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
  if (!narrative) return undefined;

  const countyExportUsage = resolveCountyExportUsage(countyId, repoRoot);
  const sandbox = loadKimHammerAiSuggestionSandbox(repoRoot);
  const pendingSuggestions = sandbox.suggestions.filter(
    (row) =>
      row.status === "PENDING" && row.relatedNarrativeIds?.includes(narrativeId),
  );

  const blockers = [
    ...narrative.blockers,
    ...overlay.unresolvedDependencies.filter((dep) =>
      dep.toLowerCase().includes(narrativeId.replaceAll("-", " ")) ||
      narrative.linkedCitationIds.some((id) => dep.includes(id)) ||
      narrative.linkedClaimIds.some((id) => dep.includes(id)) ||
      narrative.linkedTaskIds.some((id) => dep.includes(id)),
    ),
  ];

  if (narrative.taskSummary.inProgress > 0) {
    for (const taskId of narrative.linkedTaskIds) {
      blockers.push(`TASK: ${taskId} in progress`);
    }
  }

  if (pendingSuggestions.length > 0) {
    blockers.push(
      `AI_PRESSURE: ${pendingSuggestions.length} pending suggestion(s) for ${narrativeId} in ${countyId}.`,
    );
  }

  const geographicScore = Math.max(
    0,
    Math.min(1, Number((narrative.readinessScore + overlay.narrativeStrengthModifier).toFixed(2))),
  );

  const hasCountyResearchGap = overlay.recommendedResearchNeeds.length > 0;
  const exportUsage = overlay.exportUsageCount + countyExportUsage;

  const geographicSignal = resolveGeographicSignal(
    geographicScore,
    narrative.readinessBand,
    countyExportUsage,
    overlay.exportUsageCount,
    overlay.localDebateRelevance,
    blockers,
    hasCountyResearchGap,
  );

  const uniqueBlockers = [...new Set(blockers)];

  return {
    countyId: overlay.countyId,
    countyName: overlay.countyName,
    narrativeId,
    narrativeTitle: narrative.title,
    geographicSignal,
    geographicScore,
    signal: buildGeographicSignalText(
      overlay.countyName,
      narrative.title,
      geographicSignal,
      uniqueBlockers,
      exportUsage,
      overlay.strategicNotes,
    ),
    blockers: uniqueBlockers,
    baseReadinessBand: narrative.readinessBand,
    baseReadinessScore: narrative.readinessScore,
    narrativeStrengthModifier: overlay.narrativeStrengthModifier,
    exportUsageCount: exportUsage,
    unresolvedDependencyCount: overlay.unresolvedDependencies.length + narrative.blockers.length,
    localMediaRisk: overlay.localMediaRisk,
    localDebateRelevance: overlay.localDebateRelevance,
  };
}

export function computeGeographicNarrativeState(
  overlay: KimHammerGeographicOverlayEntry,
  repoRoot: string = process.cwd(),
): KimHammerGeographicCountyState {
  const narrativeStates = overlay.narrativeIds
    .map((narrativeId) => resolveNarrativeCountyState(narrativeId, overlay.countyId, repoRoot))
    .filter((row): row is KimHammerNarrativeCountyState => Boolean(row));

  const countyExportUsage = resolveCountyExportUsage(overlay.countyId, repoRoot);
  const averageScore =
    narrativeStates.length > 0
      ? Number(
          (
            narrativeStates.reduce((sum, row) => sum + row.geographicScore, 0) /
            narrativeStates.length
          ).toFixed(2),
        )
      : 0;

  const signalPriority: KimHammerGeographicReadinessSignal[] = [
    "COUNTY_BLOCKED",
    "COUNTY_OVEREXPOSED",
    "COUNTY_UNDERDEVELOPED",
    "COUNTY_WEAK",
    "COUNTY_MODERATE",
    "COUNTY_STRONG",
  ];

  const dominantSignal =
    signalPriority.find((signal) =>
      narrativeStates.some((row) => row.geographicSignal === signal),
    ) ?? "COUNTY_MODERATE";

  const blockedNarrativeCount = narrativeStates.filter(
    (row) => row.geographicSignal === "COUNTY_BLOCKED",
  ).length;
  const overexposedNarrativeCount = narrativeStates.filter(
    (row) => row.geographicSignal === "COUNTY_OVEREXPOSED",
  ).length;
  const underdevelopedNarrativeCount = narrativeStates.filter(
    (row) => row.geographicSignal === "COUNTY_UNDERDEVELOPED",
  ).length;

  const weakest = [...narrativeStates].sort((a, b) => a.geographicScore - b.geographicScore)[0];
  const topRiskSignal =
    weakest?.signal ?? `${overlay.countyName}: no narrative cells computed.`;

  return {
    countyId: overlay.countyId,
    countyName: overlay.countyName,
    localSensitivity: overlay.localSensitivity,
    localOperationalImpact: overlay.localOperationalImpact,
    countyBurdenSignals: overlay.countyBurdenSignals,
    strategicNotes: overlay.strategicNotes,
    dominantSignal,
    averageScore,
    narrativeStates,
    exportUsageCount: overlay.exportUsageCount + countyExportUsage,
    blockedNarrativeCount,
    overexposedNarrativeCount,
    underdevelopedNarrativeCount,
    topRiskSignal,
    computedAt: new Date().toISOString(),
  };
}

export function loadGeographicNarrativeIndex(
  repoRoot: string = process.cwd(),
): KimHammerGeographicNarrativeIndex {
  const overlays = loadKimHammerGeographicNarrativeOverlays(repoRoot);
  const counties = overlays.overlays.map((overlay) =>
    computeGeographicNarrativeState(overlay, repoRoot),
  );

  const signalCounts: Record<KimHammerGeographicReadinessSignal, number> = {
    COUNTY_STRONG: 0,
    COUNTY_MODERATE: 0,
    COUNTY_WEAK: 0,
    COUNTY_BLOCKED: 0,
    COUNTY_OVEREXPOSED: 0,
    COUNTY_UNDERDEVELOPED: 0,
  };

  let narrativeCellCount = 0;
  for (const county of counties) {
    for (const cell of county.narrativeStates) {
      narrativeCellCount += 1;
      signalCounts[cell.geographicSignal] += 1;
    }
  }

  const topGeographicRisks = counties
    .filter(
      (county) =>
        county.dominantSignal === "COUNTY_BLOCKED" ||
        county.dominantSignal === "COUNTY_WEAK" ||
        county.dominantSignal === "COUNTY_OVEREXPOSED" ||
        county.dominantSignal === "COUNTY_UNDERDEVELOPED",
    )
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5)
    .map((county) => ({
      countyId: county.countyId,
      countyName: county.countyName,
      signal: county.topRiskSignal,
    }));

  return {
    generatedAt: new Date().toISOString(),
    countyCount: counties.length,
    narrativeCellCount,
    signalCounts,
    counties,
    topGeographicRisks,
  };
}

export function filterGeographicCountyStates(
  index: KimHammerGeographicNarrativeIndex,
  filters: {
    countyQuery?: string;
    signal?: KimHammerGeographicReadinessSignal | "ALL";
    narrativeQuery?: string;
  },
): KimHammerGeographicCountyState[] {
  const countyQuery = filters.countyQuery?.trim().toLowerCase() ?? "";
  const narrativeQuery = filters.narrativeQuery?.trim().toLowerCase() ?? "";
  const signal = filters.signal ?? "ALL";

  return index.counties.filter((county) => {
    if (countyQuery) {
      const haystack = `${county.countyId} ${county.countyName} ${county.strategicNotes}`.toLowerCase();
      if (!haystack.includes(countyQuery)) return false;
    }
    if (signal !== "ALL" && county.dominantSignal !== signal) return false;
    if (narrativeQuery) {
      const haystack = county.narrativeStates
        .map((cell) => `${cell.narrativeId} ${cell.narrativeTitle}`)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(narrativeQuery)) return false;
    }
    return true;
  });
}

export function summarizeGeographicNarrativeForCommand(
  repoRoot?: string,
): {
  countyCount: number;
  blockedCells: number;
  underdevelopedCells: number;
  topRisks: KimHammerGeographicNarrativeIndex["topGeographicRisks"];
} {
  const index = loadGeographicNarrativeIndex(repoRoot);
  return {
    countyCount: index.countyCount,
    blockedCells: index.signalCounts.COUNTY_BLOCKED,
    underdevelopedCells: index.signalCounts.COUNTY_UNDERDEVELOPED,
    topRisks: index.topGeographicRisks.slice(0, 3),
  };
}
