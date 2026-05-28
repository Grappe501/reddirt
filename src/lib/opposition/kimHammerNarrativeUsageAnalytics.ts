import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadKimHammerAiSuggestionSandbox } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import { loadGeographicNarrativeIndex } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import {
  loadKimHammerNarrativeRegistry,
  loadKimHammerNarrativeStateIndex,
  resolveKimHammerNarrativeState,
} from "@/lib/opposition/kimHammerNarrativeState";
import type { KimHammerExportHistoryEntry } from "@/lib/opposition/types/kimHammerExportControl";
import type { KimHammerNarrativeRegistryEntry } from "@/lib/opposition/types/kimHammerNarrativeState";
import type {
  KimHammerNarrativeDeploymentEvent,
  KimHammerNarrativeDeploymentHistory,
  KimHammerNarrativeFatigueRecord,
  KimHammerNarrativeFreshness,
  KimHammerNarrativeUsageAnalyticsIndex,
  KimHammerNarrativeUsageAnalyticsRecord,
  KimHammerNarrativeUsageSignal,
} from "@/lib/opposition/types/kimHammerNarrativeUsageAnalytics";

export const CAMPAIGN_INTELLIGENCE_SYSTEM_MAP_REL = "docs/intelligence/CAMPAIGN_INTELLIGENCE_SYSTEM_MAP.md";
export const CAMPAIGN_INTELLIGENCE_SYNCHRONIZATION_PLAN_REL =
  "docs/intelligence/CAMPAIGN_INTELLIGENCE_SYNCHRONIZATION_PLAN.md";

const MS_PER_DAY = 86_400_000;

function daysSince(isoDate: string | null | undefined, now = Date.now()): number | null {
  if (!isoDate) return null;
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.floor((now - parsed) / MS_PER_DAY));
}

function entryMatchesNarrative(
  entry: KimHammerExportHistoryEntry,
  narrativeId: string,
  linkedClaimIds: string[],
): KimHammerNarrativeDeploymentEvent | undefined {
  if (entry.narrativeIds.includes(narrativeId)) {
    return {
      exportId: entry.exportId,
      packetVersion: entry.packetVersion,
      scope: entry.scope,
      countyId: entry.countyId,
      exportedAt: entry.exportedAt,
      claimIds: entry.claimIds,
      citationIds: entry.citationIds,
      operator: entry.operator,
      linkReason: "NARRATIVE_ID",
    };
  }

  const claimOverlap = entry.claimIds.some((claimId) => linkedClaimIds.includes(claimId));
  if (!claimOverlap) return undefined;

  return {
    exportId: entry.exportId,
    packetVersion: entry.packetVersion,
    scope: entry.scope,
    countyId: entry.countyId,
    exportedAt: entry.exportedAt,
    claimIds: entry.claimIds,
    citationIds: entry.citationIds,
    operator: entry.operator,
    linkReason: "CLAIM_LINEAGE",
  };
}

export function resolveNarrativeDeploymentHistory(
  narrativeId: string,
  repoRoot: string = process.cwd(),
): KimHammerNarrativeDeploymentHistory {
  const registry = loadKimHammerNarrativeRegistry(repoRoot);
  const entry = registry.narratives.find((row) => row.narrativeId === narrativeId);
  const history = loadKimHammerExportHistory(repoRoot);

  if (!entry) {
    return {
      narrativeId,
      narrativeTitle: narrativeId,
      deploymentCount: 0,
      firstDeployedAt: null,
      lastDeployedAt: null,
      lastScope: null,
      countyScopes: [],
      events: [],
    };
  }

  const events = history.entries
    .map((row) => entryMatchesNarrative(row, narrativeId, entry.linkedClaimIds))
    .filter((row): row is KimHammerNarrativeDeploymentEvent => Boolean(row))
    .sort((a, b) => b.exportedAt.localeCompare(a.exportedAt));

  const countyScopes = [
    ...new Set(events.map((row) => row.countyId ?? row.scope).filter(Boolean)),
  ] as string[];

  return {
    narrativeId,
    narrativeTitle: entry.title,
    deploymentCount: events.length,
    firstDeployedAt: events.at(-1)?.exportedAt ?? null,
    lastDeployedAt: events[0]?.exportedAt ?? null,
    lastScope: events[0]?.scope ?? null,
    countyScopes,
    events,
  };
}

