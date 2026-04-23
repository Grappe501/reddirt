"use server";

import { BudgetPlanStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { isCostBearingWireKindId } from "@/lib/campaign-engine/budget";
import { prisma } from "@/lib/db";

function parseOptionalDate(raw: string | null): Date | null {
  if (!raw || !String(raw).trim()) return null;
  const d = new Date(String(raw).trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

function parsePlanStatus(raw: string): BudgetPlanStatus {
  const s = String(raw || "").trim().toUpperCase();
  if (s === "ACTIVE") return BudgetPlanStatus.ACTIVE;
  if (s === "ARCHIVED") return BudgetPlanStatus.ARCHIVED;
  return BudgetPlanStatus.DRAFT;
}

export async function createBudgetPlanAction(formData: FormData) {
  await requireAdminAction();
  const name = String(formData.get("name") ?? "").trim();
  const periodLabel = String(formData.get("periodLabel") ?? "").trim();
  if (!name || !periodLabel) {
    redirect("/admin/budgets?error=required");
  }
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const startDate = parseOptionalDate(String(formData.get("startDate") ?? ""));
  const endDate = parseOptionalDate(String(formData.get("endDate") ?? ""));
  const status = parsePlanStatus(String(formData.get("status") ?? "DRAFT"));

  const plan = await prisma.budgetPlan.create({
    data: {
      name,
      periodLabel,
      notes,
      startDate,
      endDate,
      status,
    },
  });
  revalidatePath("/admin/budgets");
  redirect(`/admin/budgets/${plan.id}`);
}

export async function createBudgetLineAction(formData: FormData) {
  await requireAdminAction();
  const budgetPlanId = String(formData.get("budgetPlanId") ?? "").trim();
  const wireRaw = String(formData.get("costBearingWireKind") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const plannedRaw = String(formData.get("plannedAmount") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!budgetPlanId || !label || !isCostBearingWireKindId(wireRaw)) {
    redirect(budgetPlanId ? `/admin/budgets/${budgetPlanId}?error=line` : "/admin/budgets?error=line");
  }
  const planned = Number(plannedRaw);
  if (!Number.isFinite(planned) || planned < 0) {
    redirect(`/admin/budgets/${budgetPlanId}?error=amount`);
  }

  await prisma.budgetLine.create({
    data: {
      budgetPlanId,
      costBearingWireKind: wireRaw,
      label,
      plannedAmount: planned,
      notes,
    },
  });
  revalidatePath("/admin/budgets");
  revalidatePath(`/admin/budgets/${budgetPlanId}`);
  redirect(`/admin/budgets/${budgetPlanId}`);
}
