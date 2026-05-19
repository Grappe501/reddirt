import { buildReconciliationReviewBoard, rehearsalMatchId } from "./build-reconciliation-review-board";
import { buildReconciliationWorkbench } from "./reconciliation-workbench-storage";
import { buildBankReconciliationRehearsal } from "../imports/bank-reconciliation-rehearsal";

export type ReconciliationProgress = {
  readyForReview: boolean;
  highConfidenceTotal: number;
  highConfidenceDrafted: number;
  ambiguousTotal: number;
  ambiguousWithDraft: number;
  unmatchedTotal: number;
  unmatchedWithDraft: number;
  savedMatches: number;
  lockedMatches: number;
  approvedMatches: number;
  remainingReviewItems: number;
  percentReviewed: number;
  nextHref: string;
  summary: string;
};

function draftExistsForRow(savedIds: Set<string>, rowNumber: number, payoutKey?: string): boolean {
  if (savedIds.has(rehearsalMatchId(rowNumber))) return true;
  if (payoutKey && savedIds.has(rehearsalMatchId(rowNumber, payoutKey))) return true;
  return [...savedIds].some((id) => id.startsWith(`recon-rehearsal-row-${rowNumber}`));
}

export async function buildReconciliationProgress(): Promise<ReconciliationProgress> {
  const [board, workbench, rehearsal] = await Promise.all([
    buildReconciliationReviewBoard(),
    buildReconciliationWorkbench(),
    buildBankReconciliationRehearsal(),
  ]);
  const savedIds = board.savedMatchIds;

  const highConfidenceDrafted = board.highConfidence.filter((h) =>
    draftExistsForRow(savedIds, h.bankRowNumber, h.payoutKey),
  ).length;

  const ambiguousWithDraft = board.ambiguousGroups.filter((g) => draftExistsForRow(savedIds, g.bankRowNumber)).length;
  const unmatchedWithDraft = board.unmatchedBank.filter((u) => draftExistsForRow(savedIds, u.rowNumber)).length;

  const remainingReviewItems =
    board.highConfidence.length -
    highConfidenceDrafted +
    (board.ambiguousGroups.length - ambiguousWithDraft) +
    (board.unmatchedBank.length - unmatchedWithDraft);

  const totalItems = board.highConfidence.length + board.ambiguousGroups.length + board.unmatchedBank.length;
  const reviewed = totalItems - remainingReviewItems;
  const percentReviewed = totalItems ? Math.round((reviewed / totalItems) * 100) : workbench.lockedCount ? 100 : 0;

  const summary = rehearsal.readyForRehearsal
    ? `${workbench.lockedCount} locked · ${remainingReviewItems} rehearsal item(s) still need draft or decision`
    : "Bank source not ready — import or add CSV first.";

  return {
    readyForReview: rehearsal.readyForRehearsal,
    highConfidenceTotal: board.highConfidence.length,
    highConfidenceDrafted,
    ambiguousTotal: board.ambiguousGroups.length,
    ambiguousWithDraft,
    unmatchedTotal: board.unmatchedBank.length,
    unmatchedWithDraft,
    savedMatches: workbench.matches.length,
    lockedMatches: workbench.lockedCount,
    approvedMatches: workbench.approvedCount,
    remainingReviewItems,
    percentReviewed,
    nextHref: "/admin/compliance/reconciliation",
    summary,
  };
}