export function computeNarrativeFreshness(
  narrativeId: string,
  repoRoot: string = process.cwd(),
): KimHammerNarrativeFreshness {
  const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
  const locker = loadKimHammerCitationLocker(repoRoot);
  const now = Date.now();

  if (!narrative) {
    return {
      narrativeId,
      freshnessScore: 0,
      staleCitationCount: 0,
      needsAttentionCitationCount: 0,
      oldestValidationAgeDays: null,
      lastReviewRecencyDays: null,
      signal: "No narrative state available for freshness scoring.",
    };
  }

  const citations = locker.citations.filter(
    (card) =>
      narrative.linkedCitationIds.includes(card.id) ||
      card.linkedNarrativeIds?.includes(narrativeId),
  );

  const staleCitationCount = citations.filter(
    (card) =>
      card.sourceHealth === "STALE" ||
      card.sourceHealth === "ARCHIVE_MISSING" ||
      card.reviewStatus === "STALE",
  ).length;

  const needsAttentionCitationCount = citations.filter(
    (card) =>
      card.reviewStatus === "NEEDS_REVIEW" ||
      card.sourceHealth === "NEEDS_REVALIDATION" ||
      card.sourceHealth === "BROKEN",
  ).length;

  const validationAges = citations
    .map((card) => daysSince(card.lastValidatedAt ?? card.capturedAt, now))
    .filter((age): age is number => age !== null);

  const oldestValidationAgeDays =
    validationAges.length > 0 ? Math.max(...validationAges) : null;

  const lastReviewRecencyDays = daysSince(narrative.computedAt, now);

  let freshnessScore = 1;
  if (citations.length === 0) {
    freshnessScore = 0.35;
  } else {
    const healthyRatio =
      narrative.citationHealthSummary.healthy / Math.max(1, narrative.citationHealthSummary.total);
    freshnessScore = Number(
      Math.max(
        0,
        Math.min(
          1,
          healthyRatio * 0.6 +
            (1 - staleCitationCount / citations.length) * 0.25 +
            (1 - needsAttentionCitationCount / citations.length) * 0.15,
        ),
      ).toFixed(2),
    );
  }

  if (oldestValidationAgeDays !== null && oldestValidationAgeDays > 180) {
    freshnessScore = Math.max(0, Number((freshnessScore - 0.15).toFixed(2)));
  }

  const signal =
    staleCitationCount > 0
      ? `${staleCitationCount} stale citation(s); oldest validation ${oldestValidationAgeDays ?? "?"} day(s) ago.`
      : needsAttentionCitationCount > 0
        ? `${needsAttentionCitationCount} citation(s) need review before reuse-heavy deployment.`
        : "Citation set freshness within governed tolerance.";

  return {
    narrativeId,
    freshnessScore,
    staleCitationCount,
    needsAttentionCitationCount,
    oldestValidationAgeDays,
    lastReviewRecencyDays,
    signal,
  };
}

function resolveGeographicExposure(
  narrativeId: string,
  repoRoot: string,
): { exposureCount: number; riskCount: number; heatSummary: string } {
  const geographic = loadGeographicNarrativeIndex(repoRoot);
  const cells = geographic.counties.flatMap((county) =>
    county.narrativeStates.filter((cell) => cell.narrativeId === narrativeId),
  );

  const riskCount = cells.filter(
    (cell) =>
      cell.geographicSignal === "COUNTY_BLOCKED" ||
      cell.geographicSignal === "COUNTY_OVEREXPOSED" ||
      cell.geographicSignal === "COUNTY_WEAK",
  ).length;

  const heatSummary =
    cells.length === 0
      ? "No county overlay cells."
      : cells
          .slice(0, 3)
          .map((cell) => `${cell.countyName}: ${cell.geographicSignal.replaceAll("_", " ")}`)
          .join(" · ");

  return { exposureCount: cells.length, riskCount, heatSummary };
}

