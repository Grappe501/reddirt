/**
 * Derivative **planning** for campaign media — thumbnails, web JPEGs, crops, video proxies.
 * Workers (future) create new `OwnedMediaAsset` rows with `parentAssetId` + `derivativeType` and optional
 * `OwnedMediaDerivativeJob` status transitions. No raw disk paths; Supabase or local object keys only.
 */

import type { OwnedMediaDerivativeType, Prisma } from "@prisma/client";
import { OwnedMediaDerivativeJobStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export const DERIVATIVE_PLAN_DESCRIPTORS: {
  type: OwnedMediaDerivativeType;
  label: string;
  /** Hint for worker selection (image vs video pipeline). */
  category: "image" | "video";
}[] = [
  { type: "THUMBNAIL", label: "Preview thumbnail (grid)", category: "image" },
  { type: "WEB_JPEG", label: "Web-optimised full JPEG", category: "image" },
  { type: "CROP_SQUARE", label: "Square (1:1) crop for feeds", category: "image" },
  { type: "CROP_PORTRAIT", label: "Portrait (4:5) crop", category: "image" },
  { type: "CROP_STORY", label: "Story / vertical (9:16) crop", category: "image" },
  { type: "VIDEO_PROXY", label: "Video proxy (720p/1080p mezz)", category: "video" },
  { type: "VIDEO_POSTER", label: "Video poster / poster frame", category: "video" },
];

/**
 * Enqueue the standard derivative **plan** for a source master (idempotent on source + type + PLANNED).
 * TODO: de-dupe with unique constraint if we add a partial unique in a later migration.
 */
export async function planDefaultDerivativeJobsForSource(
  sourceAssetId: string,
  options?: { kinds?: OwnedMediaDerivativeType[] }
): Promise<{ created: number; skipped: number }> {
  if (!sourceAssetId) return { created: 0, skipped: 0 };
  const kinds = options?.kinds?.length
    ? DERIVATIVE_PLAN_DESCRIPTORS.filter((d) => options.kinds!.includes(d.type))
    : DERIVATIVE_PLAN_DESCRIPTORS;

  let created = 0;
  let skipped = 0;
  for (const d of kinds) {
    const existing = await prisma.ownedMediaDerivativeJob.findFirst({
      where: {
        sourceAssetId,
        targetDerivativeType: d.type,
        status: { in: [OwnedMediaDerivativeJobStatus.PLANNED, OwnedMediaDerivativeJobStatus.QUEUED, OwnedMediaDerivativeJobStatus.RUNNING] },
      },
    });
    if (existing) {
      skipped += 1;
      continue;
    }
    const payload: Prisma.InputJsonValue = { label: d.label, category: d.category };
    await prisma.ownedMediaDerivativeJob.create({
      data: {
        sourceAssetId,
        targetDerivativeType: d.type,
        status: OwnedMediaDerivativeJobStatus.PLANNED,
        priority: 0,
        payloadJson: payload,
      },
    });
    created += 1;
  }
  return { created, skipped };
}
