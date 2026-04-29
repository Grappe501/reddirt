/**
 * Navigation / rollout gating for the biography mini-novel system.
 * Extend with env flags or session checks when chapters go staged → public.
 */

export function canAccessBiographyDeepDive(): boolean {
  return process.env.NEXT_PUBLIC_BIOGRAPHY_DEEP_DIVE_ENABLED !== "false";
}
