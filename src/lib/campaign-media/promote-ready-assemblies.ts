/**
 * Batch-promote ready Photo Pro Edit assemblies → publicSrcOverride.
 * Confirm-gated. Originals never overwritten.
 */
import "server-only";

import { listPhotoAssemblies } from "@/lib/campaign-media/photo-edit-store";
import { promotePhotoDerivative } from "@/lib/campaign-media/promote-photo-derivative";
import { getPhotoReadinessMatrix } from "@/lib/campaign-media/photo-readiness";

export type PromoteReadyAssembliesResult = {
  ok: boolean;
  message: string;
  promoted: string[];
  skipped: Array<{ photoId: string; reason: string }>;
};

function pickAssemblyPublicSrc(photoId: string): string | null {
  const assemblies = listPhotoAssemblies(photoId).filter((a) => !a.note?.includes("[archived"));
  if (!assemblies.length) return null;
  const preferred =
    assemblies.find((a) => a.slot === "web_max" || a.slot === "hero_16x9") ??
    assemblies.find((a) => a.slot === "square_1x1") ??
    assemblies.find((a) => a.slot === "grade_full") ??
    assemblies[assemblies.length - 1];
  return preferred?.publicSrc ?? null;
}

/**
 * Promote assemblies for photos that readiness marks as needsPromote,
 * or an explicit photoIds list. Requires confirmPromote:true.
 */
export function promoteReadyPhotoAssemblies(input: {
  confirmPromote: boolean;
  photoIds?: string[];
  limit?: number;
}): PromoteReadyAssembliesResult {
  if (!input.confirmPromote) {
    return {
      ok: false,
      message: "confirmPromote:true required — refuse silent promote.",
      promoted: [],
      skipped: [],
    };
  }

  const limit = Math.min(Math.max(Number(input.limit) || 24, 1), 40);
  const matrix = getPhotoReadinessMatrix({
    limit: 120,
    photoIds: input.photoIds,
  });

  const targets = (
    input.photoIds?.length
      ? matrix.rows.filter((r) => input.photoIds!.includes(r.photoId))
      : matrix.rows.filter((r) => r.assemblyCount > 0 && !r.hasPublicOverride)
  ).slice(0, limit);

  const promoted: string[] = [];
  const skipped: Array<{ photoId: string; reason: string }> = [];

  for (const row of targets) {
    if (row.consentBlock) {
      skipped.push({ photoId: row.photoId, reason: row.consentBlock });
      continue;
    }
    const publicSrc = pickAssemblyPublicSrc(row.photoId);
    if (!publicSrc) {
      skipped.push({ photoId: row.photoId, reason: "No non-archived assembly publicSrc." });
      continue;
    }
    const res = promotePhotoDerivative({
      photoId: row.photoId,
      publicSrc,
      setAsPublicSrc: true,
    });
    if (res.ok) promoted.push(row.photoId);
    else skipped.push({ photoId: row.photoId, reason: res.message });
  }

  return {
    ok: true,
    message: `Promoted ${promoted.length} · skipped ${skipped.length} (confirmPromote). Review Ship for gitignored derivatives.`,
    promoted,
    skipped,
  };
}
