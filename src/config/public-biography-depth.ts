/**
 * Public biography rollout depth.
 *
 * `3` — Meet Kelly hub (`/about` summaries + `KellyFullStory`) and campaign essays (`/about/[slug]`).
 * The literary manuscript (full `/biography` scroll, arc drilldown, `/about/deep-dive/*`) stays off until
 * copy is reviewed; set to `4` to re-enable those surfaces.
 */
export const PUBLIC_BIOGRAPHY_DEPTH = 3 as const;

export type PublicBiographyDepth = typeof PUBLIC_BIOGRAPHY_DEPTH;

export function showPublicBiographyManuscript(): boolean {
  return PUBLIC_BIOGRAPHY_DEPTH >= 4;
}
