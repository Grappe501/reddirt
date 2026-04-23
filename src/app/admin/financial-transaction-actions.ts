"use server";

import { FinancialSourceType, FinancialTransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import {
  confirmFinancialTransaction,
  createFinancialTransaction,
} from "@/lib/campaign-engine/financial-ledger";

function parseMoney(raw: string): number | null {
  const n = Number(String(raw).replace(/[$,]/g, "").trim());
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function parseType(raw: string): FinancialTransactionType | null {
  const u = String(raw || "")
    .trim()
    .toUpperCase();
  if (u === "EXPENSE" || u === "REIMBURSEMENT" || u === "CONTRIBUTION" || u === "OTHER") {
    return u as FinancialTransactionType;
  }
  return null;
}

function parseSource(raw: string): FinancialSourceType | null {
  const u = String(raw || "")
    .trim()
    .toUpperCase();
  if (u === "MANUAL" || u === "SUBMISSION" || u === "DOCUMENT" || u === "FUTURE_INTEGRATION") {
    return u as FinancialSourceType;
  }
  return null;
}

function parseDate(raw: string): Date | null {
  const t = new Date(String(raw).trim());
  return Number.isNaN(t.getTime()) ? null : t;
}

export async function createFinancialTransactionAction(formData: FormData) {
  await requireAdminAction();
  const amount = parseMoney(String(formData.get("amount") ?? ""));
  const transactionType = parseType(String(formData.get("transactionType") ?? "EXPENSE"));
  const sourceType = parseSource(String(formData.get("sourceType") ?? "MANUAL")) ?? FinancialSourceType.MANUAL;
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const transactionDate = parseDate(String(formData.get("transactionDate") ?? ""));

  if (amount == null || amount < 0 || !transactionType || !category || !description || !transactionDate) {
    redirect("/admin/financial-transactions?error=create");
  }

  const sourceId = String(formData.get("sourceId") ?? "").trim() || null;
  const relatedUserId = String(formData.get("relatedUserId") ?? "").trim() || null;
  const relatedEventId = String(formData.get("relatedEventId") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await createFinancialTransaction({
    amount,
    transactionType,
    category,
    description,
    sourceType,
    sourceId,
    transactionDate,
    relatedUserId,
    relatedEventId,
    notes,
  });
  revalidatePath("/admin/financial-transactions");
  redirect("/admin/financial-transactions?created=1");
}

export async function confirmFinancialTransactionAction(formData: FormData) {
  await requireAdminAction();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/admin/financial-transactions?error=confirm");
  const actorId = await getAdminActorUserId();
  const r = await confirmFinancialTransaction(id, actorId);
  revalidatePath("/admin/financial-transactions");
  if (!r.ok) {
    redirect(`/admin/financial-transactions?error=confirm_${r.error}`);
  }
  redirect("/admin/financial-transactions?confirmed=1");
}
