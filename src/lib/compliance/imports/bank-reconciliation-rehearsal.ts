import { loadApril26GoodChangeRows } from "../approval/april26-source";
import { evaluateBankCsvReadiness } from "./bank-csv-readiness";
import { parseApril26BankCsv, type ParsedBankRow } from "./bank-csv-parse";

export type MatchConfidence = "high" | "ambiguous" | "unmatched";

export type ReconciliationMatchCandidate = {
  bankRowNumber: number;
  bankAmount: number;
  bankDate: string;
  bankMemo: string;
  payoutKey: string;
  ledgerAmount: number;
  confidence: MatchConfidence;
  confidenceReason: string;
};

export type BankReconciliationRehearsal = {
  bankReadiness: Awaited<ReturnType<typeof evaluateBankCsvReadiness>>;
  parseIssues: Array<{ code: string; message: string; row?: number }>;
  columnDiagnostics: { headers: string[]; columnMap: Record<string, string> };
  creditRows: number;
  unmatchedBank: Array<{ rowNumber: number; amount: number; date: string; memo: string }>;
  unmatchedPayouts: Array<{ payoutKey: string; ledgerAmount: number; contributionCount: number }>;
  highConfidence: ReconciliationMatchCandidate[];
  ambiguous: ReconciliationMatchCandidate[];
  operatorNextSteps: string[];
  readyForRehearsal: boolean;
};

type PayoutBatch = { payoutKey: string; ledgerAmount: number; contributionCount: number };

function buildPayoutBatches(rows: Record<string, string>[]): PayoutBatch[] {
  const map = new Map<string, { sum: number; count: number }>();
  for (const row of rows) {
    const key = row.payout_id || row.transfer_id || row.payout || `batch-${row.date ?? "unknown"}`;
    const net = Number(String(row.net ?? row.amount ?? "0").replace(/[$,]/g, ""));
    const prev = map.get(key) ?? { sum: 0, count: 0 };
    map.set(key, { sum: prev.sum + (Number.isFinite(net) ? net : 0), count: prev.count + 1 });
  }
  return [...map.entries()].map(([payoutKey, v]) => ({
    payoutKey,
    ledgerAmount: Math.round(v.sum * 100) / 100,
    contributionCount: v.count,
  }));
}

function matchBankToPayouts(bankRows: ParsedBankRow[], payouts: PayoutBatch[]): {
  highConfidence: ReconciliationMatchCandidate[];
  ambiguous: ReconciliationMatchCandidate[];
  unmatchedBank: BankReconciliationRehearsal["unmatchedBank"];
  matchedPayoutKeys: Set<string>;
} {
  const highConfidence: ReconciliationMatchCandidate[] = [];
  const ambiguous: ReconciliationMatchCandidate[] = [];
  const unmatchedBank: BankReconciliationRehearsal["unmatchedBank"] = [];
  const matchedPayoutKeys = new Set<string>();
  const credits = bankRows.filter((r) => r.amount > 0);

  for (const bank of credits) {
    const candidates = payouts.filter((p) => Math.abs(p.ledgerAmount - bank.amount) < 0.02);
    if (!candidates.length) {
      unmatchedBank.push({
        rowNumber: bank.rowNumber,
        amount: bank.amount,
        date: bank.date,
        memo: bank.memo,
      });
      continue;
    }
    if (candidates.length === 1) {
      const payout = candidates[0];
      matchedPayoutKeys.add(payout.payoutKey);
      highConfidence.push({
        bankRowNumber: bank.rowNumber,
        bankAmount: bank.amount,
        bankDate: bank.date,
        bankMemo: bank.memo,
        payoutKey: payout.payoutKey,
        ledgerAmount: payout.ledgerAmount,
        confidence: "high",
        confidenceReason: "Amount matches GoodChange payout batch net total (±$0.01).",
      });
      continue;
    }
    const memoHit = candidates.find((p) => bank.memo && bank.memo.includes(p.payoutKey.slice(0, 8)));
    if (memoHit) {
      matchedPayoutKeys.add(memoHit.payoutKey);
      highConfidence.push({
        bankRowNumber: bank.rowNumber,
        bankAmount: bank.amount,
        bankDate: bank.date,
        bankMemo: bank.memo,
        payoutKey: memoHit.payoutKey,
        ledgerAmount: memoHit.ledgerAmount,
        confidence: "high",
        confidenceReason: "Amount and memo align with payout batch.",
      });
      continue;
    }
    for (const payout of candidates) {
      ambiguous.push({
        bankRowNumber: bank.rowNumber,
        bankAmount: bank.amount,
        bankDate: bank.date,
        bankMemo: bank.memo,
        payoutKey: payout.payoutKey,
        ledgerAmount: payout.ledgerAmount,
        confidence: "ambiguous",
        confidenceReason: `Multiple payout batches share amount $${bank.amount.toFixed(2)} — treasurer must pick.`,
      });
    }
  }

  return { highConfidence, ambiguous, unmatchedBank, matchedPayoutKeys };
}

