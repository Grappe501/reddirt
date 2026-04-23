/**
 * FIN-1: Seams for classifying public `Submission` rows and **drafting** ledger lines.
 * Heuristics only — no auto-persist, no assumption that `content` is structured.
 * @see docs/submission-to-ledger-bridge.md
 * @see docs/financial-ledger-foundation.md
 */

import { type CostBearingWireKindId, getBudgetWireForTransaction } from "./budget";

export const FIN1_PACKET = "FIN-1" as const;

/** Minimal shape so callers can pass Prisma `Submission` or a plain object. */
export type SubmissionLedgerInput = {
  id: string;
  type: string;
  content: string;
  structuredData: unknown;
};

function asRecord(x: unknown): Record<string, unknown> | null {
  if (x && typeof x === "object" && !Array.isArray(x)) {
    return x as Record<string, unknown>;
  }
  return null;
}

/**
 * Very conservative: **false** for almost all public form submissions unless hints exist.
 * Expand when you add a dedicated financial intake type or JSON flags on `structuredData`.
 */
export function isFinancialSubmission(s: Pick<SubmissionLedgerInput, "type" | "content" | "structuredData">): boolean {
  const t = s.type.toLowerCase();
  if (t.includes("expense") || t.includes("reimburs") || t.includes("finance") || t.includes("budget_")) {
    return true;
  }
  const sd = asRecord(s.structuredData);
  if (sd?.["ledgerCandidate"] === true || sd?.["financial"] === true) {
    return true;
  }
  if (sd?.["formType"] === "expense_report" /* hypothetical */) {
    return true;
  }
  // Optional: look for a currency token in the first N chars of content (still noisy).
  return false;
}

/**
 * Produces **zero or more** draft lines — always **unconfirmed** by definition if persisted later.
 * Does **not** parse `content` for dollar amounts in FIN-1 (too error-prone without product rules).
 */
export function extractDraftTransactionsFromSubmission(
  s: Pick<SubmissionLedgerInput, "id" | "type" | "content" | "structuredData">
): DraftFinancialLine[] {
  const sd = asRecord(s.structuredData);
  if (!sd) {
    return [];
  }
  // Example seam only: if a future intake sets explicit decimal dollars + category.
  const amountRaw = sd["ledgerAmountDollars"];
  const categoryRaw = sd["ledgerCategory"];
  if (typeof amountRaw === "number" && Number.isFinite(amountRaw) && typeof categoryRaw === "string" && categoryRaw.trim()) {
    return [
      {
        sourceSubmissionId: s.id,
        amountDollars: amountRaw,
        category: categoryRaw.trim().toLowerCase().replace(/\s+/g, "_"),
        description: `From submission ${s.id} (structured hint)`,
        transactionType: "EXPENSE",
        wireKind: getBudgetWireForTransaction({ category: String(categoryRaw) }),
        confidence: "low",
      },
    ];
  }
  return [];
}

export type DraftFinancialLine = {
  sourceSubmissionId: string;
  amountDollars: number;
  category: string;
  description: string;
  transactionType: "EXPENSE" | "REIMBURSEMENT" | "OTHER";
  wireKind: CostBearingWireKindId;
  /** none = we did not find structured hints; low = a single JSON path matched */
  confidence: "none" | "low";
};
