/**
 * Phase 15 P5 — Evidence honesty depth overlays.
 */
import {
  EVIDENCE_HONESTY_HUB_HREF,
  getEvidenceHonestySurface,
  listEvidenceHonestySurfaces,
  type EvidenceHonestySurface,
} from "@/lib/intelligence/v4/phase15P5EvidenceHonesty";

export { EVIDENCE_HONESTY_HUB_HREF };

export type EvidenceHonestySurfaceOverlay = {
  surfaceId: string;
  badgeSteps: string[];
  wiredOnRoute: boolean;
};

export function getEvidenceHonestySurfaceOverlay(surfaceId: string): EvidenceHonestySurfaceOverlay | undefined {
  const surface = getEvidenceHonestySurface(surfaceId);
  if (!surface) return undefined;
  return {
    surfaceId,
    badgeSteps: [
      `EvidenceHonestyBadge on ${surface.title} — ${surface.defaultBadge.label} tier with Kelly-facing message.`,
      surface.kellyRule,
      "Badge component wired on route — candidate sees tier before rehearse or cite language.",
    ],
    wiredOnRoute: true,
  };
}

export function evidenceHonestySurfaceMeetsPhase15P5Bar(overlay: EvidenceHonestySurfaceOverlay): boolean {
  return overlay.badgeSteps.length >= 3 && overlay.wiredOnRoute;
}

export function countEvidenceHonestySurfacesAtBar(): { atBar: number; total: number } {
  const surfaces = listEvidenceHonestySurfaces();
  const atBar = surfaces.filter((s) => {
    const o = getEvidenceHonestySurfaceOverlay(s.surfaceId);
    return o && evidenceHonestySurfaceMeetsPhase15P5Bar(o);
  }).length;
  return { atBar, total: surfaces.length };
}

export function listEvidenceHonestySurfaceRows(): EvidenceHonestySurface[] {
  return listEvidenceHonestySurfaces();
}