function buildUsageSignalText(
  entry: KimHammerNarrativeRegistryEntry,
  signal: KimHammerNarrativeUsageSignal,
  deploymentCount: number,
  freshness: KimHammerNarrativeFreshness,
  readinessBand: string,
  blockers: string[],
  countyHeatSummary: string,
): string {
  if (signal === "USAGE_OVEREXPOSED") {
    return `${entry.title} heavily reused (${deploymentCount} deployment(s)) with weakening evidence freshness (${(freshness.freshnessScore * 100).toFixed(0)}%) — review before next export.`;
  }
  if (signal === "USAGE_FRAGILE") {
    return `${entry.title} deployed ${deploymentCount} time(s) while readiness remains ${readinessBand} — ${blockers[0] ?? "dependency gaps remain"}.`;
  }
  if (signal === "USAGE_STALE") {
    return `${entry.title} reuses aging citation set (${freshness.staleCitationCount} stale) across ${deploymentCount} deployment(s).`;
  }
  if (signal === "USAGE_UNDERUTILIZED") {
    return `${entry.title} is ${readinessBand} but rarely deployed (${deploymentCount} event(s)) — operational capacity underused.`;
  }
  if (signal === "USAGE_RISING") {
    return `${entry.title} deployment frequency rising — last scope activity within recent export window.`;
  }
  if (signal === "USAGE_RECOVERING") {
    return `${entry.title} improving after blockers — retrieval work in progress; hold external reuse until citations clear.`;
  }
  if (signal === "USAGE_HEALTHY") {
    return `${entry.title} deployment within healthy bounds — ${countyHeatSummary || "no geographic stress signals"}.`;
  }
  return `${entry.title} usage signal ${signal}.`;
}

function resolveUsageSignal(
  narrative: NonNullable<ReturnType<typeof resolveKimHammerNarrativeState>>,
  deployment: KimHammerNarrativeDeploymentHistory,
  freshness: KimHammerNarrativeFreshness,
  geographicRiskCount: number,
  pendingSuggestions: number,
): KimHammerNarrativeUsageSignal {
  const deploymentCount = deployment.deploymentCount;
  const lastDeployedDays = daysSince(deployment.lastDeployedAt);
  const hasCitationBlockers = narrative.blockers.some(
    (row) =>
      row.startsWith("CITATION_BLOCKED:") ||
      row.startsWith("CITATION_STALE:") ||
      row.includes("NEEDS_REVIEW"),
  );

  if (
    deploymentCount >= 1 &&
    (narrative.readinessBand === "BLOCKED" ||
      narrative.readinessBand === "WEAK" ||
      hasCitationBlockers)
  ) {
    return "USAGE_FRAGILE";
  }

  if (
    deploymentCount >= 1 &&
    (freshness.staleCitationCount > 0 ||
      freshness.freshnessScore < 0.55 ||
      (deploymentCount >= 1 && freshness.needsAttentionCitationCount > 0 && lastDeployedDays !== null && lastDeployedDays <= 30))
  ) {
    return "USAGE_STALE";
  }

  if (
    deploymentCount >= 2 ||
    (deploymentCount >= 1 && geographicRiskCount >= 2 && narrative.readinessBand !== "STRONG")
  ) {
    return "USAGE_OVEREXPOSED";
  }

  if (
    deploymentCount >= 1 &&
    lastDeployedDays !== null &&
    lastDeployedDays <= 14 &&
    narrative.readinessBand !== "BLOCKED"
  ) {
    return "USAGE_RISING";
  }

  if (
    (narrative.readinessBand === "STRONG" || narrative.readinessBand === "MODERATE") &&
    deploymentCount === 0 &&
    narrative.claimReviewSummary.exportReady >= 1
  ) {
    return "USAGE_UNDERUTILIZED";
  }

  if (
    (narrative.readinessBand === "WEAK" || narrative.readinessBand === "MODERATE") &&
    narrative.taskSummary.inProgress > 0 &&
    !narrative.blockers.some((row) => row.startsWith("CITATION_BLOCKED:"))
  ) {
    return "USAGE_RECOVERING";
  }

  if (deploymentCount === 0 && pendingSuggestions >= 2 && narrative.readinessBand === "WEAK") {
    return "USAGE_UNDERUTILIZED";
  }

  return "USAGE_HEALTHY";
}

function resolveDeploymentTrend(
  deployment: KimHammerNarrativeDeploymentHistory,
): KimHammerNarrativeUsageAnalyticsRecord["deploymentTrend"] {
  if (deployment.deploymentCount === 0) return "NONE";
  if (deployment.deploymentCount === 1) {
    const days = daysSince(deployment.lastDeployedAt);
    return days !== null && days <= 21 ? "RISING" : "FLAT";
  }
  const sorted = [...deployment.events].sort((a, b) => a.exportedAt.localeCompare(b.exportedAt));
  const midpoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midpoint).length;
  const secondHalf = sorted.slice(midpoint).length;
  if (secondHalf > firstHalf) return "RISING";
  if (secondHalf < firstHalf) return "FALLING";
  return "FLAT";
}

