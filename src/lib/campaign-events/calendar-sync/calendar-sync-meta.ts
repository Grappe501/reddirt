import type { CalendarMatchMethod, LedgerCalendarTruthStatus } from "./calendar-sync-truth-types";

export type LedgerCalendarSyncMeta = {
  version: 1;
  truthStatus: LedgerCalendarTruthStatus;
  matchedBy: CalendarMatchMethod;
  googleEventId: string | null;
  googleCalendarId: string | null;
  googleEventUrl: string | null;
  sourceCalendarName: string | null;
  prismaGoogleSyncStatus: string | null;
  lastGoogleSeenAt: string | null;
  lastLedgerUpdatedAt: string;
  normalizedJsonSourceAt: string | null;
  syncWarning: string | null;
  syncError: string | null;
  writeEnabled: false;
  computedAt: string;
};

export function parseCalendarSyncMetaFromFactCard(raw: unknown): LedgerCalendarSyncMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const m = o._calendarSync;
  if (!m || typeof m !== "object") return null;
  const meta = m as Record<string, unknown>;
  if (meta.version !== 1) return null;
  if (typeof meta.truthStatus !== "string") return null;
  return meta as unknown as LedgerCalendarSyncMeta;
}

export function attachCalendarSyncMeta(factCardObject: object, meta: LedgerCalendarSyncMeta): object {
  return { ...(factCardObject as Record<string, unknown>), _calendarSync: meta };
}
