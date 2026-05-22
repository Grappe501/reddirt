import { CalendarSourceType } from "@prisma/client";
import { prisma } from "@/lib/db";

export type SafeCalendarSourceStatus = {
  id: string;
  name: string;
  sourceType: string;
  externalCalendarId: string;
  syncEnabled: boolean;
  hasOauthJson: boolean;
  hasRefreshToken: boolean;
};

export function hasGoogleRefreshToken(oauthJson: unknown): boolean {
  const oauth = (oauthJson ?? {}) as { refresh_token?: unknown };
  return typeof oauth.refresh_token === "string" && oauth.refresh_token.trim().length > 0;
}

export async function listSafeCalendarSourceStatuses(): Promise<SafeCalendarSourceStatus[]> {
  const sources = await prisma.calendarSource.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      id: true,
      label: true,
      displayName: true,
      sourceType: true,
      externalCalendarId: true,
      syncEnabled: true,
      oauthJson: true,
    },
  });
  return sources.map((source) => ({
    id: source.id,
    name: source.displayName ?? source.label,
    sourceType: source.sourceType,
    externalCalendarId: source.externalCalendarId,
    syncEnabled: source.syncEnabled,
    hasOauthJson: Boolean(source.oauthJson && Object.keys(source.oauthJson as Record<string, unknown>).length > 0),
    hasRefreshToken: hasGoogleRefreshToken(source.oauthJson),
  }));
}

export async function getKellyGoogleLaneStatus() {
  const [tentative, confirmed] = await Promise.all([
    prisma.calendarSource.findFirst({
      where: { sourceType: CalendarSourceType.KELLY_GOOGLE_TENTATIVE },
      select: { id: true, displayName: true, externalCalendarId: true, syncEnabled: true, oauthJson: true },
    }),
    prisma.calendarSource.findFirst({
      where: { sourceType: CalendarSourceType.KELLY_GOOGLE_CONFIRMED },
      select: { id: true, displayName: true, externalCalendarId: true, syncEnabled: true, oauthJson: true },
    }),
  ]);
  return {
    tentative: tentative
      ? {
          id: tentative.id,
          name: tentative.displayName ?? "Kelly Campaign — Tentative",
          externalCalendarId: tentative.externalCalendarId,
          syncEnabled: tentative.syncEnabled,
          hasRefreshToken: hasGoogleRefreshToken(tentative.oauthJson),
        }
      : null,
    confirmed: confirmed
      ? {
          id: confirmed.id,
          name: confirmed.displayName ?? "Kelly Campaign — Confirmed",
          externalCalendarId: confirmed.externalCalendarId,
          syncEnabled: confirmed.syncEnabled,
          hasRefreshToken: hasGoogleRefreshToken(confirmed.oauthJson),
        }
      : null,
  };
}