export function computeNarrativeFatigue(
  narrativeId: string,
  repoRoot: string = process.cwd(),
): KimHammerNarrativeFatigueRecord | undefined {
  const registry = loadKimHammerNarrativeRegistry(repoRoot);
  const entry = registry.narratives.find((row) => row.narrativeId === narrativeId);
  const narrative = resolveKimHammerNarrativeState(narrativeId, repoRoot);
  if (!entry || !narrative) return undefined;

  const deployment = resolveNarrativeDeploymentHistory(narrativeId, repoRoot);
  const freshness = computeNarrativeFreshness(narrativeId, repoRoot);
  const geographic = resolveGeographicExposure(narrativeId, repoRoot);
  const sandbox = loadKimHammerAiSuggestionSandbox(repoRoot);
  const pendingSuggestions = sandbox.suggestions.filter(
    (row) => row.status === "PENDING" && row.relatedNarrativeIds?.includes(narrativeId),
  ).length;

  const usageSignal = resolveUsageSignal(
    narrative,
    deployment,
    freshness,
    geographic.riskCount,
    pendingSuggestions,
  );

  const exportLineageRefs = deployment.events.map(
    (event) => `${event.exportId} (${event.scope}${event.countyId ? ` · ${event.countyId}` : ""})`,
  );

  return {
    narrativeId,
    narrativeTitle: entry.title,
    usageSignal,
    signal: buildUsageSignalText(
      entry,
      usageSignal,
      deployment.deploymentCount,
      freshness,
      narrative.readinessBand,
      narrative.blockers,
      geographic.heatSummary,
    ),
    deploymentCount: deployment.deploymentCount,
    freshnessScore: freshness.freshnessScore,
    readinessBand: narrative.readinessBand,
    readinessScore: narrative.readinessScore,
    geographicExposureCount: geographic.exposureCount,
    geographicRiskCount: geographic.riskCount,
    aiSuggestionPressure: pendingSuggestions,
    blockers: narrative.blockers,
    countyHeatSummary: geographic.heatSummary,
    exportLineageRefs,
    computedAt: new Date().toISOString(),
  };
}

export function computeNarrativeUsageAnalytics(
  repoRoot: string = process.cwd(),
): KimHammerNarrativeUsageAnalyticsIndex {
  const registry = loadKimHammerNarrativeRegistry(repoRoot);
  const history = loadKimHammerExportHistory(repoRoot);

  const narratives: KimHammerNarrativeUsageAnalyticsRecord[] = registry.narratives
    .map((entry) => {
      const fatigue = computeNarrativeFatigue(entry.narrativeId, repoRoot);
      if (!fatigue) return undefined;
      return {
        ...fatigue,
        deploymentHistory: resolveNarrativeDeploymentHistory(entry.narrativeId, repoRoot),
        freshness: computeNarrativeFreshness(entry.narrativeId, repoRoot),
        deploymentTrend: resolveDeploymentTrend(
          resolveNarrativeDeploymentHistory(entry.narrativeId, repoRoot),
        ),
      };
    })
    .filter((row): row is KimHammerNarrativeUsageAnalyticsRecord => Boolean(row))
    .sort((a, b) => b.deploymentCount - a.deploymentCount || a.readinessScore - b.readinessScore);

  const signalCounts: Record<KimHammerNarrativeUsageSignal, number> = {
    USAGE_HEALTHY: 0,
    USAGE_RISING: 0,
    USAGE_OVEREXPOSED: 0,
    USAGE_STALE: 0,
    USAGE_UNDERUTILIZED: 0,
    USAGE_FRAGILE: 0,
    USAGE_RECOVERING: 0,
  };

  for (const row of narratives) {
    signalCounts[row.usageSignal] += 1;
  }

  const fatiguePriority: KimHammerNarrativeUsageSignal[] = [
    "USAGE_FRAGILE",
    "USAGE_OVEREXPOSED",
    "USAGE_STALE",
    "USAGE_RISING",
    "USAGE_RECOVERING",
    "USAGE_UNDERUTILIZED",
    "USAGE_HEALTHY",
  ];

  const topFatigueWarnings = narratives
    .filter((row) => row.usageSignal !== "USAGE_HEALTHY" && row.usageSignal !== "USAGE_UNDERUTILIZED")
    .sort(
      (a, b) =>
        fatiguePriority.indexOf(a.usageSignal) - fatiguePriority.indexOf(b.usageSignal) ||
        b.deploymentCount - a.deploymentCount,
    )
    .slice(0, 5)
    .map((row) => ({
      narrativeId: row.narrativeId,
      narrativeTitle: row.narrativeTitle,
      signal: row.signal,
    }));

  const underutilizedAlerts = narratives
    .filter((row) => row.usageSignal === "USAGE_UNDERUTILIZED")
    .slice(0, 5)
    .map((row) => ({
      narrativeId: row.narrativeId,
      narrativeTitle: row.narrativeTitle,
      signal: row.signal,
    }));

  const deploymentTimeline = [...history.entries]
    .sort((a, b) => b.exportedAt.localeCompare(a.exportedAt))
    .map((entry) => ({
      exportedAt: entry.exportedAt,
      exportId: entry.exportId,
      narrativeIds: entry.narrativeIds,
      scope: entry.scope,
    }));

  const syncSummary = summarizeSynchronizationReadiness(repoRoot);

  return {
    generatedAt: new Date().toISOString(),
    narrativeCount: narratives.length,
    signalCounts,
    totalDeployments: history.entries.length,
    narratives,
    topFatigueWarnings,
    underutilizedAlerts,
    deploymentTimeline,
    synchronizationReadinessSummary: syncSummary,
  };
}

