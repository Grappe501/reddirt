/**
 * Default campaign imagery — **local** `/public` assets only (no external CDN).
 * Override per deploy by swapping files under `public/media/` or wiring CMS later.
 */
const HERO_LOCAL = "/media/placeholders/hero-arkansas-warm.svg";

export const brandMediaFromLegacySite = {
  /** Donate gate + modules that expect a “portrait” frame (SVG scales cleanly). */
  kellyPortrait: HERO_LOCAL,
  kellyPortraitAlt: "Kelly Grappe for Arkansas Secretary of State — campaign graphic",
  /** Wide hero still when no `NEXT_PUBLIC_HERO_VIDEO_URL` */
  statewideBanner: HERO_LOCAL,
  statewideBannerAlt: "Kelly Grappe campaign — Arkansas statewide graphic",
} as const;
