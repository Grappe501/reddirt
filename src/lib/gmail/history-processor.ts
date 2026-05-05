/**
 * Manual Gmail `history.list` preview — counts only; no bodies; no `EmailWorkflowItem` creation.
 * EMAIL-GMAIL-OPS-HISTORY-1.3: stale-cursor guard, pending Pub/Sub signal handling, safe error persistence.
 */

import type { gmail_v1 } from "googleapis";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getGmailApiForStaffUser, getConnectedStaffGmailRow } from "@/lib/gmail/client";
import { mergeGmailSyncStatePatch, parseGmailSyncState } from "@/lib/gmail/gmail-sync-state";

const MAX_HISTORY_PAGES = 5;

function countHistoryDeltas(history: gmail_v1.Schema$History[]): {
  messagesAdded: number;
  messagesDeleted: number;
  labelsAdded: number;
  labelsRemoved: number;
} {
  let messagesAdded = 0;
  let messagesDeleted = 0;
  let labelsAdded = 0;
  let labelsRemoved = 0;
  for (const h of history) {
    messagesAdded += h.messagesAdded?.length ?? 0;
    messagesDeleted += h.messagesDeleted?.length ?? 0;
    labelsAdded += h.labelsAdded?.length ?? 0;
    labelsRemoved += h.labelsRemoved?.length ?? 0;
  }
  return { messagesAdded, messagesDeleted, labelsAdded, labelsRemoved };
}

function redactApiMessage(e: unknown): string {
  if (e instanceof Error) {
    return e.message.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 220);
  }
  return "history_preview_failed";
}

export type ProcessGmailHistoryPreviewResult =
  | {
      ok: true;
      messagesAdded: number;
      messagesDeleted: number;
      labelsAdded: number;
      labelsRemoved: number;
      pages: number;
      newHistoryId: string | null;
      noteSafe: string | null;
      /** Cursor value passed to Gmail `startHistoryId` (never a pending notification id alone). */
      startHistoryIdUsed: string;
    }
  | { ok: false; code: string; messageSafe: string };

/**
 * Incremental history.list from stored profile cursor (`lastHistoryId`).
 * `pendingHistoryId` / Pub/Sub ids are not valid Gmail `startHistoryId` values — we only clear pending after success.
 */
