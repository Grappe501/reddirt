/**
 * Public biography rollout depth.
 *
 * `3` — Two-level Meet Kelly (overview summaries + journey / community / why-im-running).
 * Full manuscript (`/biography`, `/about/deep-dive/*`, long chapter essays) stays off until depth `4`.
 */
export const PUBLIC_BIOGRAPHY_DEPTH = 3 as const;

export type PublicBiographyDepth = typeof PUBLIC_BIOGRAPHY_DEPTH;

export function showPublicBiographyManuscript(): boolean {
  return PUBLIC_BIOGRAPHY_DEPTH >= 4;
}
