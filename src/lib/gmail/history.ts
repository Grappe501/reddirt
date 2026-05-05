/**
 * Gmail history.list foundation (gmail.metadata). No Pub/Sub — caller updates cursors after success.
 * Stale startHistoryId → 404 → treat as full metadata re-seed (EMAIL-GMAIL-SYNC-1.1 handles reporting only).
 */

import type { gmail_v1 } from "googleapis";

export type GmailHistoryDryRunResult =
  | {
      ok: true;
      newHistoryId: string | undefined;
      messageAddedCount: number;
      messagesAddedSampleIds: string[];
    }
  | { ok: false; code: "404" | "other"; messageSafe: string };

function safeErr(e: unknown): string {
  if (e instanceof Error) {
    return e.message.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 220);
  }
  return "history_list_failed";
}

export async function listGmailHistorySince(
  gmail: gmail_v1.Gmail,
  startHistoryId: string,
  maxResults = 100
): Promise<GmailHistoryDryRunResult> {
  try {
    const res = await gmail.users.history.list({
      userId: "me",
      startHistoryId,
      maxResults,
    });
    const history = res.data.history ?? [];
    const messagesAddedSampleIds: string[] = [];
    for (const h of history) {
      for (const ma of h.messagesAdded ?? []) {
        const id = ma.message?.id;
        if (id) messagesAddedSampleIds.push(id);
      }
    }
    return {
      ok: true,
      newHistoryId: res.data.historyId ?? undefined,
      messageAddedCount: messagesAddedSampleIds.length,
      messagesAddedSampleIds: messagesAddedSampleIds.slice(0, 25),
    };
  } catch (e: unknown) {
    const err = e as { code?: number | string };
    const codeNum = typeof err.code === "number" ? err.code : Number(err.code);
    if (codeNum === 404) {
      return {
        ok: false,
        code: "404",
        messageSafe: "history_id_stale_or_invalid_run_full_metadata_sync",
      };
    }
    return { ok: false, code: "other", messageSafe: safeErr(e) };
  }
}