export async function processGmailHistorySinceStoredCursor(
  userId: string
): Promise<ProcessGmailHistoryPreviewResult> {
  const row = await getConnectedStaffGmailRow(userId);
  if (!row) {
    return { ok: false, code: "not_connected", messageSafe: "no_active_staff_gmail_row" };
  }

  const syncBefore = parseGmailSyncState(row.gmailSyncState);

  if (syncBefore.requiresFullSync === true || syncBefore.historyCursorStale === true) {
    return {
      ok: false,
      code: "needs_full_sync",
      messageSafe: "cursor_stale_or_requires_full_sync_run_safe_metadata_sync_first",
    };
  }

  const startId = syncBefore.lastHistoryId;
  if (!startId) {
    const hasPendingSignal = Boolean(syncBefore.pendingHistoryId || syncBefore.lastPubSubHistoryId);
    return {
      ok: false,
      code: "no_cursor",
      messageSafe: hasPendingSignal
        ? "pubsub_signal_without_profile_cursor_run_metadata_sync_first"
        : "run_metadata_sync_first_for_history_id",
    };
  }

  const gmail = await getGmailApiForStaffUser(userId);
  if (!gmail) {
    return { ok: false, code: "no_client", messageSafe: "gmail_oauth_or_tokens_unavailable" };
  }

  const nowIso = new Date().toISOString();

  let messagesAdded = 0;
  let messagesDeleted = 0;
  let labelsAdded = 0;
  let labelsRemoved = 0;
  let pages = 0;
  let pageToken: string | undefined;
  let lastHistoryIdOut: string | null = null;

  try {
    for (let i = 0; i < MAX_HISTORY_PAGES; i++) {
      const res = await gmail.users.history.list({
        userId: "me",
        ...(pageToken ? { pageToken } : { startHistoryId: startId }),
        maxResults: 100,
      });
      pages += 1;
      const chunk = res.data.history ?? [];
      const c = countHistoryDeltas(chunk);
      messagesAdded += c.messagesAdded;
      messagesDeleted += c.messagesDeleted;
      labelsAdded += c.labelsAdded;
      labelsRemoved += c.labelsRemoved;
      lastHistoryIdOut = res.data.historyId != null ? String(res.data.historyId) : lastHistoryIdOut;
      const nextTok = res.data.nextPageToken;
      if (!nextTok) break;
      pageToken = nextTok;
    }

    const note =
      pages >= MAX_HISTORY_PAGES
        ? "history_preview_capped_at_max_pages_renew_cursor_manually_if_needed"
        : null;

    const nextState = mergeGmailSyncStatePatch(row.gmailSyncState, {
      lastHistoryId: lastHistoryIdOut ?? syncBefore.lastHistoryId,
      lastHistoryPreviewAt: nowIso,
      lastHistoryPreviewMessagesAdded: messagesAdded,
      lastHistoryPreviewMessagesDeleted: messagesDeleted,
      lastHistoryPreviewLabelsAdded: labelsAdded,
      lastHistoryPreviewLabelsRemoved: labelsRemoved,
      lastHistoryPreviewPages: pages,
      lastHistoryPreviewMessageSafe: note,
      /** Processed incremental batch — pending Pub/Sub hint consumed without fetching bodies. */
      pendingHistoryId: null,
      historyCursorStale: false,
      requiresFullSync: false,
      lastHistoryDryRunAt: nowIso,
      lastHistoryDryRunStatus: "ok",
      lastHistoryDryRunChangedCount: messagesAdded + messagesDeleted + labelsAdded + labelsRemoved,
      lastHistoryDryRunMessageSafe: note ?? `history_preview_ok_pages_${pages}`,
    });

    await prisma.staffGmailAccount.update({
      where: { userId },
      data: { gmailSyncState: nextState as unknown as Prisma.InputJsonValue },
    });

    return {
      ok: true,
      messagesAdded,
      messagesDeleted,
      labelsAdded,
      labelsRemoved,
      pages,
      newHistoryId: lastHistoryIdOut,
      noteSafe: note,
      startHistoryIdUsed: startId,
    };
  } catch (e: unknown) {
    const err = e as { code?: number | string };
    const codeNum = typeof err.code === "number" ? err.code : Number(err.code);
    if (codeNum === 404) {
      const msg = "history_id_stale_or_invalid_run_full_metadata_sync";
      const nextState = mergeGmailSyncStatePatch(row.gmailSyncState, {
        historyCursorStale: true,
        requiresFullSync: true,
        lastHistoryPreviewAt: nowIso,
        lastHistoryPreviewMessageSafe: msg,
        lastHistoryDryRunAt: nowIso,
        lastHistoryDryRunStatus: "404_need_full_sync",
        lastHistoryDryRunChangedCount: null,
        lastHistoryDryRunMessageSafe: msg,
        lastHistoryErrorCode: "history_404",
        lastHistoryErrorAt: nowIso,
        lastHistoryErrorMessageSafe: msg,
      });
      await prisma.staffGmailAccount.update({
        where: { userId },
        data: { gmailSyncState: nextState as unknown as Prisma.InputJsonValue },
      });
      return { ok: false, code: "history_404", messageSafe: msg };
    }

    const msg = redactApiMessage(e);
    const nextState = mergeGmailSyncStatePatch(row.gmailSyncState, {
      lastHistoryPreviewAt: nowIso,
      lastHistoryPreviewMessageSafe: msg,
      lastHistoryDryRunAt: nowIso,
      lastHistoryDryRunStatus: "error",
      lastHistoryDryRunChangedCount: null,
      lastHistoryDryRunMessageSafe: msg,
      lastHistoryErrorCode: "history_error",
      lastHistoryErrorAt: nowIso,
      lastHistoryErrorMessageSafe: msg,
    });
    await prisma.staffGmailAccount.update({
      where: { userId },
      data: { gmailSyncState: nextState as unknown as Prisma.InputJsonValue },
    });
    return { ok: false, code: "history_error", messageSafe: msg };
  }
}
