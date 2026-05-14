import { prisma } from "@/lib/db";
import { findKellyConfirmedCalendarSource, findKellyTentativeCalendarSource } from "@/lib/calendar/kelly-google-calendar-policy";

export type CalendarSyncReadinessReport = {
  ready: boolean;
  anchorCalendarSourcePresent: boolean;
  tentativeSourcePresent: boolean;
  confirmedSourcePresent: boolean;
  refreshTokenPresent: boolean;
  syncEnabled: boolean;
  lastSync?: string;
  conflictCount: number;
  blockers: string[];
};

function hasRefreshToken(source: { oauthJson: unknown } | null): boolean {
  const oauth = (source?.oauthJson ?? {}) as { refresh_token?: string };
  return Boolean(oauth.refresh_token);
}

export async function buildCalendarSyncReadinessReport(): Promise<CalendarSyncReadinessReport> {
  const blockers: string[] = [];
  try {
    const anchorId = process.env.KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID?.trim();
    const [anchor, tentative, confirmed, conflictCount] = await Promise.all([
      anchorId ? prisma.calendarSource.findUnique({ where: { id: anchorId } }) : Promise.resolve(null),
      findKellyTentativeCalendarSource(),
      findKellyConfirmedCalendarSource(),
      prisma.campaignEvent.count({ where: { syncReviewNeeded: true } }),
    ]);
    if (!anchor) blockers.push("KELLY_GOOGLE_ANCHOR_CALENDAR_SOURCE_ID missing or not found");
    if (!tentative) blockers.push("Kelly Tentative CalendarSource missing");
    if (!confirmed) blockers.push("Kelly Confirmed CalendarSource missing");
    const refreshTokenPresent = hasRefreshToken(anchor) && hasRefreshToken(tentative) && hasRefreshToken(confirmed);
    if (!refreshTokenPresent) blockers.push("Refresh token missing on anchor/tentative/confirmed source");
    const syncEnabled = Boolean(tentative?.syncEnabled && confirmed?.syncEnabled);
    if (!syncEnabled) blockers.push("Kelly Google source sync not enabled");
    const lastDates = [tentative?.lastIncrementalAt, tentative?.lastFullSyncAt, confirmed?.lastIncrementalAt, confirmed?.lastFullSyncAt]
      .filter((d): d is Date => Boolean(d))
      .sort((a, b) => b.getTime() - a.getTime());
    return {
      ready: blockers.length === 0,
      anchorCalendarSourcePresent: Boolean(anchor),
      tentativeSourcePresent: Boolean(tentative),
      confirmedSourcePresent: Boolean(confirmed),
      refreshTokenPresent,
      syncEnabled,
      lastSync: lastDates[0]?.toISOString(),
      conflictCount,
      blockers,
    };
  } catch (e) {
    return {
      ready: false,
      anchorCalendarSourcePresent: false,
      tentativeSourcePresent: false,
      confirmedSourcePresent: false,
      refreshTokenPresent: false,
      syncEnabled: false,
      conflictCount: 0,
      blockers: [e instanceof Error ? e.message : "calendar sync readiness failed"],
    };
  }
}