export async function buildBankReconciliationRehearsal(): Promise<BankReconciliationRehearsal> {
  const bankReadiness = await evaluateBankCsvReadiness();
  const parsed = await parseApril26BankCsv();
  const operatorNextSteps: string[] = [];

  if (!parsed.found) {
    operatorNextSteps.push("Add bank-april-2026.csv to April26 folder (date, amount, memo).");
    return {
      bankReadiness,
      parseIssues: parsed.issues,
      columnDiagnostics: { headers: [], columnMap: {} },
      creditRows: 0,
      unmatchedBank: [],
      unmatchedPayouts: [],
      highConfidence: [],
      ambiguous: [],
      operatorNextSteps,
      readyForRehearsal: false,
    };
  }

  if (parsed.issues.length) {
    operatorNextSteps.push("Fix bank CSV schema/row issues listed below, then re-run rehearsal.");
  }

  let goodChangeRows: Record<string, string>[] = [];
  try {
    goodChangeRows = await loadApril26GoodChangeRows();
  } catch {
    operatorNextSteps.push("GoodChange CSV required for payout matching.");
  }

  const payouts = buildPayoutBatches(goodChangeRows);
  const { highConfidence, ambiguous, unmatchedBank, matchedPayoutKeys } = matchBankToPayouts(parsed.rows, payouts);
  const unmatchedPayouts = payouts.filter((p) => !matchedPayoutKeys.has(p.payoutKey));

  if (highConfidence.length) {
    operatorNextSteps.push(`Review ${highConfidence.length} high-confidence match(es) in Reconciliation workbench.`);
  }
  if (ambiguous.length) {
    operatorNextSteps.push(`Resolve ${ambiguous.length} ambiguous amount collision(s) manually.`);
  }
  if (unmatchedBank.length) {
    operatorNextSteps.push(`Investigate ${unmatchedBank.length} bank credit(s) with no payout batch match.`);
  }
  if (unmatchedPayouts.length) {
    operatorNextSteps.push(`Investigate ${unmatchedPayouts.length} GoodChange payout batch(es) without bank line.`);
  }
  if (!operatorNextSteps.length && bankReadiness.readyForReconciliation) {
    operatorNextSteps.push("Run reconciliation workbench approve/lock flow for suggested matches.");
  }

  const readyForRehearsal =
    bankReadiness.readyForReconciliation && parsed.rows.length > 0 && !parsed.issues.some((i) => i.code === "header_mismatch");

  return {
    bankReadiness,
    parseIssues: [...parsed.issues, ...bankReadiness.issues.map((i) => ({ code: i.code, message: i.message, row: i.row }))],
    columnDiagnostics: { headers: parsed.headers, columnMap: parsed.columnMap },
    creditRows: parsed.rows.filter((r) => r.amount > 0).length,
    unmatchedBank,
    unmatchedPayouts,
    highConfidence,
    ambiguous,
    operatorNextSteps,
    readyForRehearsal,
  };
}
