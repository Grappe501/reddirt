/**
 * Public county presence — visibility only, no Victory OS / intelligence metrics.
 * Verified visits = counties with at least one past published public campaign event.
 * Upcoming = published public events only (same gating as /events).
 */

import { prisma } from "@/lib/db";
import { whereLivePublicOnWebsite, queryPublicCampaignEvents } from "@/lib/calendar/public-events";
import type { PublicCampaignEvent } from "@/lib/calendar/public-event-types";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";
import { isPrismaDatabaseUnavailable, logPrismaDatabaseUnavailable } from "@/lib/prisma-connectivity";
import arkansasCounties75 from "../../../data/calendar-command-center/arkansas-counties-75.json";

export type PublicCountyPresenceRow = {
  displayName: string;
  slug: string;
  /** True only when a published public campaign event exists in this county (past). */
  visitVerified: boolean;
  /** Month/year of most recent verified visit, e.g. "June 2026" */
  lastVerifiedVisitLabel: string | null;
  upcomingEventCount: number;
};

export type PublicCountyPresenceSnapshot = {
  counties: PublicCountyPresenceRow[];
  visitedCount: number;
  totalCounties: number;
  upcomingEvents: PublicCampaignEvent[];
};

function normalizeCountyName(name: string): string {
  return name.trim().toLowerCase().replace(/\./g, "");
}

function slugFromDisplayName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, "-");
}

function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: PUBLIC_CALENDAR_DEFAULT_TZ,
  }).format(date);
}

export async function loadPublicCountyPresence(): Promise<PublicCountyPresenceSnapshot> {
  const totalCounties = arkansasCounties75.counties.length;
  const empty: PublicCountyPresenceSnapshot = {
    counties: arkansasCounties75.counties.map((displayName) => ({
      displayName,
      slug: slugFromDisplayName(displayName),
      visitVerified: false,
      lastVerifiedVisitLabel: null,
      upcomingEventCount: 0,
    })),
    visitedCount: 0,
    totalCounties,
    upcomingEvents: [],
  };

  try {
    const now = new Date();
    const [dbCounties, pastEvents, upcomingEvents] = await Promise.all([
      prisma.county.findMany({
        select: { slug: true, displayName: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.campaignEvent.findMany({
        where: {
          ...whereLivePublicOnWebsite(),
          endAt: { lt: now },
          countyId: { not: null },
        },
        select: {
          startAt: true,
          county: { select: { slug: true, displayName: true } },
        },
        orderBy: { startAt: "desc" },
      }),
      queryPublicCampaignEvents({ range: "all_upcoming" }, { take: 100 }),
    ]);

    const slugByNormalizedName = new Map<string, string>();
    for (const c of dbCounties) {
      slugByNormalizedName.set(normalizeCountyName(c.displayName), c.slug);
    }

    const visitBySlug = new Map<string, { lastStart: Date }>();
    for (const ev of pastEvents) {
      if (!ev.county) continue;
      const existing = visitBySlug.get(ev.county.slug);
      if (!existing || ev.startAt > existing.lastStart) {
        visitBySlug.set(ev.county.slug, { lastStart: ev.startAt });
      }
    }

    const upcomingBySlug = new Map<string, number>();
    for (const ev of upcomingEvents) {
      if (!ev.county) continue;
      upcomingBySlug.set(ev.county.slug, (upcomingBySlug.get(ev.county.slug) ?? 0) + 1);
    }

    const counties: PublicCountyPresenceRow[] = arkansasCounties75.counties.map((displayName) => {
      const slug = slugByNormalizedName.get(normalizeCountyName(displayName)) ?? slugFromDisplayName(displayName);
      const visit = visitBySlug.get(slug);
      return {
        displayName,
        slug,
        visitVerified: Boolean(visit),
        lastVerifiedVisitLabel: visit ? formatMonthYear(visit.lastStart) : null,
        upcomingEventCount: upcomingBySlug.get(slug) ?? 0,
      };
    });

    const visitedCount = counties.filter((c) => c.visitVerified).length;

    return { counties, visitedCount, totalCounties, upcomingEvents };
  } catch (e) {
    if (isPrismaDatabaseUnavailable(e)) {
      logPrismaDatabaseUnavailable("loadPublicCountyPresence", e);
      return empty;
    }
    throw e;
  }
}
