/**
 * Owned Media ↔ Evidence Workbench filename match (best-effort, no silent Approve).
 */
import "server-only";

import path from "node:path";
import { prisma } from "@/lib/db";
import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { listCampaignPhotosLive } from "@/lib/campaign-media/list-campaign-photos-live";
import { loadPhotoEvidenceStore } from "@/lib/campaign-media/evidence-store";

export type OwnedMediaEvidenceLink = {
  photoId: string;
  filename: string | null;
  linked: boolean;
  ownedMediaId: string | null;
  reason: string;
  reviewStatus?: string | null;
};

function basenameFromPhoto(photo: CampaignPhotoRecord): string | null {
  const original = photo.basic?.originalFilename?.trim();
  if (original) return path.basename(original);
  const src = String(photo.src ?? "").trim();
  if (!src) return null;
  try {
    return path.basename(decodeURIComponent(src.replace(/^\//, "")));
  } catch {
    return path.basename(src);
  }
}

export async function lookupOwnedMediaForPhoto(
  photoId: string,
): Promise<OwnedMediaEvidenceLink> {
  const id = String(photoId ?? "").trim();
  const store = loadPhotoEvidenceStore();
  const photo = listCampaignPhotosLive(store).find((p) => p.id === id);
  if (!photo) {
    return {
      photoId: id,
      filename: null,
      linked: false,
      ownedMediaId: null,
      reason: "Photo not found in live registry/drafts.",
    };
  }

  const filename = basenameFromPhoto(photo);
  if (!filename) {
    return {
      photoId: id,
      filename: null,
      linked: false,
      ownedMediaId: null,
      reason: "No filename on photo — cannot match Owned Media.",
    };
  }

  try {
    const asset = await prisma.ownedMediaAsset.findFirst({
      where: {
        OR: [
          { originalFileName: filename },
          { fileName: filename },
          { canonicalFileName: filename },
        ],
      },
      select: { id: true, reviewStatus: true },
    });
    if (!asset) {
      return {
        photoId: id,
        filename,
        linked: false,
        ownedMediaId: null,
        reason: `No OwnedMediaAsset match for ${filename}.`,
      };
    }
    return {
      photoId: id,
      filename,
      linked: true,
      ownedMediaId: asset.id,
      reason: `Matched OwnedMediaAsset ${asset.id}.`,
      reviewStatus: asset.reviewStatus,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      photoId: id,
      filename,
      linked: false,
      ownedMediaId: null,
      reason: `Owned Media DB unavailable (${msg.slice(0, 120)}).`,
    };
  }
}

/** Best-effort match report after intake — never writes Approve or overlays. */
export async function matchOwnedMediaForPhotoIds(
  photoIds: string[],
): Promise<{
  linked: number;
  unlinked: number;
  rows: OwnedMediaEvidenceLink[];
}> {
  const ids = [...new Set(photoIds.map((id) => String(id).trim()).filter(Boolean))].slice(0, 80);
  const rows: OwnedMediaEvidenceLink[] = [];
  for (const id of ids) {
    rows.push(await lookupOwnedMediaForPhoto(id));
  }
  return {
    linked: rows.filter((r) => r.linked).length,
    unlinked: rows.filter((r) => !r.linked).length,
    rows,
  };
}
