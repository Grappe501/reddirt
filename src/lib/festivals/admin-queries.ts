import { FestivalIngestReviewStatus, FestivalSourceChannel, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type FestivalIngestAdminRow = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  city: string | null;
  reviewStatus: FestivalIngestReviewStatus;
  isVisibleOnSite: boolean;
  sourceUrl: string;
  sourceChannel: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterInfoUrl: string | null;
  county: { id: string; displayName: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FestivalIngestListChannel = "all" | "ingest" | "public_form";

export async function listFestivalIngestsForAdmin(options?: {
  status?: "all" | "pending" | "approved" | "rejected";
  channel?: FestivalIngestListChannel;
  limit?: number;
}): Promise<FestivalIngestAdminRow[]> {
  const { status = "all", limit = 300, channel = "all" } = options ?? {};
  const statusWhere: Prisma.ArkansasFestivalIngestWhereInput =
    status === "pending"
      ? { reviewStatus: FestivalIngestReviewStatus.PENDING_REVIEW }
      : status === "approved"
        ? { reviewStatus: FestivalIngestReviewStatus.APPROVED }
        : status === "rejected"
          ? { reviewStatus: FestivalIngestReviewStatus.REJECTED }
          : {};
  const channelWhere: Prisma.ArkansasFestivalIngestWhereInput =
    channel === "ingest" ? { sourceChannel: { not: FestivalSourceChannel.PUBLIC_FORM } } : channel === "public_form" ? { sourceChannel: FestivalSourceChannel.PUBLIC_FORM } : {};
  const where: Prisma.ArkansasFestivalIngestWhereInput = { ...statusWhere, ...channelWhere };

  const rows = await prisma.arkansasFestivalIngest.findMany({
    where,
    orderBy: { startAt: "asc" },
    take: limit,
    include: {
      county: { select: { id: true, displayName: true, slug: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    startAt: r.startAt,
    endAt: r.endAt,
    city: r.city,
    reviewStatus: r.reviewStatus,
    isVisibleOnSite: r.isVisibleOnSite,
    sourceUrl: r.sourceUrl,
    sourceChannel: r.sourceChannel,
    submitterName: r.submitterName,
    submitterEmail: r.submitterEmail,
    submitterInfoUrl: r.submitterInfoUrl,
    county: r.county,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function countPendingFestivalIngests(): Promise<number> {
  return prisma.arkansasFestivalIngest.count({
    where: { reviewStatus: FestivalIngestReviewStatus.PENDING_REVIEW },
  });
}

/** Pending rows submitted via the public /events form (needs staff review). */
export async function countPendingPublicFormFestivalIngests(): Promise<number> {
  return prisma.arkansasFestivalIngest.count({
    where: {
      reviewStatus: FestivalIngestReviewStatus.PENDING_REVIEW,
      sourceChannel: FestivalSourceChannel.PUBLIC_FORM,
    },
  });
}
