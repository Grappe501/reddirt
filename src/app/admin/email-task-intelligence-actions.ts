"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { generateEmailTaskIntelligenceForQueueItem } from "@/lib/email-command-center/ai-task-intelligence";

function trimId(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * EMAIL-AI-TASK-INTELLIGENCE-1.0 — advisory structured tasks; persists envelope to `metadataJson.emailTaskIntelligence` only.
 * No CampaignTask creation, no calendar writes, no sends, no queue status changes.
 */
export async function generateTaskRecommendationsForQueueItemAction(
  fd: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdminAction();
  const itemId = trimId(fd, "itemId");
  if (!itemId) {
    return { ok: false, error: "Missing item id." };
  }

  const r = await generateEmailTaskIntelligenceForQueueItem({ itemId });

  revalidatePath("/admin/workbench/email-queue");
  revalidatePath(`/admin/workbench/email-queue/${itemId}`);
  revalidatePath("/admin/workbench/email-command-center");
  revalidatePath("/admin/workbench/email-command-center/daily");

  if (!r.ok) {
    return { ok: false, error: r.errorSafe };
  }
  return { ok: true };
}
