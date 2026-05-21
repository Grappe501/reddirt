"use server";

import { revalidatePath } from "next/cache";
import { loadCampaignEventsWorkbench } from "@/lib/campaign-events/load-workbench-events";
import {
  finalizeReimbursementMonth,
  markReimbursementMonthReady,
  reopenReimbursementMonthDraft,
} from "@/lib/campaign-events/travel-reimbursement/reimbursement-month-status";

const PATHS = [
  "/admin/campaign-events/reimbursement",
  "/admin/campaign-events/travel-log",
  "/admin/campaign-events/travel-report",
  "/admin/candidate-dashboard",
  "/admin/campaign-manager-dashboard",
] as const;

function revalidateReimbursementSurfaces() {
  for (const p of PATHS) revalidatePath(p, "layout");
}

export async function markReimbursementMonthReadyAction(month: string) {
  await markReimbursementMonthReady(month);
  revalidateReimbursementSurfaces();
  return { ok: true as const };
}

export async function finalizeReimbursementMonthAction(month: string, force = false, reviewNotes?: string) {
  const { rows } = await loadCampaignEventsWorkbench({ period: month });
  const result = await finalizeReimbursementMonth(month, { actor: "admin", force, reviewNotes }, rows);
  if (!result.ok) return { ok: false as const, blockers: result.blockers };
  revalidateReimbursementSurfaces();
  return { ok: true as const };
}

export async function reopenReimbursementMonthDraftAction(month: string, note?: string) {
  await reopenReimbursementMonthDraft(month, "admin", note);
  revalidateReimbursementSurfaces();
  return { ok: true as const };
}
