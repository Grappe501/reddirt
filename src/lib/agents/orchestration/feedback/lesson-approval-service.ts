import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CampaignLesson } from "../knowledge/campaign-knowledge-types";
import type { LessonApproval, LessonApprovalStatus } from "./orchestration-feedback-types";
import { safeLessonApprovalNotes, validateLessonApprovalInput } from "./feedback-safety";

const REL = "data/campaign-events/orchestration-feedback/lesson-approvals.json";

type Store = {
  updatedAt: string;
  approvals: LessonApproval[];
};

function storePath(repoRoot?: string): string {
  return path.join(repoRoot ?? process.cwd(), REL);
}

function emptyStore(): Store {
  return { updatedAt: new Date().toISOString(), approvals: [] };
}

export function loadLessonApprovals(repoRoot?: string): LessonApproval[] {
  const p = storePath(repoRoot);
  if (!existsSync(p)) return [];
  try {
    const parsed = JSON.parse(readFileSync(p, "utf8")) as Partial<Store>;
    return Array.isArray(parsed.approvals) ? parsed.approvals : [];
  } catch {
    return [];
  }
}

function saveLessonApprovals(approvals: LessonApproval[], repoRoot?: string): void {
  const p = storePath(repoRoot);
  const dir = path.dirname(p);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(p, JSON.stringify({ updatedAt: new Date().toISOString(), approvals: approvals.slice(-500) }, null, 2), "utf8");
}

export function approvalFromLesson(lesson: CampaignLesson, status: LessonApprovalStatus = "suggested"): LessonApproval {
  const sensitivity: LessonApproval["sensitivity"] =
    lesson.type === "strategic_warning" || lesson.type === "strategic_opportunity" ? "strategic" : "internal";
  return {
    id: `la_${lesson.id}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 140),
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    lessonType: lesson.type,
    domains: lesson.domains,
    counties: lesson.counties,
    confidence: lesson.confidence,
    sensitivity,
    approvalStatus: status,
    expirationPolicy: lesson.expiresAt ? `Expires ${lesson.expiresAt}` : "Review if stale or contradicted",
    promotedToCampaignMemory: status === "approved",
    sourceObservationIds: lesson.sourceObservationIds,
    safetyNotes: safeLessonApprovalNotes(status, status === "approved"),
  };
}

export function recordLessonApproval(
  input: Omit<Partial<LessonApproval>, "id" | "safetyNotes"> & {
    id?: string;
    lessonId: string;
    lessonTitle: string;
    lessonType: LessonApproval["lessonType"];
    approvalStatus: LessonApprovalStatus;
    safetyNotes?: string[];
  },
  repoRoot?: string,
): LessonApproval {
  const promotedToCampaignMemory = input.promotedToCampaignMemory ?? input.approvalStatus === "approved";
  const candidate: LessonApproval = {
    id: input.id ?? `la_${input.lessonId}`.replace(/[^a-zA-Z0-9:_-]/g, "_").slice(0, 140),
    lessonId: input.lessonId,
    lessonTitle: input.lessonTitle,
    lessonType: input.lessonType,
    domains: input.domains ?? ["campaign_management"],
    counties: input.counties ?? [],
    confidence: input.confidence ?? "medium",
    sensitivity: input.sensitivity ?? "internal",
    approvalStatus: input.approvalStatus,
    reviewedBy: input.reviewedBy,
    reviewedAt: input.reviewedAt ?? (input.approvalStatus === "suggested" ? undefined : new Date().toISOString()),
    reviewerNotes: input.reviewerNotes,
    expirationPolicy: input.expirationPolicy,
    promotedToCampaignMemory,
    sourceObservationIds: input.sourceObservationIds ?? [],
    safetyNotes: [...safeLessonApprovalNotes(input.approvalStatus, promotedToCampaignMemory), ...(input.safetyNotes ?? [])],
  };
  const errors = validateLessonApprovalInput(candidate);
  if (errors.length) throw new Error(`Invalid lesson approval: ${errors.join("; ")}`);

  const existing = loadLessonApprovals(repoRoot);
  saveLessonApprovals([...existing.filter((a) => a.id !== candidate.id), candidate], repoRoot);
  return candidate;
}

export function seedLessonApprovalSuggestions(lessons: CampaignLesson[], repoRoot?: string): LessonApproval[] {
  const existing = loadLessonApprovals(repoRoot);
  const existingIds = new Set(existing.map((a) => a.lessonId));
  const suggestions = lessons
    .filter((l) => l.approvalStatus === "proposed")
    .slice(0, 20)
    .filter((l) => !existingIds.has(l.id))
    .map((l) => approvalFromLesson(l, "suggested"));
  if (suggestions.length) saveLessonApprovals([...existing, ...suggestions], repoRoot);
  return [...existing, ...suggestions];
}

export function listPendingLessonApprovals(repoRoot?: string): LessonApproval[] {
  return loadLessonApprovals(repoRoot).filter((a) => a.approvalStatus === "suggested" || a.approvalStatus === "needs_more_evidence");
}

export function listApprovedLessons(repoRoot?: string): LessonApproval[] {
  return loadLessonApprovals(repoRoot).filter((a) => a.approvalStatus === "approved");
}

export function ensureLessonApprovalStore(repoRoot?: string): void {
  const p = storePath(repoRoot);
  if (!existsSync(p)) {
    const dir = path.dirname(p);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(p, JSON.stringify(emptyStore(), null, 2), "utf8");
  }
}
