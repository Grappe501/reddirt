"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { prisma } from "@/lib/db";
import { runEmailWorkflowInterpretation } from "@/lib/email-workflow/intelligence/interpreter";

function trim(f: FormData, key: string): string | null {
  const v = f.get(key);
  if (v == null || typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

/**
 * E-1: manual row creation only — always queue-first (default NEW), no auto-approval or send.
 */
export async function createEmailWorkflowItemManualAction(
  fd: FormData
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireAdminAction();
  const title = trim(fd, "title");
  if (!title) {
    return { ok: false, error: "Title is required." };
  }
  const actor = await getAdminActorUserId();
  const row = await prisma.emailWorkflowItem.create({
    data: {
      title,
      queueReason: trim(fd, "queueReason"),
      whoSummary: trim(fd, "whoSummary"),
      whatSummary: trim(fd, "whatSummary"),
      whenSummary: trim(fd, "whenSummary"),
      whereSummary: trim(fd, "whereSummary"),
      whySummary: trim(fd, "whySummary"),
      impactSummary: trim(fd, "impactSummary"),
      recommendedResponseSummary: trim(fd, "recommendedResponseSummary"),
      ...(actor ? { createdByUserId: actor } : {}),
    },
    select: { id: true },
  });
  revalidatePath("/admin/workbench/email-queue");
  return { ok: true, id: row.id };
}

/**
 * E-2A: manual interpretation pass (deterministic heuristics + safe writeback). No AI, no send.
 * Re-runs are allowed; use checkboxes to overwrite protected summary/triage fields.
 */
export async function runEmailWorkflowInterpretationAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const id = (fd.get("itemId") as string | null)?.trim() ?? "";
  if (!id) {
    return { ok: false, error: "Missing item id." };
  }
  const forceOverwriteSummaries = fd.get("forceSummaries") === "on";
  const forceOverwriteSignals = fd.get("forceSignals") === "on";
  const r = await runEmailWorkflowInterpretation({
    itemId: id,
    forceOverwriteSummaries,
    forceOverwriteSignals,
  });
  if (!r.ok) {
    return { ok: false, error: r.error };
  }
  revalidatePath("/admin/workbench/email-queue");
  revalidatePath(`/admin/workbench/email-queue/${id}`);
  return { ok: true };
}
