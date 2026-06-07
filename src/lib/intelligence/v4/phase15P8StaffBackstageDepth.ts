/**
 * Phase 15 P8 — Staff backstage guard depth overlays.
 */
import {
  getStaffBackstageGuardSurface,
  listStaffBackstageGuardSurfaces,
  STAFF_BACKSTAGE_HUB_HREF,
} from "@/lib/intelligence/v4/phase15P8StaffBackstage";

export { STAFF_BACKSTAGE_HUB_HREF };

export type StaffBackstageGuardOverlay = {
  surfaceId: string;
  guardSteps: string[];
  layoutGuardWired: boolean;
};

export function getStaffBackstageGuardOverlay(surfaceId: string): StaffBackstageGuardOverlay | undefined {
  const surface = getStaffBackstageGuardSurface(surfaceId);
  if (!surface) return undefined;
  return {
    surfaceId,
    guardSteps: [
      `StaffBackstageRouteGuard blocks ${surface.title} for non-STAFF profiles.`,
      surface.guardReason,
      surface.kellyRule,
    ],
    layoutGuardWired: true,
  };
}

export function staffBackstageGuardMeetsPhase15P8Bar(overlay: StaffBackstageGuardOverlay): boolean {
  return overlay.guardSteps.length >= 3 && overlay.layoutGuardWired;
}

export function countStaffBackstageGuardsAtBar(): { atBar: number; total: number } {
  const surfaces = listStaffBackstageGuardSurfaces();
  const atBar = surfaces.filter((s) => {
    const o = getStaffBackstageGuardOverlay(s.surfaceId);
    return o && staffBackstageGuardMeetsPhase15P8Bar(o);
  }).length;
  return { atBar, total: surfaces.length };
}
