import { appendApprovalEvent } from "../approvals/approval-storage";
import { appendReconciliationAuditEvent } from "./reconciliation-audit";
import { applyReconciliationLock, applyReconciliationUnlock, canLockReconciliationMatch, canUnlockReconciliationMatch } from "./reconciliation-locks";
import { loadReconciliationMatches, upsertReconciliationMatch } from "./reconciliation-workbench-storage";
import type { ComplianceReconciliationMatch, ComplianceReconciliationStatus } from "./reconciliation-workbench-types";

export type ReconciliationActionInput = {
  matchId: string;
  actorInitials: string;
  note?: string;
  unlockReason?: string;
  varianceAmount?: number;
};

async function getOrCreateMatch(matchId: string): Promise<ComplianceReconciliationMatch | null> {
  const matches = await loadReconciliationMatches();
  return matches.find((item) => item.id === matchId) ?? null;
}

async function persistMatch(before: ComplianceReconciliationMatch | null, after: ComplianceReconciliationMatch, action: string, actorInitials: string, note?: string) {
  await upsertReconciliationMatch(after);
  await appendReconciliationAuditEvent({
    matchId: after.id,
    action,
    actorInitials,
    note,
    before: before ?? undefined,
    after,
  });
  if (action === "approve_match" || action === "lock_match") {
    await appendApprovalEvent({
      recordId: after.id,
      recordType: "reconciliation_match",
      stage: action === "lock_match" ? "reconciled" : "approved",
      role: "treasurer",
      actorInitials,
      note,
    });
  }
  return after;
}

export async function approveReconciliationMatch(input: ReconciliationActionInput) {
  const match = await getOrCreateMatch(input.matchId);
  if (!match) throw new Error("Match not found");
  const next = { ...match, status: "approved" as const, reviewerInitials: input.actorInitials, approvedAt: new Date().toISOString() };
  return persistMatch(match, next, "approve_match", input.actorInitials, input.note);
}

export async function forceReconciliationMatch(input: ReconciliationActionInput) {
  const match = await getOrCreateMatch(input.matchId);
  if (!match) throw new Error("Match not found");
  const next = { ...match, status: "force_matched" as const, reviewerInitials: input.actorInitials, notes: input.note ?? match.notes };
  return persistMatch(match, next, "force_match", input.actorInitials, input.note);
}

export async function splitReconciliationMatch(input: ReconciliationActionInput) {
  const match = await getOrCreateMatch(input.matchId);
  if (!match) throw new Error("Match not found");
  const next = { ...match, status: "split_match" as const, notes: input.note ?? "Split match — requires follow-up links." };
  return persistMatch(match, next, "split_match", input.actorInitials, input.note);
}

export async function ignoreBankTransactionMatch(input: ReconciliationActionInput) {
  const match = await getOrCreateMatch(input.matchId);
  if (!match) throw new Error("Match not found");
  const next = { ...match, status: "ignored" as const, notes: input.note ?? "Bank transaction intentionally ignored." };
  return persistMatch(match, next, "ignore_bank_transaction", input.actorInitials, input.note);
}

export async function markTransferMatch(input: ReconciliationActionInput) {
  const match = await getOrCreateMatch(input.matchId);
  if (!match) throw new Error("Match not found");
  const next = { ...match, matchType: "transfer" as const, status: "transfer" as const, notes: input.note ?? match.notes };
  return persistMatch(match, next, "mark_transfer", input.actorInitials, input.note);
}

export async function recordVarianceMatch(input: ReconciliationActionInput) {
  const match = await getOrCreateMatch(input.matchId);
  if (!match) throw new Error("Match not found");
  const next = {
    ...match,
    status: "variance_review" as const,
    variance: input.varianceAmount ?? match.variance,
    notes: input.note ?? match.notes,
  };
  return persistMatch(match, next, "record_variance", input.actorInitials, input.note);
}

export async function lockReconciliationMatchAction(input: ReconciliationActionInput) {
  const match = await getOrCreateMatch(input.matchId);
  if (!match) throw new Error("Match not found");
  const check = canLockReconciliationMatch(match);
  if (!check.ok) throw new Error(check.reason);
  const next = applyReconciliationLock(match, input.actorInitials);
  return persistMatch(match, next, "lock_match", input.actorInitials, input.note);
}

export async function unlockReconciliationMatchAction(input: ReconciliationActionInput) {
  const match = await getOrCreateMatch(input.matchId);
  if (!match) throw new Error("Match not found");
  const check = canUnlockReconciliationMatch(match, input.unlockReason);
  if (!check.ok) throw new Error(check.reason);
  const next = applyReconciliationUnlock(match, input.actorInitials, input.unlockReason ?? "");
  return persistMatch(match, next, "unlock_match", input.actorInitials, input.unlockReason);
}

export async function createSuggestedMatchAsDraft(input: {
  matchId: string;
  matchType: ComplianceReconciliationMatch["matchType"];
  bankTransactionIds: string[];
  moneyMovementIds: string[];
  bankAmount?: number;
  ledgerAmount?: number;
  confidence: ComplianceReconciliationMatch["confidence"];
  notes?: string;
}) {
  const now = new Date().toISOString();
  const match: Omit<ComplianceReconciliationMatch, "createdAt" | "updatedAt" | "humanReviewRequired"> = {
    id: input.matchId,
    matchType: input.matchType,
    status: "suggested",
    confidence: input.confidence,
    bankTransactionIds: input.bankTransactionIds,
    moneyMovementIds: input.moneyMovementIds,
    sourceRecordIds: [],
    bankAmount: input.bankAmount,
    ledgerAmount: input.ledgerAmount,
    notes: input.notes,
  };
  return upsertReconciliationMatch(match);
}
