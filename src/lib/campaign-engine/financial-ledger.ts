/**
 * FIN-2: Durable internal ledger—create (draft) and confirm (human) without bank/filing scope creep.
 * @see docs/financial-ledger-foundation.md
 */

import {
  type FinancialSourceType,
  FinancialTransactionStatus,
  type FinancialTransactionType,
} from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";

export const FIN2_PACKET = "FIN-2" as const;

export type CreateFinancialTransactionInput = {
  amount: number;
  transactionType: FinancialTransactionType;
  category: string;
  description: string;
  sourceType: FinancialSourceType;
  sourceId?: string | null;
  transactionDate: Date;
  relatedUserId?: string | null;
  relatedEventId?: string | null;
  notes?: string | null;
};

/**
 * Admin-origin draft row. Always **DRAFT**; use `confirmFinancialTransaction` to affirm.
 */
export async function createFinancialTransaction(
  data: CreateFinancialTransactionInput,
  db: Pick<PrismaClient, "financialTransaction"> = prisma
) {
  const { amount, category, description, transactionDate, transactionType, sourceType } = data;
  if (!Number.isFinite(amount)) {
    throw new Error("amount_invalid");
  }
  return db.financialTransaction.create({
    data: {
      amount,
      category: category.trim(),
      description: description.trim(),
      transactionType,
      sourceType,
      sourceId: data.sourceId?.trim() || null,
      transactionDate,
      relatedUserId: data.relatedUserId ?? null,
      relatedEventId: data.relatedEventId ?? null,
      notes: data.notes?.trim() || null,
      status: FinancialTransactionStatus.DRAFT,
    },
  });
}

/**
 * DRAFT → **CONFIRMED** with optional confirming user id and timestamp (FIN-2 audit).
 */
export async function confirmFinancialTransaction(
  id: string,
  actorId: string | null,
  db: Pick<PrismaClient, "financialTransaction"> = prisma
) {
  const row = await db.financialTransaction.findUnique({ where: { id } });
  if (!row) {
    return { ok: false as const, error: "not_found" as const };
  }
  if (row.status !== FinancialTransactionStatus.DRAFT) {
    return { ok: false as const, error: "not_draft" as const };
  }
  const now = new Date();
  const updated = await db.financialTransaction.update({
    where: { id },
    data: {
      status: FinancialTransactionStatus.CONFIRMED,
      confirmedByUserId: actorId,
      confirmedAt: now,
    },
  });
  return { ok: true as const, transaction: updated };
}
