import { OwnedMediaKind, OwnedMediaReviewStatus } from "@prisma/client";
import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";
import { prisma } from "@/lib/db";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";

export type AiGroupCuration = {
  scannedAt?: string;
  model?: string;
  groupInteractionScore: number;
  kellyLikelyPresent?: boolean;
  crowdOrGroupLikely?: boolean;
  suggestedAltText?: string;
  sceneSummary?: string;
  rationale?: string;
};

function parseCuration(meta: unknown): AiGroupCuration | null {
  if (!meta || typeof meta !== "object") return null;
  const m = meta as Record<string, unknown>;
  const c = m.aiGroupCuration;
  if (!c || typeof c !== "object") return null;
  const o = c as Record<string, unknown>;
  const score = o.groupInteractionScore;
  if (typeof score !== "number" || Number.isNaN(score)) return null;
  return {
    scannedAt: typeof o.scannedAt === "string" ? o.scannedAt : undefined,
    model: typeof o.model === "string" ? o.model : undefined,
    groupInteractionScore: score,
    kellyLikelyPresent: typeof o.kellyLikelyPresent === "boolean" ? o.kellyLikelyPresent : undefined,
    crowdOrGroupLikely: typeof o.crowdOrGroupLikely === "boolean" ? o.crowdOrGroupLikely : undefined,
    suggestedAltText: typeof o.suggestedAltText === "string" ? o.suggestedAltText : undefined,
    sceneSummary: typeof o.sceneSummary === "string" ? o.sceneSummary : undefined,
    rationale: typeof o.rationale === "string" ? o.rationale : undefined,
  };
}

/**
 * AI-curated stills (vision scan stored on `enrichmentMetadata.aiGroupCuration`).
 * Only APPROVED + public images; requires prior run of `npm run photos:ai-curate-kelly-groups`.
 */
export async function listKellyGroupPhotosForSite(options: {
  limit: number;
  minScore: number;
}): Promise<CampaignTrailPhoto[]> {
  try {
    const rows = await prisma.ownedMediaAsset.findMany({
      where: {
        kind: OwnedMediaKind.IMAGE,
        isPublic: true,
        reviewStatus: OwnedMediaReviewStatus.APPROVED,
        mimeType: { startsWith: "image/" },
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        enrichmentMetadata: true,
      },
      take: 400,
      orderBy: { updatedAt: "desc" },
    });

    const scored: { photo: CampaignTrailPhoto; score: number }[] = [];
    for (const r of rows) {
      const c = parseCuration(r.enrichmentMetadata);
      if (!c || c.groupInteractionScore < options.minScore) continue;
      const alt =
        (c.suggestedAltText && c.suggestedAltText.trim()) ||
        `Kelly Grappe on the campaign trail — ${r.title || r.fileName}`;
      scored.push({
        score: c.groupInteractionScore,
        photo: {
          id: `db-${r.id}`,
          src: getOwnedFilePublicPath(r.id),
          alt,
          caption: c.sceneSummary?.trim() || undefined,
        },
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, options.limit).map((s) => s.photo);
  } catch {
    return [];
  }
}

/**
 * Homepage / sections: AI picks first, then static trail sync, de-duplicated by `src`.
 */
export async function mergeKellyGroupAndTrailPhotos(options: {
  curatedLimit: number;
  staticPhotos: CampaignTrailPhoto[];
  staticLimit: number;
  minScore: number;
}): Promise<CampaignTrailPhoto[]> {
  const curated = await listKellyGroupPhotosForSite({
    limit: options.curatedLimit,
    minScore: options.minScore,
  });
  const staticSlice = options.staticPhotos.slice(0, options.staticLimit);
  const seen = new Set<string>();
  const out: CampaignTrailPhoto[] = [];
  for (const p of curated) {
    if (seen.has(p.src)) continue;
    seen.add(p.src);
    out.push(p);
  }
  for (const p of staticSlice) {
    if (seen.has(p.src)) continue;
    seen.add(p.src);
    out.push(p);
  }
  return out;
}
