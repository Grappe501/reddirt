/**
 * BUDGET-2: Read helpers for budget plans vs FIN-1 ledger actuals.
 * Actuals use **CONFIRMED** `FinancialTransaction` rows only; category → wire via `getBudgetWireForTransaction`.
 * @see docs/budget-structure-foundation.md
 */

import { FinancialTransactionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { BUDGET2_PACKET, getBudgetWireForTransaction } from "./budget";

export const BUDGET_QUERIES_PACKET = BUDGET2_PACKET;

/** UTC `YYYY-MM-DD` for inclusive period checks (admin-entered plan dates; honest, not timezone-perfect). */
function toUtcDayString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isTransactionInBudgetPlanWindow(
  transactionDate: Date,
  startDate: Date | null,
  endDate: Date | null
): boolean {
  if (!startDate && !endDate) return true;
  const day = toUtcDayString(transactionDate);
  if (startDate && day < toUtcDayString(startDate)) return false;
  if (endDate && day > toUtcDayString(endDate)) return false;
  return true;
}

export async function listBudgetPlans() {
  return prisma.budgetPlan.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { lines: true } } },
  });
}

export async function getBudgetPlanDetail(planId: string) {
  return prisma.budgetPlan.findUnique({
    where: { id: planId },
    include: { lines: { orderBy: { createdAt: "asc" } } },
  });
}

/**
 * Sum of **CONFIRMED** ledger amounts grouped by cost-bearing wire (after category mapping).
 * When the plan has `startDate` / `endDate`, only `transactionDate` days inside that inclusive window count.
 */
export async function getBudgetActualsByWire(planId: string): Promise<{
  byWire: Record<string, number>;
  transactionCount: number;
}> {
  const plan = await prisma.budgetPlan.findUnique({
    where: { id: planId },
    select: { id: true, startDate: true, endDate: true },
  });
  if (!plan) {
    return { byWire: {}, transactionCount: 0 };
  }

  const txs = await prisma.financialTransaction.findMany({
    where: { status: FinancialTransactionStatus.CONFIRMED },
    select: { amount: true, category: true, transactionDate: true },
  });

  const byWire: Record<string, number> = {};
  let transactionCount = 0;
  for (const tx of txs) {
    if (!isTransactionInBudgetPlanWindow(tx.transactionDate, plan.startDate, plan.endDate)) {
      continue;
    }
    transactionCount += 1;
    const wire = getBudgetWireForTransaction(tx);
    const n = Number(tx.amount);
    byWire[wire] = (byWire[wire] ?? 0) + (Number.isFinite(n) ? n : 0);
  }

  return { byWire, transactionCount };
}

export type BudgetLineVarianceRow = {
  lineId: string;
  label: string;
  costBearingWireKind: string;
  planned: number;
  /** Same wire may appear on multiple lines — each line still shows the **full** wire total (see `duplicateWireKinds`). */
  actual: number;
  remaining: number;
  variance: number;
};

export async function getBudgetVarianceByLine(planId: string): Promise<{
  plan: NonNullable<Awaited<ReturnType<typeof getBudgetPlanDetail>>>;
  lines: BudgetLineVarianceRow[];
  duplicateWireKinds: string[];
  actualsByWire: Record<string, number>;
  notes: {
    confirmedTransactionsOnly: true;
    categoryToWireImperfect: true;
    periodFiltered: boolean;
  };
} | null> {
  const plan = await getBudgetPlanDetail(planId);
  if (!plan) return null;

  const { byWire } = await getBudgetActualsByWire(planId);
  const wireLineCount = new Map<string, number>();
  for (const line of plan.lines) {
    wireLineCount.set(line.costBearingWireKind, (wireLineCount.get(line.costBearingWireKind) ?? 0) + 1);
  }
  const duplicateWireKinds = [...wireLineCount.entries()].filter(([, n]) => n > 1).map(([w]) => w);

  const lines: BudgetLineVarianceRow[] = plan.lines.map((line) => {
    const planned = Number(line.plannedAmount);
    const actual = byWire[line.costBearingWireKind] ?? 0;
    const p = Number.isFinite(planned) ? planned : 0;
    const a = Number.isFinite(actual) ? actual : 0;
    return {
      lineId: line.id,
      label: line.label,
      costBearingWireKind: line.costBearingWireKind,
      planned: p,
      actual: a,
      remaining: p - a,
      variance: a - p,
    };
  });

  return {
    plan,
    lines,
    duplicateWireKinds,
    actualsByWire: byWire,
    notes: {
      confirmedTransactionsOnly: true,
      categoryToWireImperfect: true,
      periodFiltered: Boolean(plan.startDate || plan.endDate),
    },
  };
}
