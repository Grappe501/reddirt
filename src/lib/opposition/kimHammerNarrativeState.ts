import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { loadKimHammerAiSuggestionSandbox } from "@/lib/opposition/kimHammerSuggestionSandbox";
import { loadKimHammerCitationLocker } from "@/lib/opposition/kimHammerCitationLocker";
import { loadKimHammerExportHistory } from "@/lib/opposition/kimHammerExportControl";
import { canExportClaim, loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import type { KimHammerIndexedClaim } from "@/lib/opposition/kimHammerEvidenceIndex";
import type { KimHammerRetrievalTask } from "@/lib/opposition/types/kimHammerEvidence";
import type {
  KimHammerNarrativeReadinessBand,
  KimHammerNarrativeRegistryEntry,
  KimHammerNarrativeRegistryFile,
  KimHammerNarrativeStateIndex,
  KimHammerNarrativeStateRecord,
} from "@/lib/opposition/types/kimHammerNarrativeState";
import type { KimHammerCitationCard } from "@/lib/opposition/types/kimHammerCitationLocker";
import type { KimHammerAiSuggestion } from "@/lib/opposition/types/kimHammerAiSuggestion";

export const KIM_HAMMER_NARRATIVE_REGISTRY_REL =
  "data/opposition/kim-hammer-profile/kim-hammer-narrative-registry.json";

function absPath(repoRoot: string, relPath: string): string {
  return path.join(repoRoot, relPath);
}

function readJsonFile<T>(repoRoot: string, relPath: string): T {
  return JSON.parse(readFileSync(absPath(repoRoot, relPath), "utf8")) as T;
}

export function loadKimHammerNarrativeRegistry(
  repoRoot: string = process.cwd(),
): KimHammerNarrativeRegistryFile {
  if (!existsSync(absPath(repoRoot, KIM_HAMMER_NARRATIVE_REGISTRY_REL))) {
    return {
      generatedAt: new Date().toISOString(),
      registryVersion: "1.0",
      purpose: "Narrative registry not yet initialized.",
      narratives: [],
    };
  }
  return readJsonFile<KimHammerNarrativeRegistryFile>(repoRoot, KIM_HAMMER_NARRATIVE_REGISTRY_REL);
}

function resolveReadinessBand(
  score: number,
  blockers: string[],
): KimHammerNarrativeReadinessBand {
  if (blockers.some((row) => row.startsWith("BLOCKED:") || row.startsWith("CITATION_BLOCKED:"))) {
    return "BLOCKED";
  }
  if (score >= 0.85) return "STRONG";
  if (score >= 0.65) return "MODERATE";
  if (score >= 0.45) return "WEAK";
  return "BLOCKED";
}

function resolveCitationsForNarrative(
  narrativeId: string,
  entry: KimHammerNarrativeRegistryEntry,
  locker: ReturnType<typeof loadKimHammerCitationLocker>,
): KimHammerCitationCard[] {
  const byNarrative = locker.citations.filter((card) =>
    card.linkedNarrativeIds?.includes(narrativeId),
  );
  const byClaim = new Map<string, KimHammerCitationCard>();
  for (const claimId of entry.linkedClaimIds) {
    for (const card of locker.citations) {
      const linkedViaCard = card.linkedClaimIds.includes(claimId);
      const linkedViaClaimLink = locker.claimLinks.some(
        (link) => link.claimId === claimId && link.citationId === card.id,
      );
      if (linkedViaCard || linkedViaClaimLink) {
        byClaim.set(card.id, card);
      }
    }
  }
  const merged = new Map<string, KimHammerCitationCard>();
  for (const card of [...byNarrative, ...byClaim.values()]) {
    merged.set(card.id, card);
  }
  return [...merged.values()];
}

function resolveSuggestionsForNarrative(
  narrativeId: string,
  sandbox: ReturnType<typeof loadKimHammerAiSuggestionSandbox>,
): KimHammerAiSuggestion[] {
  return sandbox.suggestions.filter((row) => row.relatedNarrativeIds?.includes(narrativeId));
}

function resolveExportUsage(
  narrativeId: string,
  repoRoot: string,
): { count: number; lastExportAt: string | null; lastExportScope: string | null } {
  const history = loadKimHammerExportHistory(repoRoot);
  const matching = history.entries.filter((entry) => entry.narrativeIds.includes(narrativeId));
  const sorted = [...matching].sort((a, b) => b.exportedAt.localeCompare(a.exportedAt));
  return {
    count: matching.length,
    lastExportAt: sorted[0]?.exportedAt ?? null,
    lastExportScope: sorted[0]?.scope ?? null,
  };
}

function resolveClaimsByIds(
  claimIds: string[],
  claims: KimHammerIndexedClaim[],
): KimHammerIndexedClaim[] {
  const idSet = new Set(claimIds);
  return claims.filter((claim) => idSet.has(claim.id));
}

function resolveTasksByIds(
  taskIds: string[],
  tasks: KimHammerRetrievalTask[],
): KimHammerRetrievalTask[] {
  const idSet = new Set(taskIds);
  return tasks.filter((task) => idSet.has(task.id));
}

function buildSignal(
  narrativeId: string,
  band: KimHammerNarrativeReadinessBand,
  blockers: string[],
  exportUsageCount: number,
  exportReadyCount: number,
): string {
  if (blockers.length > 0) {
    return blockers[0] ?? `${narrativeId} has unresolved blockers.`;
  }
  if (band === "STRONG") {
    if (exportUsageCount > 0) {
      return `Strong — ${exportReadyCount} export-ready claim(s); used in ${exportUsageCount} governed export(s).`;
    }
    return `Strong — dependencies healthy; ${exportReadyCount} export-ready claim(s) available.`;
  }
  if (band === "MODERATE") {
    return `Moderate — usable internally with caution; verify citations before external promotion.`;
  }
  return `Weak — multiple dependency gaps; not recommended for external messaging.`;
}

export function computeKimHammerNarrativeState(
  entry: KimHammerNarrativeRegistryEntry,
  repoRoot: string = process.cwd(),
): KimHammerNarrativeStateRecord {
  const index = loadKimHammerEvidenceIndex(repoRoot);
  const locker = loadKimHammerCitationLocker(repoRoot);
  const sandbox = loadKimHammerAiSuggestionSandbox(repoRoot);
  const computedAt = new Date().toISOString();

  const linkedClaims = resolveClaimsByIds(entry.linkedClaimIds, index.claims);
  const linkedCitations = resolveCitationsForNarrative(entry.narrativeId, entry, locker);
  const linkedTasks = resolveTasksByIds(entry.linkedTaskIds, index.retrievalTasks);
  const linkedSuggestions = resolveSuggestionsForNarrative(entry.narrativeId, sandbox);
  const pendingSuggestions = linkedSuggestions.filter((row) => row.status === "PENDING");
  const exportUsage = resolveExportUsage(entry.narrativeId, repoRoot);

  let score = 0.72;
  const blockers: string[] = [];

  const citationHealthSummary = {
    total: linkedCitations.length,
    healthy: 0,
    needsAttention: 0,
    stale: 0,
  };

  for (const citation of linkedCitations) {
    if (citation.sourceHealth === "HEALTHY" && citation.reviewStatus === "VERIFIED") {
      citationHealthSummary.healthy += 1;
      score += 0.04;
    } else if (
      citation.reviewStatus === "NEEDS_REVIEW" ||
      citation.reviewStatus === "DRAFT" ||
      citation.sourceHealth === "NEEDS_REVALIDATION"
    ) {
      citationHealthSummary.needsAttention += 1;
      score -= 0.14;
      blockers.push(
        `CITATION_BLOCKED: ${citation.id} is ${citation.reviewStatus} — verify before promoting ${entry.title}.`,
      );
    } else if (citation.sourceHealth === "STALE" || citation.sourceHealth === "ARCHIVE_MISSING") {
      citationHealthSummary.stale += 1;
      score -= 0.05;
      if (citation.reviewStatus === "VERIFIED") {
        blockers.push(
          `CITATION_STALE: ${citation.id} source health ${citation.sourceHealth.replaceAll("_", " ")} — capture archive before heavy reliance.`,
        );
      }
    }
  }

  const claimReviewSummary = {
    total: linkedClaims.length,
    exportReady: 0,
    needsReview: 0,
    blocked: 0,
    partialCitation: 0,
  };

  for (const claim of linkedClaims) {
    if (canExportClaim(claim)) {
      claimReviewSummary.exportReady += 1;
      score += 0.06;
    }
    if (claim.reviewStatus === "BLOCKED") {
      claimReviewSummary.blocked += 1;
      score -= 0.22;
      blockers.push(`BLOCKED: claim ${claim.id} is publication-blocked.`);
    } else if (claim.reviewStatus === "NEEDS_REVIEW") {
      claimReviewSummary.needsReview += 1;
      score -= 0.1;
      blockers.push(`REVIEW: claim ${claim.id} remains NEEDS_REVIEW.`);
    }
    if (claim.citationStatus === "PARTIAL") {
      claimReviewSummary.partialCitation += 1;
      score -= 0.08;
      blockers.push(`PARTIAL: claim ${claim.id} has partial citation coverage.`);
    }
  }

  if (
    linkedClaims.length > 0 &&
    claimReviewSummary.exportReady === linkedClaims.length &&
    !linkedCitations.some(
      (citation) =>
        citation.reviewStatus === "NEEDS_REVIEW" ||
        citation.reviewStatus === "DRAFT" ||
        citation.reviewStatus === "STALE",
    )
  ) {
    score = Math.max(score, 0.88);
  }

  const taskSummary = {
    total: linkedTasks.length,
    complete: 0,
    inProgress: 0,
    blocked: 0,
    notStarted: 0,
  };

  for (const task of linkedTasks) {
    const status = task.taskStatus ?? "NOT_STARTED";
    if (status === "COMPLETE") {
      taskSummary.complete += 1;
      score += 0.04;
    } else if (status === "IN_PROGRESS" || status === "ASSIGNED" || status === "READY_FOR_REVIEW") {
      taskSummary.inProgress += 1;
      score -= 0.03;
    } else if (status === "BLOCKED") {
      taskSummary.blocked += 1;
      score -= 0.1;
      blockers.push(`TASK_BLOCKED: retrieval task ${task.id} is blocked.`);
    } else {
      taskSummary.notStarted += 1;
      score -= 0.05;
    }
  }

  if (pendingSuggestions.length > 0) {
    score -= Math.min(0.15, pendingSuggestions.length * 0.05);
    blockers.push(
      `AI_PRESSURE: ${pendingSuggestions.length} pending suggestion(s) flagged for ${entry.narrativeId}.`,
    );
  }

  if (exportUsage.count > 0 && blockers.length === 0) {
    score += 0.03;
  }

  score = Math.max(0, Math.min(1, Number(score.toFixed(2))));
  const readinessBand = resolveReadinessBand(score, blockers);
  const uniqueBlockers = [...new Set(blockers)];

  return {
    narrativeId: entry.narrativeId,
    title: entry.title,
    narrativeClass: entry.narrativeClass,
    description: entry.description,
    readinessScore: score,
    readinessBand,
    signal: buildSignal(
      entry.narrativeId,
      readinessBand,
      uniqueBlockers,
      exportUsage.count,
      claimReviewSummary.exportReady,
    ),
    blockers: uniqueBlockers,
    linkedClaimIds: entry.linkedClaimIds,
    linkedCitationIds: linkedCitations.map((row) => row.id),
    linkedTaskIds: entry.linkedTaskIds,
    linkedSuggestionIds: linkedSuggestions.map((row) => row.id),
    exportUsageCount: exportUsage.count,
    lastExportAt: exportUsage.lastExportAt,
    lastExportScope: exportUsage.lastExportScope,
    citationHealthSummary,
    claimReviewSummary,
    taskSummary,
    pendingSuggestionCount: pendingSuggestions.length,
    adminHref: entry.adminHref,
    computedAt,
  };
}

export function loadKimHammerNarrativeStateIndex(
  repoRoot: string = process.cwd(),
): KimHammerNarrativeStateIndex {
  const registry = loadKimHammerNarrativeRegistry(repoRoot);
  const narratives = registry.narratives.map((entry) =>
    computeKimHammerNarrativeState(entry, repoRoot),
  );

  const bandCounts: Record<KimHammerNarrativeReadinessBand, number> = {
    STRONG: 0,
    MODERATE: 0,
    WEAK: 0,
    BLOCKED: 0,
  };

  for (const row of narratives) {
    bandCounts[row.readinessBand] += 1;
  }

  return {
    generatedAt: new Date().toISOString(),
    narrativeCount: narratives.length,
    bandCounts,
    narratives: narratives.sort((a, b) => a.readinessScore - b.readinessScore),
  };
}

export function resolveKimHammerNarrativeState(
  narrativeId: string,
  repoRoot?: string,
): KimHammerNarrativeStateRecord | undefined {
  const registry = loadKimHammerNarrativeRegistry(repoRoot);
  const entry = registry.narratives.find((row) => row.narrativeId === narrativeId);
  if (!entry) return undefined;
  return computeKimHammerNarrativeState(entry, repoRoot);
}

export function filterKimHammerNarrativeStates(
  index: KimHammerNarrativeStateIndex,
  filters: {
    band?: KimHammerNarrativeReadinessBand | "ALL";
    narrativeClass?: string;
    subjectQuery?: string;
  },
): KimHammerNarrativeStateRecord[] {
  const band = filters.band ?? "ALL";
  const narrativeClass = filters.narrativeClass?.trim() ?? "";
  const subjectQuery = filters.subjectQuery?.trim().toLowerCase() ?? "";

  return index.narratives.filter((row) => {
    if (band !== "ALL" && row.readinessBand !== band) return false;
    if (narrativeClass && row.narrativeClass !== narrativeClass) return false;
    if (subjectQuery) {
      const haystack = [
        row.narrativeId,
        row.title,
        row.description,
        row.signal,
        ...row.blockers,
        ...row.linkedClaimIds,
        ...row.linkedCitationIds,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(subjectQuery)) return false;
    }
    return true;
  });
}
