import { brandMediaFromLegacySite } from "@/config/brand-media";

/** Default OG/Twitter preview when an event has no host flyer image. */
export const defaultEventShareImageSrc = brandMediaFromLegacySite.statewideBanner;

export const defaultEventShareImageAlt = brandMediaFromLegacySite.statewideBannerAlt;

/** Prefer the host flyer when present; otherwise Kelly statewide banner for social previews. */
export function resolveEventShareImageSrc(flyerSrc?: string | null): string {
  return flyerSrc?.trim() ? flyerSrc : defaultEventShareImageSrc;
}
