import type { ComplianceReconciliationMatch, ComplianceReconciliationStatus } from "./reconciliation-workbench-types";

export function canLockReconciliationMatch(match: ComplianceReconciliationMatch): { ok: boolean; reason?: string } {
  if (match.status === "locked") return { ok: false, reason: "Already locked." };
  if (match.status !== "approved" && match.status !== "force_matched" && match.status !== "variance_review") {
    return { ok: false, reason: "Match must be approved or in variance review before locking." };
  }
  if (!match.reviewerInitials?.trim()) return { ok: false, reason: "Reviewer initials required before lock." };
  return { ok: true };
}

export function canUnlockReconciliationMatch(match: ComplianceReconciliationMatch, reason?: string): { ok: boolean; reason?: string } {
  if (match.status !== "locked") return { ok: false, reason: "Match is not locked." };
  if (!reason?.trim()) return { ok: false, reason: "Unlock reason required." };
  return { ok: true };
}

export function applyReconciliationLock(match: ComplianceReconciliationMatch, initials: string): ComplianceReconciliationMatch {
  const now = new Date().toISOString();
  return {
    ...match,
    status: "locked",
    reviewerInitials: initials.trim().toUpperCase(),
    lockedAt: now,
    updatedAt: now,
    humanReviewRequired: true,
  };
}

export function applyReconciliationUnlock(match: ComplianceReconciliationMatch, initials: string, reason: string, nextStatus: ComplianceReconciliationStatus = "approved"): ComplianceReconciliationMatch {
  const now = new Date().toISOString();
  return {
    ...match,
    status: nextStatus,
    reviewerInitials: initials.trim().toUpperCase(),
    lockedAt: undefined,
    notes: [match.notes, `Unlocked: ${reason}`].filter(Boolean).join("\n"),
    updatedAt: now,
    humanReviewRequired: true,
  };
}
