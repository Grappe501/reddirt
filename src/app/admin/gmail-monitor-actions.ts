"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/app/admin/owned-media-auth";
import { getAdminActorUserId } from "@/lib/admin/actor";
import { runSafeGmailMetadataSyncForUser } from "@/lib/gmail/sync";
import { startOrRenewGmailWatchForAccount, stopGmailWatchForAccount } from "@/lib/gmail/watch";
import { processGmailHistorySinceStoredCursor } from "@/lib/gmail/history-processor";
import { isGmailWatchConfigured } from "@/lib/gmail/watch-config";

/**
 * Manual “safe metadata sync” from Gmail monitor. No bodies, no queue items, no sends.
 */
export async function runGmailSafeMetadataSyncAction(): Promise<void> {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  if (!actor) {
    redirect("/admin/workbench/email-command-center/gmail?gmail_sync_error=needs_actor");
  }
  const r = await runSafeGmailMetadataSyncForUser(actor);
  revalidatePath("/admin/workbench/email-command-center/gmail");
  revalidatePath("/admin/workbench/email-command-center/gmail/review");
  revalidatePath("/admin/workbench/email-command-center");
  if (!r.ok) {
    redirect(`/admin/workbench/email-command-center/gmail?gmail_sync_error=${encodeURIComponent(r.code)}`);
  }
  redirect("/admin/workbench/email-command-center/gmail?gmail_sync=1");
}

export async function startOrRenewGmailWatchAction(): Promise<void> {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  if (!actor) {
    redirect("/admin/workbench/email-command-center/gmail?gmail_watch_error=needs_actor");
  }
  if (!isGmailWatchConfigured()) {
    redirect("/admin/workbench/email-command-center/gmail?gmail_watch_error=topic_not_configured");
  }
  const r = await startOrRenewGmailWatchForAccount(actor);
  revalidatePath("/admin/workbench/email-command-center/gmail");
  revalidatePath("/admin/workbench/email-command-center/gmail/review");
  revalidatePath("/admin/workbench/email-command-center");
  if (!r.ok) {
    redirect(`/admin/workbench/email-command-center/gmail?gmail_watch_error=${encodeURIComponent(r.code)}`);
  }
  redirect("/admin/workbench/email-command-center/gmail?gmail_watch=1");
}

export async function stopGmailWatchAction(): Promise<void> {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  if (!actor) {
    redirect("/admin/workbench/email-command-center/gmail?gmail_watch_error=needs_actor");
  }
  const r = await stopGmailWatchForAccount(actor);
  revalidatePath("/admin/workbench/email-command-center/gmail");
  revalidatePath("/admin/workbench/email-command-center/gmail/review");
  revalidatePath("/admin/workbench/email-command-center");
  if (!r.ok) {
    redirect(`/admin/workbench/email-command-center/gmail?gmail_watch_error=${encodeURIComponent(r.code)}`);
  }
  redirect("/admin/workbench/email-command-center/gmail?gmail_watch_stop=1");
}

/**
 * Manual `history.list` preview after Pub/Sub or cursor maintenance — counts only; updates `lastHistoryId` on success.
 * Does not read bodies; does not create queue items.
 */
export async function processGmailPendingHistoryPreviewAction(): Promise<void> {
  await requireAdminAction();
  const actor = await getAdminActorUserId();
  if (!actor) {
    redirect("/admin/workbench/email-command-center/gmail?gmail_history_error=needs_actor");
  }
  const r = await processGmailHistorySinceStoredCursor(actor);
  revalidatePath("/admin/workbench/email-command-center/gmail");
  revalidatePath("/admin/workbench/email-command-center/gmail/review");
  revalidatePath("/admin/workbench/email-command-center");
  if (!r.ok) {
    if (r.code === "needs_full_sync") {
      redirect("/admin/workbench/email-command-center/gmail?gmail_history_needs_sync=1");
    }
    redirect(`/admin/workbench/email-command-center/gmail?gmail_history_error=${encodeURIComponent(r.code)}`);
  }
  redirect("/admin/workbench/email-command-center/gmail?gmail_history_preview=1");
}

/** @deprecated Use `processGmailPendingHistoryPreviewAction` (same behavior). */
export const processGmailHistoryPreviewAction = processGmailPendingHistoryPreviewAction;
