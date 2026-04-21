import { OwnedMediaKind, OwnedMediaReviewStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { prisma } from "@/lib/db";
import { roadPostPublicWhere } from "@/lib/content/content-hub-visibility";
import { roadPostImageSrc, type RoadPostCard } from "@/lib/content/content-hub-queries";
import type { RoadVisual } from "./types";

function dedupeBySrc(vis: RoadVisual[]): RoadVisual[] {
  const seen = new Set<string>();
  const out: RoadVisual[] = [];
  for (const v of vis) {
    const k = v.src.trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}

async function loadPoolUncached(): Promise<RoadVisual[]> {
  const out: RoadVisual[] = [];

  const owned = await prisma.ownedMediaAsset
    .findMany({
      where: {
        kind: OwnedMediaKind.IMAGE,
        reviewStatus: OwnedMediaReviewStatus.APPROVED,
        isPublic: true,
      },
      orderBy: [{ eventDate: "desc" }, { updatedAt: "desc" }],
      take: 36,
      select: {
        id: true,
        title: true,
        publicUrl: true,
        countySlug: true,
        city: true,
        description: true,
      },
    })
    .catch(() => []);

  for (const r of owned) {
    const fromDb = r.publicUrl?.trim();
    const src = fromDb && fromDb.length > 0 ? fromDb : `/api/owned-campaign-media/${r.id}/file`;
    out.push({
      id: `owned-${r.id}`,
      src,
      alt: r.title || "Campaign field photo from Arkansas",
      label: [r.countySlug, r.city, r.title].filter(Boolean).join(" · ") || r.title,
      countySlug: r.countySlug,
      source: "owned",
    });
  }

  const posts = await prisma.syncedPost
    .findMany({
      where: roadPostPublicWhere,
      orderBy: [{ publishedAt: "desc" }],
      take: 36,
      include: { heroMedia: true },
    })
    .catch(() => [] as RoadPostCard[]);

  for (const p of posts) {
    const src = roadPostImageSrc(p)?.trim();
    if (!src) continue;
    out.push({
      id: `substack-${p.id}`,
      src,
      alt: p.title || "Field note from the road",
      label: p.title,
      countySlug: p.countySlug?.trim() || null,
      source: "substack",
    });
  }

  return dedupeBySrc(out);
}

/**
 * Real campaign + road images from the warehouse (public-approved owned media + Substack / road posts with art).
 * Cached a few minutes to avoid hammering the DB on every navigation.
 */
export const getPublicRoadVisualPool = unstable_cache(
  loadPoolUncached,
  ["public-road-visual-pool"],
  { revalidate: 180 }
);

/** When the DB has no art yet — legacy campaign photography (swap later). */
export function getBrandPlaceholderRoadVisuals(): RoadVisual[] {
  return [
    {
      id: "brand-banner",
      src: brandMediaFromLegacySite.statewideBanner,
      alt: brandMediaFromLegacySite.statewideBannerAlt,
      label: "Arkansas",
      countySlug: null,
      source: "brand",
    },
    {
      id: "brand-portrait",
      src: brandMediaFromLegacySite.kellyPortrait,
      alt: brandMediaFromLegacySite.kellyPortraitAlt,
      label: "Kelly on the road",
      countySlug: null,
      source: "brand",
    },
  ];
}
