/**
 * Versioned sync telemetry for Staff Gmail monitor — stored in `StaffGmailAccount.gmailSyncState`.
 * Never persist message bodies, attachments, or tokens.
 */

export const GMAIL_SYNC_STATE_VERSION = 1 as const;

/** Stored watch lifecycle (EMAIL-GMAIL-WATCH-1.2+). Legacy values are normalized in `parseGmailSyncState`. */
export type GmailWatchStatusV1 =
  | "ACTIVE"
  | "NOT_CONFIGURED"
  | "ERROR"
  | "EXPIRED"
  | "STOPPED";

export type GmailSyncStateV1 = {
  version: typeof GMAIL_SYNC_STATE_VERSION;
  lastManualSyncAt: string | null;
  lastSuccessfulSyncAt: string | null;
  lastErrorAt: string | null;
  lastErrorCode: string | null;
  /** Short operator-safe message; no tokens or raw API payloads. */
  lastErrorMessageSafe: string | null;
  /** From `users.getProfile` / post-sync cursor; used for `history.list` foundation. */
  lastHistoryId: string | null;
  lastFullSyncAt: string | null;
  lastMetadataSyncCount: number | null;
  lastLabelsCount: number | null;
  lastUniqueSenderCount: number | null;
  lastUnreadInSampleCount: number | null;
  lastNewestInternalDateMs: string | null;
  lastHistoryDryRunAt: string | null;
  lastHistoryDryRunChangedCount: number | null;
  lastHistoryDryRunStatus: "skipped_no_cursor" | "ok" | "404_need_full_sync" | "error" | null;
  lastHistoryDryRunMessageSafe: string | null;
  /** From `users.watch` response `historyId` (push cursor — not necessarily equal to profile historyId). */
  watchHistoryId: string | null;
  /** Gmail API `expiration` (ms since epoch, string). */
  watchExpiration: string | null;
  /**
   * Last known watch registration outcome.
   * Use `resolveDisplayWatchStatus()` for UI — compares wall clock to `watchExpiration` when `ACTIVE`.
   */
  watchStatus: GmailWatchStatusV1 | null;
  lastWatchErrorAt: string | null;
  lastWatchErrorCode: string | null;
  lastWatchErrorMessageSafe: string | null;
  /** When `history.list` reports 404 for `lastHistoryId` — requires full metadata sync before trusting cursor. */
  historyCursorStale: boolean | null;
  requiresFullSync: boolean | null;
  /** Pub/Sub push scaffold — last notification seen (no message bodies). */
  lastPubSubNotificationAt: string | null;
  lastPubSubHistoryId: string | null;
  pendingHistoryId: string | null;
  pubSubNotificationCount: number | null;
  /** Manual “history preview” (EMAIL-GMAIL-WATCH-1.2) — counts only; no bodies. */
  lastHistoryPreviewAt: string | null;
  lastHistoryPreviewMessagesAdded: number | null;
  lastHistoryPreviewMessagesDeleted: number | null;
  lastHistoryPreviewLabelsAdded: number | null;
  lastHistoryPreviewLabelsRemoved: number | null;
  lastHistoryPreviewPages: number | null;
  lastHistoryPreviewMessageSafe: string | null;
  /** Last non-preview history API error (safe excerpt only). */
  lastHistoryErrorAt: string | null;
  lastHistoryErrorCode: string | null;
  lastHistoryErrorMessageSafe: string | null;
};

export type GmailSyncState = GmailSyncStateV1;

const EMPTY: GmailSyncStateV1 = {
  version: GMAIL_SYNC_STATE_VERSION,
  lastManualSyncAt: null,
  lastSuccessfulSyncAt: null,
  lastErrorAt: null,
  lastErrorCode: null,
  lastErrorMessageSafe: null,
  lastHistoryId: null,
  lastFullSyncAt: null,
  lastMetadataSyncCount: null,
  lastLabelsCount: null,
  lastUniqueSenderCount: null,
  lastUnreadInSampleCount: null,
  lastNewestInternalDateMs: null,
  lastHistoryDryRunAt: null,
  lastHistoryDryRunChangedCount: null,
  lastHistoryDryRunStatus: null,
  lastHistoryDryRunMessageSafe: null,
  watchHistoryId: null,
  watchExpiration: null,
  watchStatus: "NOT_CONFIGURED",
  lastWatchErrorAt: null,
  lastWatchErrorCode: null,
  lastWatchErrorMessageSafe: null,
  historyCursorStale: null,
  requiresFullSync: null,
  lastPubSubNotificationAt: null,
  lastPubSubHistoryId: null,
  pendingHistoryId: null,
  pubSubNotificationCount: null,
  lastHistoryPreviewAt: null,
  lastHistoryPreviewMessagesAdded: null,
  lastHistoryPreviewMessagesDeleted: null,
  lastHistoryPreviewLabelsAdded: null,
  lastHistoryPreviewLabelsRemoved: null,
  lastHistoryPreviewPages: null,
  lastHistoryPreviewMessageSafe: null,
  lastHistoryErrorAt: null,
  lastHistoryErrorCode: null,
  lastHistoryErrorMessageSafe: null,
};

function asRecord(v: unknown): Record<string, unknown> {
  if (v != null && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return {};
}

function normalizeWatchStatus(raw: unknown): GmailWatchStatusV1 {
  if (raw === "ACTIVE" || raw === "ERROR" || raw === "EXPIRED" || raw === "STOPPED" || raw === "NOT_CONFIGURED") {
    return raw;
  }
  if (raw === "error") return "ERROR";
  if (raw === "idle" || raw === "pending_implementation" || raw == null) {
    return "NOT_CONFIGURED";
  }
  return "NOT_CONFIGURED";
}

/**
 * UI helper: if watch was registered but `expiration` is in the past, surface EXPIRED.
 */
export function resolveDisplayWatchStatus(state: GmailSyncStateV1): GmailWatchStatusV1 {
  const base = normalizeWatchStatus(state.watchStatus);
  if (base !== "ACTIVE" || !state.watchExpiration) return base;
  const exp = Number(state.watchExpiration);
  if (!Number.isFinite(exp) || exp <= 0) return base;
  if (Date.now() > exp) return "EXPIRED";
  return "ACTIVE";
}

export function parseGmailSyncState(raw: unknown): GmailSyncStateV1 {
  const o = asRecord(raw);
  if (o.version === GMAIL_SYNC_STATE_VERSION) {
    const merged = {
      ...EMPTY,
      ...o,
      version: GMAIL_SYNC_STATE_VERSION,
      watchStatus: normalizeWatchStatus(o.watchStatus),
    } as GmailSyncStateV1;
    return merged;
  }
  return { ...EMPTY };
}

export function mergeGmailSyncStatePatch(
  current: unknown,
  patch: Partial<GmailSyncStateV1>
): GmailSyncStateV1 {
  const base = parseGmailSyncState(current);
  return { ...base, ...patch, version: GMAIL_SYNC_STATE_VERSION };
}
