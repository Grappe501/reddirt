import {
  ExternalMediaMatchTier,
  ExternalMediaReviewStatus,
  ExternalMediaSourceType,
} from "@prisma/client";
import { prisma } from "@/lib/db";

function startOfDayChicago(d = new Date()): Date {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return new Date(Date.UTC(y, m - 1, day, 5, 0, 0));
}

export type PressMonitorWorkbenchSummary = {
  mentionsToday: number;
  editorialsOpinion: number;
  tvMentions: number;
  responseNeeded: number;
  needsAmplification: number;
  pendingReview: number;
};

export async function getPressMonitorWorkbenchSummary(): Promise<PressMonitorWorkbenchSummary> {
  const start = startOfDayChicago();
  const [
    mentionsToday,
    editorialsOpinion,
    tvMentions,
    responseNeeded,
    needsAmplification,
    pendingReview,
  ] = await Promise.all([
    prisma.externalMediaMention.count({
      where: { discoveredAt: { gte: start } },
    }),
    prisma.externalMediaMention.count({
      where: {
        OR: [{ isEditorial: true }, { isOpinion: true }],
        reviewStatus: { not: ExternalMediaReviewStatus.REJECTED },
      },
    }),
    prisma.externalMediaMention.count({
      where: {
        sourceType: ExternalMediaSourceType.TV,
        reviewStatus: { not: ExternalMediaReviewStatus.REJECTED },
      },
    }),
    prisma.externalMediaMention.count({
      where: { responseNeeded: true, reviewStatus: { not: ExternalMediaReviewStatus.REJECTED } },
    }),
    prisma.externalMediaMention.count({
      where: { needsAmplification: true, reviewStatus: { not: ExternalMediaReviewStatus.REJECTED } },
    }),
    prisma.externalMediaMention.count({
      where: {
        OR: [
          { reviewStatus: ExternalMediaReviewStatus.PENDING },
          { reviewStatus: ExternalMediaReviewStatus.NEEDS_REVIEW },
        ],
        matchTier: { not: ExternalMediaMatchTier.NOT_RELEVANT },
      },
    }),
  ]);

  return {
    mentionsToday,
    editorialsOpinion,
    tvMentions,
    responseNeeded,
    needsAmplification,
    pendingReview,
  };
}
