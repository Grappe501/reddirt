import { randomUUID } from "node:crypto";
import {
  appendInstitutionalMemoryAudit,
  loadDecisionLedger,
  loadLessonsLearnedRegistry,
  loadRecommendationLedger,
  loadWeeklyReflections,
  saveDecisionLedger,
  saveLessonsLearnedRegistry,
  saveRecommendationLedger,
  saveWeeklyReflections,
} from "@/lib/intelligence/institutionalMemory/institutionalMemoryStore";
import {
  confidenceAdjustmentFromDisposition,
  formatConfidenceAdjustment,
} from "@/lib/intelligence/institutionalMemory/recommendationConfidenceFramework";
import type {
  DecisionCategory,
  DecisionResultStatus,
  LessonKind,
  RecommendationDisposition,
} from "@/lib/intelligence/institutionalMemory/types";

const GOVERNANCE = [
  "INTERNAL_USE_ONLY",
  "NON_PUBLISHABLE",
  "HUMAN_REVIEW_REQUIRED",
];

export type MemoryMutationResult =
  | { ok: true; entityId: string }
  | { ok: false; error: string };

export function createDecisionEntry(
  input: {
    operator: string;
    changedByRoute: string;
    title: string;
    decisionDate: string;
    category: DecisionCategory;
    summary: string;
    reasoning: string;
    expectedOutcome: string;
    actualOutcome?: string;
    resultStatus?: DecisionResultStatus;
    lessonLearned?: string;
    confidenceImpact?: string;
    notes?: string;
  },
  repoRoot: string = process.cwd(),
): MemoryMutationResult {
  if (!input.title.trim()) return { ok: false, error: "Title required." };
  const file = loadDecisionLedger(repoRoot);
  const now = new Date().toISOString();
  const decisionId = `dec-${randomUUID().slice(0, 8)}`;
  file.entries.push({
    decisionId,
    title: input.title.trim(),
    decisionDate: input.decisionDate || now.slice(0, 10),
    category: input.category,
    summary: input.summary.trim(),
    reasoning: input.reasoning.trim(),
    expectedOutcome: input.expectedOutcome.trim(),
    actualOutcome: input.actualOutcome?.trim() ?? "",
    resultStatus: input.resultStatus ?? "Unknown",
    lessonLearned: input.lessonLearned?.trim() ?? "",
    confidenceImpact: input.confidenceImpact?.trim() ?? "",
    notes: input.notes?.trim() ?? "",
    createdAt: now,
    updatedAt: now,
    createdBy: input.operator,
    governanceLabels: GOVERNANCE,
  });
  saveDecisionLedger(repoRoot, file);
  appendInstitutionalMemoryAudit(repoRoot, {
    entityType: "decision",
    entityId: decisionId,
    eventType: "CREATED",
    operator: input.operator,
    changedByRoute: input.changedByRoute,
  });
  return { ok: true, entityId: decisionId };
}

