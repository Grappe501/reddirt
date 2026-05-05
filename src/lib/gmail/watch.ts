/**
 * Gmail `users.watch` / `users.stop` — metadata scope only; no bodies; no queue side effects.
 */

import type { gmail_v1 } from "googleapis";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getGmailApiForStaffUser, getConnectedStaffGmailRow } from "@/lib/gmail/client";
import { mergeGmailSyncStatePatch, parseGmailSyncState, type GmailWatchStatusV1 } from "@/lib/gmail/gmail-sync-state";
import {
  getGmailPubSubTopicName,
  getGmailWatchLabelIds,
  isGmailWatchConfigured,
} from "@/lib/gmail/watch-config";

export type GmailWatchApiResult = {
  historyId: string | null;
  expiration: string | null;
};

function safeErr(e: unknown): string {
  if (e instanceof Error) {
    return e.message.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 220);
  }
  return "watch_request_failed";
}

export function parseGmailWatchResponse(data: gmail_v1.Schema$WatchResponse): GmailWatchApiResult {
  const historyId = data.historyId != null ? String(data.historyId) : null;
  const expiration = data.expiration != null ? String(data.expiration) : null;
  return { historyId, expiration };
}

export async function updateGmailWatchState(
  userId: string,
  patch: {
    watchHistoryId: string | null;
    watchExpiration: string | null;
    watchStatus: GmailWatchStatusV1;
    lastWatchErrorAt: string | null;
    lastWatchErrorCode: string | null;
    lastWatchErrorMessageSafe: string | null;
  }
): Promise<void> {
  const row = await getConnectedStaffGmailRow(userId);
  if (!row) return;
  const next = mergeGmailSyncStatePatch(row.gmailSyncState, patch);
  await prisma.staffGmailAccount.update({
    where: { userId },
    data: { gmailSyncState: next as unknown as Prisma.InputJsonValue },
  });
}

export type GmailWatchActionResult =
  | { ok: true; historyId: string | null; expiration: string | null }
  | { ok: false; code: string; messageSafe: string };

export async function startOrRenewGmailWatchForAccount(userId: string): Promise<GmailWatchActionResult> {
  if (!isGmailWatchConfigured()) {
    return {
      ok: false,
      code: "watch_not_configured",
      messageSafe: "set_GOOGLE_PUBSUB_TOPIC_for_users_watch",
    };
  }

  const row = await getConnectedStaffGmailRow(userId);
  if (!row) {
    return { ok: false, code: "not_connected", messageSafe: "no_active_staff_gmail_row" };
  }

  const gmail = await getGmailApiForStaffUser(userId);
  if (!gmail) {
    return { ok: false, code: "no_client", messageSafe: "gmail_oauth_or_tokens_unavailable" };
  }

  const topicName = getGmailPubSubTopicName();
  const labelIds = getGmailWatchLabelIds();
  const nowIso = new Date().toISOString();

  try {
    const res = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName,
        labelIds,
        labelFilterAction: "include",
      },
    });
    const parsed = parseGmailWatchResponse(res.data);
    const next = mergeGmailSyncStatePatch(row.gmailSyncState, {
      watchHistoryId: parsed.historyId,
      watchExpiration: parsed.expiration,
      watchStatus: "ACTIVE",
      lastWatchErrorAt: null,
      lastWatchErrorCode: null,
      lastWatchErrorMessageSafe: null,
      historyCursorStale: false,
    });
    await prisma.staffGmailAccount.update({
      where: { userId },
      data: {
        gmailSyncState: next as unknown as Prisma.InputJsonValue,
        lastError: null,
      },
    });
    return { ok: true, historyId: parsed.historyId, expiration: parsed.expiration };
  } catch (e: unknown) {
    const msg = safeErr(e);
    const next = mergeGmailSyncStatePatch(row.gmailSyncState, {
      watchStatus: "ERROR",
      lastWatchErrorAt: nowIso,
      lastWatchErrorCode: "watch_request",
      lastWatchErrorMessageSafe: msg,
    });
    await prisma.staffGmailAccount.update({
      where: { userId },
      data: {
        gmailSyncState: next as unknown as Prisma.InputJsonValue,
        lastError: msg.slice(0, 2000),
      },
    });
    return { ok: false, code: "watch_request", messageSafe: msg };
  }
}

export async function stopGmailWatchForAccount(userId: string): Promise<GmailWatchActionResult> {
  const row = await getConnectedStaffGmailRow(userId);
  if (!row) {
    return { ok: false, code: "not_connected", messageSafe: "no_active_staff_gmail_row" };
  }

  const gmail = await getGmailApiForStaffUser(userId);
  if (!gmail) {
    return { ok: false, code: "no_client", messageSafe: "gmail_oauth_or_tokens_unavailable" };
  }

  const nowIso = new Date().toISOString();
  try {
    await gmail.users.stop({ userId: "me" });
    const sync = parseGmailSyncState(row.gmailSyncState);
    const next = mergeGmailSyncStatePatch(row.gmailSyncState, {
      watchStatus: "STOPPED",
      watchExpiration: null,
      watchHistoryId: null,
      lastWatchErrorAt: null,
      lastWatchErrorCode: null,
      lastWatchErrorMessageSafe: null,
      lastHistoryId: sync.lastHistoryId,
    });
    await prisma.staffGmailAccount.update({
      where: { userId },
      data: { gmailSyncState: next as unknown as Prisma.InputJsonValue },
    });
    return { ok: true, historyId: null, expiration: null };
  } catch (e: unknown) {
    const msg = safeErr(e);
    const next = mergeGmailSyncStatePatch(row.gmailSyncState, {
      watchStatus: "ERROR",
      lastWatchErrorAt: nowIso,
      lastWatchErrorCode: "watch_stop",
      lastWatchErrorMessageSafe: msg,
    });
    await prisma.staffGmailAccount.update({
      where: { userId },
      data: {
        gmailSyncState: next as unknown as Prisma.InputJsonValue,
        lastError: msg.slice(0, 2000),
      },
    });
    return { ok: false, code: "watch_stop", messageSafe: msg };
  }
}
