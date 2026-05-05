/**
 * Orchestrates manual metadata-only sync for the Gmail monitor. No bodies, no queue items, no sends.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getGmailApiForStaffUser, getConnectedStaffGmailRow } from "@/lib/gmail/client";
import {
  collectMetadataStats,
  getGmailMessageMetadata,
  listGmailLabels,
  listRecentGmailMessageRefs,
} from "@/lib/gmail/metadata";
import { listGmailHistorySince } from "@/lib/gmail/history";
import { mergeGmailSyncStatePatch, parseGmailSyncState } from "@/lib/gmail/gmail-sync-state";

const INBOX_LIST_CAP = 25;

export type SafeGmailMetadataSyncOutcome =
  | {
      ok: true;
      labelsCount: number;
      messagesListed: number;
      metadataFetched: number;
      uniqueSenderCount: number;
      unreadInSampleCount: number;
      newestInternalDateIso: string | null;
      profileHistoryId: string | null;
      historyDryRunStatus: "skipped_no_cursor" | "ok" | "404_need_full_sync" | "error";
      historyDryRunDetailSafe: string | null;
      historyChangedHint: number | null;
    }
  | { ok: false; code: string; messageSafe: string };

function safeErr(e: unknown): string {
  if (e instanceof Error) {
    return e.message.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 220);
  }
  return "metadata_sync_failed";
}

export async function runSafeGmailMetadataSyncForUser(userId: string): Promise<SafeGmailMetadataSyncOutcome> {
  const row = await getConnectedStaffGmailRow(userId);
  if (!row) {
    return { ok: false, code: "not_connected", messageSafe: "no_active_staff_gmail_row" };
  }

  const gmail = await getGmailApiForStaffUser(userId);
  if (!gmail) {
    return { ok: false, code: "no_client", messageSafe: "gmail_oauth_or_tokens_unavailable" };
  }

  const syncBefore = parseGmailSyncState(row.gmailSyncState);
  const priorHistoryId = syncBefore.lastHistoryId;
  const nowIso = new Date().toISOString();

  try {
    const labels = await listGmailLabels(gmail);
    const labelEntries = await listRecentGmailMessageRefs(gmail, {
      labelIds: ["INBOX"],
      maxResults: INBOX_LIST_CAP,
    });

    const metaBodies: Awaited<ReturnType<typeof getGmailMessageMetadata>>[] = [];
    for (const ref of labelEntries) {
      if (!ref.id) continue;
      try {
        const m = await getGmailMessageMetadata(gmail, ref.id);
        metaBodies.push(m);
      } catch {
        /* skip individual message failures; count at end */
      }
    }

    const stats = collectMetadataStats(labelEntries, metaBodies);
    const profile = await gmail.users.getProfile({ userId: "me" });
    const profileHistoryId = profile.data.historyId ?? null;

    let historyDryRunStatus: "skipped_no_cursor" | "ok" | "404_need_full_sync" | "error" =
      "skipped_no_cursor";
    let historyDryRunDetailSafe: string | null = null;
    let historyChangedHint: number | null = null;

    if (priorHistoryId) {
      const h = await listGmailHistorySince(gmail, priorHistoryId);
      if (h.ok) {
        historyDryRunStatus = "ok";
        historyChangedHint = h.messageAddedCount;
        historyDryRunDetailSafe =
          h.messageAddedCount > 0
            ? `history_message_added_count_${h.messageAddedCount}`
            : "history_no_new_messages_in_window";
      } else if (h.code === "404") {
        historyDryRunStatus = "404_need_full_sync";
        historyDryRunDetailSafe = h.messageSafe;
      } else {
        historyDryRunStatus = "error";
        historyDryRunDetailSafe = h.messageSafe;
      }
    }

    const nextState = mergeGmailSyncStatePatch(row.gmailSyncState, {
      lastManualSyncAt: nowIso,
      lastSuccessfulSyncAt: nowIso,
      lastErrorAt: null,
      lastErrorCode: null,
      lastErrorMessageSafe: null,
      lastHistoryId: profileHistoryId,
      lastFullSyncAt: nowIso,
      lastMetadataSyncCount: metaBodies.length,
      lastLabelsCount: labels.length,
      lastUniqueSenderCount: stats.uniqueSenderCount,
      lastUnreadInSampleCount: stats.unreadInSampleCount,
      lastNewestInternalDateMs:
        stats.newestInternalDateMs !== null ? String(stats.newestInternalDateMs) : null,
      lastHistoryDryRunAt: nowIso,
      lastHistoryDryRunChangedCount: historyChangedHint,
      lastHistoryDryRunStatus:
        historyDryRunStatus === "skipped_no_cursor"
          ? "skipped_no_cursor"
          : historyDryRunStatus === "ok"
            ? "ok"
            : historyDryRunStatus === "404_need_full_sync"
              ? "404_need_full_sync"
              : "error",
      lastHistoryDryRunMessageSafe: historyDryRunDetailSafe,
    });

    await prisma.staffGmailAccount.update({
      where: { userId },
      data: {
        gmailSyncState: nextState as unknown as Prisma.InputJsonValue,
        lastError: null,
      },
    });

    return {
      ok: true,
      labelsCount: labels.length,
      messagesListed: labelEntries.length,
      metadataFetched: metaBodies.length,
      uniqueSenderCount: stats.uniqueSenderCount,
      unreadInSampleCount: stats.unreadInSampleCount,
      newestInternalDateIso:
        stats.newestInternalDateMs !== null
          ? new Date(stats.newestInternalDateMs).toISOString()
          : null,
      profileHistoryId,
      historyDryRunStatus,
      historyDryRunDetailSafe,
      historyChangedHint,
    };
  } catch (e: unknown) {
    const msg = safeErr(e);
    const nextState = mergeGmailSyncStatePatch(row.gmailSyncState, {
      lastManualSyncAt: nowIso,
      lastErrorAt: nowIso,
      lastErrorCode: "sync_exception",
      lastErrorMessageSafe: msg,
    });
    await prisma.staffGmailAccount.update({
      where: { userId },
      data: {
        gmailSyncState: nextState as unknown as Prisma.InputJsonValue,
        lastError: msg.slice(0, 2000),
      },
    });
    return { ok: false, code: "sync_exception", messageSafe: msg };
  }
}