export function createLessonEntry(
  input: {
    operator: string;
    changedByRoute: string;
    kind: LessonKind;
    title: string;
    body: string;
    tags?: string;
  },
  repoRoot: string = process.cwd(),
): MemoryMutationResult {
  if (!input.title.trim() || !input.body.trim()) {
    return { ok: false, error: "Title and body required." };
  }
  const file = loadLessonsLearnedRegistry(repoRoot);
  const lessonId = `les-${randomUUID().slice(0, 8)}`;
  const tags = (input.tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  file.entries.push({
    lessonId,
    kind: input.kind,
    title: input.title.trim(),
    body: input.body.trim(),
    relatedDecisionIds: [],
    relatedRecommendationIds: [],
    tags,
    recordedAt: new Date().toISOString(),
    recordedBy: input.operator,
    governanceLabels: GOVERNANCE,
  });
  saveLessonsLearnedRegistry(repoRoot, file);
  appendInstitutionalMemoryAudit(repoRoot, {
    entityType: "lesson",
    entityId: lessonId,
    eventType: "CREATED",
    operator: input.operator,
    changedByRoute: input.changedByRoute,
  });
  return { ok: true, entityId: lessonId };
}

export function recordRecommendationDisposition(
  input: {
    recommendationId: string;
    operator: string;
    changedByRoute: string;
    disposition: RecommendationDisposition;
    result?: string;
    operatorNotes?: string;
  },
  repoRoot: string = process.cwd(),
): MemoryMutationResult {
  const file = loadRecommendationLedger(repoRoot);
  const row = file.entries.find((e) => e.recommendationId === input.recommendationId);
  if (!row) return { ok: false, error: "Recommendation not found." };
  const dir = confidenceAdjustmentFromDisposition(input.disposition, input.operatorNotes);
  row.disposition = input.disposition;
  row.result = input.result?.trim() ?? row.result;
  row.operatorNotes = input.operatorNotes?.trim() ?? row.operatorNotes;
  row.confidenceAdjustment = formatConfidenceAdjustment(dir);
  row.updatedAt = new Date().toISOString();
  saveRecommendationLedger(repoRoot, file);
  appendInstitutionalMemoryAudit(repoRoot, {
    entityType: "recommendation",
    entityId: input.recommendationId,
    eventType: "UPDATED",
    operator: input.operator,
    changedByRoute: input.changedByRoute,
  });
  return { ok: true, entityId: input.recommendationId };
}

export function createManualRecommendationEntry(
  input: {
    operator: string;
    changedByRoute: string;
    recommendation: string;
    sourceSystem: string;
    priority?: string;
  },
  repoRoot: string = process.cwd(),
): MemoryMutationResult {
  if (!input.recommendation.trim()) return { ok: false, error: "Recommendation text required." };
  const file = loadRecommendationLedger(repoRoot);
  const recommendationId = `rec-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  file.entries.push({
    recommendationId,
    recommendation: input.recommendation.trim(),
    sourceSystem: input.sourceSystem.trim() || "Manual operator entry",
    recommendedAt: now,
    priority: input.priority?.trim() || "MEDIUM",
    disposition: "Unknown",
    result: "",
    confidenceAdjustment: formatConfidenceAdjustment("UNKNOWN"),
    operatorNotes: "",
    createdAt: now,
    updatedAt: now,
    governanceLabels: GOVERNANCE,
  });
  saveRecommendationLedger(repoRoot, file);
  appendInstitutionalMemoryAudit(repoRoot, {
    entityType: "recommendation",
    entityId: recommendationId,
    eventType: "CREATED",
    operator: input.operator,
    changedByRoute: input.changedByRoute,
  });
  return { ok: true, entityId: recommendationId };
}

export function saveWeeklyReflectionEntry(
  input: {
    operator: string;
    changedByRoute: string;
    weekLabel: string;
    whatWorked: string;
    whatFailed: string;
    whatSurprised: string;
    whatToStop: string;
    whatToDoMore: string;
    whatWeAreLearning: string;
  },
  repoRoot: string = process.cwd(),
): MemoryMutationResult {
  const hasContent =
    input.whatWorked.trim() ||
    input.whatFailed.trim() ||
    input.whatSurprised.trim() ||
    input.whatToStop.trim() ||
    input.whatToDoMore.trim() ||
    input.whatWeAreLearning.trim();
  if (!hasContent) return { ok: false, error: "Enter at least one reflection field." };
  if (!input.weekLabel.trim()) return { ok: false, error: "Week label required (e.g. 2026-W22)." };

  const file = loadWeeklyReflections(repoRoot);
  const reflectionId = `wref-${randomUUID().slice(0, 8)}`;
  file.entries.push({
    reflectionId,
    weekLabel: input.weekLabel.trim(),
    recordedAt: new Date().toISOString(),
    recordedBy: input.operator,
    whatWorked: input.whatWorked.trim(),
    whatFailed: input.whatFailed.trim(),
    whatSurprised: input.whatSurprised.trim(),
    whatToStop: input.whatToStop.trim(),
    whatToDoMore: input.whatToDoMore.trim(),
    whatWeAreLearning: input.whatWeAreLearning.trim(),
    governanceLabels: [...GOVERNANCE, "NO_AUTO_PUBLISH", "NO_AUTO_SEND"],
  });
  saveWeeklyReflections(repoRoot, file);
  appendInstitutionalMemoryAudit(repoRoot, {
    entityType: "reflection",
    entityId: reflectionId,
    eventType: "CREATED",
    operator: input.operator,
    changedByRoute: input.changedByRoute,
  });
  return { ok: true, entityId: reflectionId };
}
