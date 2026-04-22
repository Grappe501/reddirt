import { ExternalMediaReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function listPublicPressMentions(limit = 60) {
  return prisma.externalMediaMention.findMany({
    where: {
      showOnPublicSite: true,
      reviewStatus: ExternalMediaReviewStatus.APPROVED,
    },
    orderBy: [{ publishedAt: "desc" }, { discoveredAt: "desc" }],
    take: limit,
    include: { source: true, relatedCounty: true },
  });
}
