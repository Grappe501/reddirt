/**
 * Fit-ranked publish backlog — Unknown/draft stills scored for website surfaces.
 * Scores propose; operator still confirms geography + Approve.
 */
import "server-only";

import { applyPhotoEvidenceOverlay } from "@/lib/campaign-media/apply-evidence-overlay";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";
import { buildEvidencePublishQueue } from "@/lib/campaign-media/evidence-publish-queue";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { scorePhotoWebsiteFit } from "@/lib/campaign-media/website-fit-scorer";
import { buildWebsiteSurfaceInventory } from "@/lib/campaign-media/website-surface-catalog";

export type FitBacklogRow = {
  photoId: string;
  title: string;
  county: string;
  unknown: boolean;
  needsApproval: boolean;
  bestSurface: string | null;
  bestScore: number;
  rankingsTop3: Array<{ surface: string; score: number }>;
  inventoryNote: string;
  href: string;
};

export type FitRankedBacklog = {
  generatedAt: string;
  total: number;
  rows: FitBacklogRow[];
};

export function buildFitRankedBacklog(input?: { limit?: number }): FitRankedBacklog {
  const limit = Math.min(Math.max(Number(input?.limit) || 24, 1), 48);
  const queue = buildEvidencePublishQueue();
  const unknownIds = new Set(queue.buckets.unknownCounty.map((r) => r.id));
  const needsIds = new Set(queue.buckets.needsApproval.map((r) => r.id));
  const draftIds = new Set(queue.buckets.draftIngest.map((r) => r.id));
  const targetIds = [...new Set([...unknownIds, ...needsIds, ...draftIds])];

  const store = loadPhotoEvidenceStore();
  const live = listCampaignPhotosLive(store);
  const byId = new Map(live.map((p) => [p.id, p]));
  const inventory = buildWebsiteSurfaceInventory(live);

  const scored: FitBacklogRow[] = [];
  for (const id of targetIds) {
    const photo = byId.get(id);
    if (!photo) continue;
    const overlay = store.photos[id] ?? null;
    const merged = applyPhotoEvidenceOverlay(photo, overlay);
    const fit = scorePhotoWebsiteFit({
      photo: merged,
      proposedOverlay: overlay,
      inventory,
    });
    const county = String(merged.campaign?.county ?? "Unknown").trim() || "Unknown";
    scored.push({
      photoId: id,
      title: String(merged.accessibility?.caption ?? id).slice(0, 100),
      county,
      unknown: unknownIds.has(id),
      needsApproval: needsIds.has(id),
      bestSurface: fit.best?.surface ?? null,
      bestScore: fit.best?.score ?? 0,
      rankingsTop3: fit.rankings.slice(0, 3).map((r) => ({ surface: r.surface, score: r.score })),
      inventoryNote: fit.inventoryNote,
      href: `/admin/evidence-workbench?tab=identify&id=${encodeURIComponent(id)}`,
    });
  }

  scored.sort((a, b) => b.bestScore - a.bestScore || a.photoId.localeCompare(b.photoId));

  return {
    generatedAt: new Date().toISOString(),
    total: scored.length,
    rows: scored.slice(0, limit),
  };
}
