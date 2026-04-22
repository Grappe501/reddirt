import {
  ContentPlatform,
  InboundReviewStatus,
  type InboundContentItem,
  type SyncedPost,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export type PublicOrchestratorItem = InboundContentItem & {
  syncedPost: SyncedPost | null;
};

/** Shape for public feed / journal cards (no Prisma types in client-heavy trees). */
export type PublicFeedCardVM = {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  meta: string;
  imageSrc?: string;
  imageAlt?: string;
  ctaLabel: string;
};

export function toFeedCardVM(item: PublicOrchestratorItem): PublicFeedCardVM {
  const title = item.title?.trim() || "Update";
  const excerpt =
    item.excerpt?.trim() ||
    item.body?.trim().slice(0, 280) ||
    "Syndicated movement update — open the source link for the full piece.";
  const href = item.canonicalUrl?.trim() || "/from-the-road";
  const plat = platformLabel(item.sourcePlatform);
  const type = sourceTypeLabel(item.sourceType);
  const date =
    item.publishedAt != null
      ? item.publishedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : null;
  const meta = [date, plat, type].filter(Boolean).join(" · ");
  const imageSrc = item.syncedPost?.featuredImageUrl?.trim() || undefined;
  return {
    id: item.id,
    title,
    excerpt,
    href,
    meta,
    imageSrc,
    imageAlt: item.syncedPost?.title ?? title,
    ctaLabel: item.canonicalUrl ? "View source" : "Open campaign trail",
  };
}

/** Items approved for the campaign trail / journal: homepage rail and/or the former “updates” surface (same flag, merged). */
export async function listHomepageOrchestratorRail(limit = 6): Promise<PublicOrchestratorItem[]> {
  try {
    return await prisma.inboundContentItem.findMany({
      where: {
        OR: [{ visibleOnHomepageRail: true }, { visibleOnUpdatesPage: true }],
        reviewStatus: { in: [InboundReviewStatus.REVIEWED, InboundReviewStatus.FEATURED] },
      },
      include: { syncedPost: true },
      orderBy: [{ publishedAt: "desc" }, { syncTimestamp: "desc" }],
      take: limit,
    });
  } catch {
    return [];
  }
}

export function platformLabel(p: ContentPlatform): string {
  switch (p) {
    case ContentPlatform.SUBSTACK:
      return "Notebook";
    case ContentPlatform.FACEBOOK:
      return "Facebook";
    case ContentPlatform.INSTAGRAM:
      return "Instagram";
    case ContentPlatform.YOUTUBE:
      return "YouTube";
    default:
      return p;
  }
}

export function sourceTypeLabel(t: string): string {
  return t
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
