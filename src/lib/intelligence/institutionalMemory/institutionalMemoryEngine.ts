import { loadHumanActionQueue } from "@/lib/intelligence/strategicDecisionSupport";
import type { HumanActionQueueItem } from "@/lib/intelligence/types/humanActionQueue";
import {
  confidenceAdjustmentFromDisposition,
  formatConfidenceAdjustment,
} from "@/lib/intelligence/institutionalMemory/recommendationConfidenceFramework";
import {
  loadDecisionLedger,
  loadLessonsLearnedRegistry,
  loadRecommendationLedger,
  loadWeeklyReflections,
  saveRecommendationLedger,
} from "@/lib/intelligence/institutionalMemory/institutionalMemoryStore";
import type {
  DecisionLedgerEntry,
  InstitutionalMemorySummary,
  LessonLearnedEntry,
  RecommendationLedgerEntry,
} from "@/lib/intelligence/institutionalMemory/types";

function sortByDateDesc<T extends { recordedAt?: string; updatedAt?: string; decisionDate?: string; recommendedAt?: string }>(
  items: T[],
  field: keyof T,
): T[] {
  return [...items].sort((a, b) => {
    const av = String(a[field] ?? "");
    const bv = String(b[field] ?? "");
    return bv.localeCompare(av);
  });
}

