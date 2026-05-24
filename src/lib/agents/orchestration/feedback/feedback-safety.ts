/**
 * Safety checks for feedback and lesson approval writes.
 * These routes may only write feedback/approval records, never execute campaign actions.
 */

import { PROHIBITED_EXECUTION_TYPES } from "../tooling/agent-tool-safety";
import type {
  LessonApproval,
  RecommendationOutcome,
  RecommendationOutcomeStatus,
  LessonApprovalStatus,
} from "./orchestration-feedback-types";

const SECRET_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /bearer\s+[a-z0-9._-]+/i,
  /sk-[a-z0-9]/i,
  /ssn/i,
  /voter file row/i,
];

export const RECOMMENDATION_OUTCOME_STATUSES: RecommendationOutcomeStatus[] = [
  "proposed",
  "accepted",
  "rejected",
  "ignored",
  "completed",
  "failed",
  "needs_revision",
];

export const LESSON_APPROVAL_STATUSES: LessonApprovalStatus[] = [
  "suggested",
  "approved",
  "rejected",
  "archived",
  "expired",
  "needs_more_evidence",
];

export function containsUnsafeFeedbackText(value: unknown): boolean {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return SECRET_PATTERNS.some((p) => p.test(text));
}

export function validateRecommendationOutcomeInput(input: Partial<RecommendationOutcome>): string[] {
  const errors: string[] = [];
  if (!input.recommendationId) errors.push("recommendationId required");
  if (!input.recommendationTitle) errors.push("recommendationTitle required");
  if (!input.source) errors.push("source required");
  if (!input.domain) errors.push("domain required");
  if (!input.status || !RECOMMENDATION_OUTCOME_STATUSES.includes(input.status)) errors.push("invalid status");
  if (containsUnsafeFeedbackText(input)) errors.push("unsafe or secret-like feedback text");
  const combined = `${input.recommendationId ?? ""} ${input.recommendationTitle ?? ""} ${input.outcomeSummary ?? ""} ${input.humanFeedback ?? ""}`;
  for (const p of PROHIBITED_EXECUTION_TYPES) {
    if (combined.toLowerCase().includes(String(p).toLowerCase())) {
      errors.push(`prohibited execution reference: ${String(p)}`);
    }
  }
  return errors;
}

export function validateLessonApprovalInput(input: Partial<LessonApproval>): string[] {
  const errors: string[] = [];
  if (!input.lessonId) errors.push("lessonId required");
  if (!input.lessonTitle) errors.push("lessonTitle required");
  if (!input.lessonType) errors.push("lessonType required");
  if (!input.approvalStatus || !LESSON_APPROVAL_STATUSES.includes(input.approvalStatus)) errors.push("invalid approvalStatus");
  if (containsUnsafeFeedbackText(input)) errors.push("unsafe or secret-like lesson approval text");
  const wantsPromotion = input.promotedToCampaignMemory === true;
  const sensitive = input.sensitivity === "strategic" || input.sensitivity === "sensitive";
  if (wantsPromotion && input.approvalStatus !== "approved") {
    errors.push("memory promotion requires approved status");
  }
  if (wantsPromotion && sensitive && !input.reviewedBy) {
    errors.push("strategic/sensitive memory promotion requires reviewer");
  }
  return errors;
}

export function safeOutcomeNotes(status: RecommendationOutcomeStatus): string[] {
  return [
    "Feedback store write only",
    "No email/SMS/calendar/finance/export execution",
    status === "completed" || status === "failed" ? "Outcome should produce learning record" : "Human decision recorded",
  ];
}

export function safeLessonApprovalNotes(status: LessonApprovalStatus, promoted: boolean): string[] {
  return [
    "Lesson approval store write only",
    "No sensitive memory auto-store",
    promoted ? "Promoted only because human approved" : `Lesson marked ${status}`,
  ];
}
