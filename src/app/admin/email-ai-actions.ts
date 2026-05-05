"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { runEmailWorkflowAiAnalysis } from "@/lib/email-workflow/ai/analyzer";

function trimId(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * EMAIL-AI-INTELLIGENCE-1.0 — runs advisory OpenAI analysis; does not change status, send, or profiles.
 */
export async function runEmailWorkflowAiAnalysisAction(
  fd: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const itemId = trimId(fd, "itemId");
  if (!itemId) {
    return { ok: false, error: "Missing item id." };
  }

  const r = await runEmailWorkflowAiAnalysis({ itemId });

  revalidatePath("/admin/workbench/email-queue");
  revalidatePath(`/admin/workbench/email-queue/${itemId}`);
  revalidatePath("/admin/workbench/email-command-center");

  if (!r.ok) {
    return { ok: false, error: r.errorSafe };
  }
  return { ok: true };
}
