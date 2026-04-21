import { brandMediaFromLegacySite } from "@/config/brand-media";

/**
 * Central campaign imagery for the public site. Default sources: legacy site CDN + placeholders.
 * Replace with self-hosted files under `/public/media/campaign/` as you add photography (keep same keys in your ops doc).
 * Recommended: 2000–2400w JPG/WebP, sRGB, ≤ ~400KB for strip tiles after optimization.
 */
export const campaignHeaderStrip = [
  {
    id: "strip-wide",
    src: brandMediaFromLegacySite.statewideBanner,
    alt: brandMediaFromLegacySite.statewideBannerAlt,
  },
  {
    id: "strip-kelly",
    src: brandMediaFromLegacySite.kellyPortrait,
    alt: brandMediaFromLegacySite.kellyPortraitAlt,
  },
  {
    id: "strip-wide-2",
    src: brandMediaFromLegacySite.statewideBanner,
    alt: `${brandMediaFromLegacySite.statewideBannerAlt} — field`,
  },
] as const;

/** Section nav label "The Plan" in config/navigation — these routes get stronger visuals + page hero tone. */
export const THE_PLAN_PATH_PREFIXES = ["/priorities", "/explainers", "/editorial"] as const;

export function isThePlanPath(pathname: string): boolean {
  const p = pathname.split("?")[0] ?? "/";
  return THE_PLAN_PATH_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`)
  );
}

export function isCampaignHomePath(pathname: string): boolean {
  const p = pathname.split("?")[0] ?? "/";
  return p === "/";
}
