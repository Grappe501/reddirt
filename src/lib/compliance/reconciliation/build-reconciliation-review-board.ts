import { loadBankAnalyses } from "../storage";
import { buildBankReconciliationRehearsal, type ReconciliationMatchCandidate } from "../imports/bank-reconciliation-rehearsal";
import { loadReconciliationMatches } from "./reconciliation-workbench-storage";

export type AmbiguousBankGroup = {
  bankRowNumber: number;
  bankAmount: number;
  bankDate: string;
  bankMemo: string;
  candidates: Array<{ payoutKey: string; ledgerAmount: number; confidenceReason: string }>;
  suggestedMatchId: string;
};

export type UnmatchedBankReviewRow = {
  rowNumber: number;
  amount: number;
  date: string;
  memo: string;
  suggestedMatchId: string;
};

export type ReconciliationReviewBoard = {
  ready: boolean;
  highConfidence: ReconciliationMatchCandidate[];
  ambiguousGroups: AmbiguousBankGroup[];
  unmatchedBank: UnmatchedBankReviewRow[];
  savedMatchIds: Set<string>;
  operatorSummary: string;
};

export function rehearsalMatchId(bankRowNumber: number, payoutKey?: string): string {
  const payout = payoutKey ? `-${payoutKey.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}` : "";
  return `recon-rehearsal-row-${bankRowNumber}${payout}`;
}

export async function buildReconciliationReviewBoard(): Promise<ReconciliationReviewBoard> {
  const [rehearsal, matches, bankAnalyses] = await Promise.all([
    buildBankReconciliationRehearsal(),
    loadReconciliationMatches(),
    loadBankAnalyses(),
  ]);
  const savedMatchIds = new Set(matches.map((m) => m.id));

  const ambiguousMap = new Map<number, AmbiguousBankGroup>();
  for (const row of rehearsal.ambiguous) {
    const existing = ambiguousMap.get(row.bankRowNumber);
    const candidate = {
      payoutKey: row.payoutKey,
      ledgerAmount: row.ledgerAmount,
      confidenceReason: row.confidenceReason,
    };
    if (existing) {
      existing.candidates.push(candidate);
    } else {
      ambiguousMap.set(row.bankRowNumber, {
        bankRowNumber: row.bankRowNumber,
        bankAmount: row.bankAmount,
        bankDate: row.bankDate,
        bankMemo: row.bankMemo,
        candidates: [candidate],
        suggestedMatchId: rehearsalMatchId(row.bankRowNumber),
      });
    }
  }

  const unmatchedBank: UnmatchedBankReviewRow[] = rehearsal.unmatchedBank.map((row) => ({
    ...row,
    suggestedMatchId: rehearsalMatchId(row.rowNumber),
  }));

  let operatorSummary: string;
  if (!rehearsal.readyForRehearsal) {
    operatorSummary = rehearsal.operatorNextSteps[0] ?? "Bank source not ready for reconciliation review.";
  } else {
    operatorSummary = `${rehearsal.highConfidence.length} high-confidence, ${ambiguousMap.size} ambiguous bank credit(s), ${unmatchedBank.length} unmatched. Treasurer must pick payout or create draft — no auto-resolve.`;
  }

  return {
    ready: rehearsal.readyForRehearsal,
    highConfidence: rehearsal.highConfidence,
    ambiguousGroups: [...ambiguousMap.values()],
    unmatchedBank,
    savedMatchIds,
    operatorSummary,
  };
}

export function resolveBankTransactionId(rowNumber: number, bankAnalyses: Awaited<ReturnType<typeof loadBankAnalyses>>): string {
  for (const analysis of bankAnalyses) {
    const txn = analysis.stagedTransactions.find((t) => t.sourceRowNumber === rowNumber);
    if (txn) return txn.id;
  }
  return `bank-csv-row-${rowNumber}`;
}
