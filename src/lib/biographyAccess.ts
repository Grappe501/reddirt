/**
 * Navigation / rollout gating for the biography mini-novel system.
 * Extend with env flags or session checks when chapters go staged → public.
 */

import { showPublicBiographyManuscript } from "@/config/public-biography-depth";

export function canAccessBiographyDeepDive(): boolean {
  if (!showPublicBiographyManuscript()) return false;
  return process.env.NEXT_PUBLIC_BIOGRAPHY_DEEP_DIVE_ENABLED !== "false";
}