function summarizeSynchronizationReadiness(
  repoRoot: string,
): KimHammerNarrativeUsageAnalyticsIndex["synchronizationReadinessSummary"] {
  const mapPath = path.join(repoRoot, CAMPAIGN_INTELLIGENCE_SYSTEM_MAP_REL);
  if (!existsSync(mapPath)) {
    return {
      mappedSourceCount: 0,
      integratedSourceCount: 0,
      plannedSourceCount: 0,
      readinessLabel: "Source map not initialized",
    };
  }

  const content = readFileSync(mapPath, "utf8");
  const mappedSourceCount = (content.match(/^### /gm) ?? []).length;
  const integratedSourceCount = (content.match(/- \*\*Integration status:\*\* \*\*LIVE\*\*/g) ?? []).length;
  const plannedSourceCount = (content.match(/- \*\*Integration status:\*\* \*\*PLANNED\*\*/g) ?? []).length;

  return {
    mappedSourceCount,
    integratedSourceCount,
    plannedSourceCount,
    readinessLabel:
      integratedSourceCount >= 8
        ? "Kim Hammer corpus integrated — cross-system sync planning active"
        : "Partial integration — synchronization architecture documented",
  };
}

export function summarizeNarrativeUsageRisk(
  repoRoot?: string,
): {
  narrativeCount: number;
  fragileCount: number;
  overexposedCount: number;
  underutilizedCount: number;
  topFatigueWarnings: KimHammerNarrativeUsageAnalyticsIndex["topFatigueWarnings"];
  underutilizedAlerts: KimHammerNarrativeUsageAnalyticsIndex["underutilizedAlerts"];
  synchronizationReadinessSummary: KimHammerNarrativeUsageAnalyticsIndex["synchronizationReadinessSummary"];
} {
  const index = computeNarrativeUsageAnalytics(repoRoot);
  return {
    narrativeCount: index.narrativeCount,
    fragileCount: index.signalCounts.USAGE_FRAGILE,
    overexposedCount: index.signalCounts.USAGE_OVEREXPOSED + index.signalCounts.USAGE_STALE,
    underutilizedCount: index.signalCounts.USAGE_UNDERUTILIZED,
    topFatigueWarnings: index.topFatigueWarnings.slice(0, 3),
    underutilizedAlerts: index.underutilizedAlerts.slice(0, 3),
    synchronizationReadinessSummary: index.synchronizationReadinessSummary,
  };
}

export function filterNarrativeUsageAnalytics(
  index: KimHammerNarrativeUsageAnalyticsIndex,
  filters: {
    signal?: KimHammerNarrativeUsageSignal | "ALL";
    narrativeQuery?: string;
  },
): KimHammerNarrativeUsageAnalyticsRecord[] {
  const narrativeQuery = filters.narrativeQuery?.trim().toLowerCase() ?? "";
  const signal = filters.signal ?? "ALL";

  return index.narratives.filter((row) => {
    if (signal !== "ALL" && row.usageSignal !== signal) return false;
    if (narrativeQuery) {
      const haystack = `${row.narrativeId} ${row.narrativeTitle} ${row.signal}`.toLowerCase();
      if (!haystack.includes(narrativeQuery)) return false;
    }
    return true;
  });
}
