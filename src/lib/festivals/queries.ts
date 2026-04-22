import { FestivalIngestReviewStatus, FestivalSourceChannel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { PublicFestivalCard } from "./types";

function isHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s);
}

function toCard(r: {
  id: string;
  name: string;
  shortDescription: string | null;
  startAt: Date;
  endAt: Date;
  city: string | null;
  venueName: string | null;
  sourceUrl: string;
  sourceChannel: string;
  submitterInfoUrl: string | null;
  county: { displayName: string; slug: string } | null;
}): PublicFestivalCard {
  const linkFromSubmitter = r.submitterInfoUrl && isHttpUrl(r.submitterInfoUrl) ? r.submitterInfoUrl : null;
  const linkFromSource =
    r.sourceChannel === FestivalSourceChannel.PUBLIC_FORM
      ? null
      : isHttpUrl(r.sourceUrl)
        ? r.sourceUrl
        : null;
  const linkUrl = linkFromSubmitter ?? linkFromSource;
  return {
    id: r.id,
    name: r.name,
    shortDescription: r.shortDescription,
    startAt: r.startAt.toISOString(),
    endAt: r.endAt.toISOString(),
    city: r.city,
    countyDisplayName: r.county?.displayName ?? null,
    countySlug: r.county?.slug ?? null,
    venueName: r.venueName,
    sourceUrl: r.sourceUrl,
    sourceChannel: r.sourceChannel,
    linkUrl,
  };
}

/** Upcoming approved + on-site fairs/festivals for the public campaign trail. */
export async function listPublicFestivalFeed(limit = 24): Promise<PublicFestivalCard[]> {
  try {
    const now = new Date();
    const rows = await prisma.arkansasFestivalIngest.findMany({
      where: {
        reviewStatus: FestivalIngestReviewStatus.APPROVED,
        isVisibleOnSite: true,
        endAt: { gte: now },
      },
      orderBy: { startAt: "asc" },
      take: limit,
      include: { county: { select: { displayName: true, slug: true } } },
    });
    return rows.map(toCard);
  } catch (e) {
    console.error("[festivals] listPublicFestivalFeed", e);
    return [];
  }
}

export async function getLatestCoveragePlan(): Promise<{
  generatedAt: Date;
  validFrom: Date;
  validTo: Date;
  payload: Prisma.JsonValue;
} | null> {
  try {
    const row = await prisma.festivalCoveragePlanSnapshot.findFirst({
      orderBy: { generatedAt: "desc" },
    });
    if (!row) return null;
    return {
      generatedAt: row.generatedAt,
      validFrom: row.validFrom,
      validTo: row.validTo,
      payload: row.payload,
    };
  } catch (e) {
    console.error("[festivals] getLatestCoveragePlan", e);
    return null;
  }
}