function daysBetween(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

function computeMemoryHealth(
  decisions: number,
  recommendations: number,
  lessons: number,
  reflections: number,
): { score: number; detail: string } {
  const captureScore = Math.min(100, decisions * 8 + recommendations * 4 + lessons * 10 + reflections * 12);
  const score = Math.max(15, Math.min(100, captureScore));
  const detail =
    decisions + recommendations + lessons + reflections === 0
      ? "Memory empty — begin recording decisions and lessons to build institutional knowledge."
      : `${decisions} decisions · ${recommendations} recommendations · ${lessons} lessons · ${reflections} reflections on file.`;
  return { score, detail };
}

function deriveTopPatterns(lessons: LessonLearnedEntry[], decisions: DecisionLedgerEntry[]): string[] {
  const tagCounts = new Map<string, number>();
  for (const lesson of lessons) {
    for (const tag of lesson.tags) {
      const key = tag.trim().toLowerCase();
      if (!key) continue;
      tagCounts.set(key, (tagCounts.get(key) ?? 0) + 1);
    }
  }
  const statusCounts = new Map<string, number>();
  for (const d of decisions) {
    statusCounts.set(d.resultStatus, (statusCounts.get(d.resultStatus) ?? 0) + 1);
  }

  const patterns: string[] = [];
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  for (const [tag, count] of topTags) {
    patterns.push(`Tag "${tag}" appears in ${count} lesson(s).`);
  }
  for (const [status, count] of statusCounts.entries()) {
    if (count >= 2) patterns.push(`${count} decisions recorded as ${status}.`);
  }
  const kindCounts = new Map<string, number>();
  for (const l of lessons) {
    kindCounts.set(l.kind, (kindCounts.get(l.kind) ?? 0) + 1);
  }
  const topKind = [...kindCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (topKind && topKind[1] >= 2) {
    patterns.push(`Most common lesson type: ${topKind[0]} (${topKind[1]} entries).`);
  }
  return patterns.slice(0, 6);
}

function deriveEmergingLessons(lessons: LessonLearnedEntry[]): string[] {
  return sortByDateDesc(lessons, "recordedAt")
    .filter((l) => l.kind === "lesson" || l.kind === "warning" || l.kind === "pattern")
    .slice(0, 5)
    .map((l) => `${l.title}: ${l.body.slice(0, 120)}${l.body.length > 120 ? "…" : ""}`);
}

function deriveInstitutionalKnowledge(
  lessons: LessonLearnedEntry[],
  decisions: DecisionLedgerEntry[],
): string[] {
  const wisdom = lessons
    .filter((l) => l.kind === "campaign_wisdom" || l.kind === "best_practice")
    .slice(0, 4)
    .map((l) => l.title);
  const decisionLessons = decisions
    .filter((d) => d.lessonLearned.trim().length > 10)
    .slice(0, 3)
    .map((d) => `${d.title}: ${d.lessonLearned.slice(0, 100)}`);
  return [...wisdom, ...decisionLessons].slice(0, 7);
}

/** Deterministic summary for dashboards and command center. */
export function summarizeInstitutionalMemory(repoRoot?: string): InstitutionalMemorySummary {
  const root = repoRoot ?? process.cwd();
  const decisions = loadDecisionLedger(root);
  const recommendations = loadRecommendationLedger(root);
  const lessons = loadLessonsLearnedRegistry(root);
  const reflections = loadWeeklyReflections(root);

  const recentDecisions = sortByDateDesc(decisions.entries, "decisionDate").slice(0, 5);
  const recentLessons = sortByDateDesc(lessons.entries, "recordedAt").slice(0, 5);
  const recentRecommendations = sortByDateDesc(recommendations.entries, "recommendedAt").slice(0, 5);

  const lastReflection = sortByDateDesc(reflections.entries, "recordedAt")[0];
  const health = computeMemoryHealth(
    decisions.entries.length,
    recommendations.entries.length,
    lessons.entries.length,
    reflections.entries.length,
  );

  return {
    decisionCount: decisions.entries.length,
    recommendationCount: recommendations.entries.length,
    lessonCount: lessons.entries.length,
    reflectionCount: reflections.entries.length,
    recentDecisions,
    recentLessons,
    recentRecommendations,
    topPatterns: deriveTopPatterns(lessons.entries, decisions.entries),
    emergingLessons: deriveEmergingLessons(lessons.entries),
    institutionalKnowledge: deriveInstitutionalKnowledge(lessons.entries, decisions.entries),
    memoryHealthScore: health.score,
    memoryHealthDetail: health.detail,
    weeklyReflectionStatus: {
      lastReflectionAt: lastReflection?.recordedAt ?? null,
      lastWeekLabel: lastReflection?.weekLabel ?? null,
      daysSinceLastReflection: daysBetween(lastReflection?.recordedAt ?? null),
      reflectionCount: reflections.entries.length,
    },
  };
}

/** Append NSI-15 queue items not yet present in recommendation ledger (capture-only). */
export function syncRecommendationLedgerFromActionQueue(repoRoot?: string): {
  appended: number;
  total: number;
} {
  const root = repoRoot ?? process.cwd();
  const ledger = loadRecommendationLedger(root);
  const queue = loadHumanActionQueue(root);
  const existingActionIds = new Set(
    ledger.entries.map((e) => e.linkedActionId).filter((id): id is string => Boolean(id)),
  );

  const active = queue.items.filter(
    (row: HumanActionQueueItem) => row.status !== "ARCHIVED" && row.status !== "DISMISSED",
  );

  let appended = 0;
  for (const action of active) {
    if (existingActionIds.has(action.actionId)) continue;
    const disposition = mapQueueStatusToDisposition(action.status);
    const confidenceDir = confidenceAdjustmentFromDisposition(disposition);
    const entry: RecommendationLedgerEntry = {
      recommendationId: `rec-${action.actionId}`,
      recommendation: action.title,
      sourceSystem: action.sourceSystems.join(", ") || "NSI-15 Human Action Queue",
      recommendedAt: action.createdAt ?? new Date().toISOString(),
      priority: action.priority,
      disposition,
      result: action.status,
      confidenceAdjustment: formatConfidenceAdjustment(confidenceDir),
      operatorNotes: "",
      linkedActionId: action.actionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      governanceLabels: ["INTERNAL_USE_ONLY", "NON_PUBLISHABLE", "CAPTURED_FROM_QUEUE"],
    };
    ledger.entries.push(entry);
    existingActionIds.add(action.actionId);
    appended += 1;
  }

  if (appended > 0) saveRecommendationLedger(root, ledger);
  return { appended, total: ledger.entries.length };
}

function mapQueueStatusToDisposition(
  status: HumanActionQueueItem["status"],
): RecommendationLedgerEntry["disposition"] {
  if (status === "IN_PROGRESS" || status === "COMPLETED" || status === "ACCEPTED") return "Accepted";
  if (status === "DISMISSED") return "Rejected";
  if (status === "BLOCKED") return "Deferred";
  if (status === "RECOMMENDED") return "Unknown";
  return "Unknown";
}
