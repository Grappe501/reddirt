/**
 * Campaign media paths for dashboards and volunteer tools.
 *
 * Storage (do not commit raw Photoshop sources to `public/`):
 * - **Source / full-res originals:** keep in design storage or a non-public repo path — not shipped to the browser.
 * - **Dashboard-ready cutouts:** `public/images/kelly/headshots/` — **PNG with transparency** preferred.
 * - **Super header:** `kelly-hero.png` (single hero; no multi-image collage on dashboards).
 * - **Tab accents:** `kelly-accent-1.png` … `kelly-accent-4.png` — four single-pose transparent cutouts (at most **one** accent per dashboard page; see `KellyAccentCutout`).
 * - **Do not use** a multi-headshot composite canvas in product UI or volunteer downloads — only the isolated files below.
 */

const ENV_HERO =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_KELLY_DASHBOARD_HERO_URL?.trim()) || "";

/** Shown when the primary asset is missing or fails to load. */
export const KELLY_DASHBOARD_HERO_FALLBACK = "/media/placeholders/hero-arkansas-warm.svg";

/** Default file for the team dashboard super header (compact hero). */
export const KELLY_DASHBOARD_HERO_DEFAULT = "/images/kelly/headshots/kelly-hero.png";

const DEFAULT_HERO_CHAIN = [KELLY_DASHBOARD_HERO_DEFAULT, "/images/kelly/headshots/kelly-hero.jpg", KELLY_DASHBOARD_HERO_FALLBACK] as const;

/**
 * Approved single-pose cutouts (transparent PNG, split from HQ composite).
 * For Canva and VOS accents — not the raw multi-portrait canvas.
 */
export const KELLY_ACCENT_CUTOUT_1 = "/images/kelly/headshots/kelly-accent-1.png";
export const KELLY_ACCENT_CUTOUT_2 = "/images/kelly/headshots/kelly-accent-2.png";
export const KELLY_ACCENT_CUTOUT_3 = "/images/kelly/headshots/kelly-accent-3.png";
export const KELLY_ACCENT_CUTOUT_4 = "/images/kelly/headshots/kelly-accent-4.png";

/** Paths approved for volunteer graphics (subset of dashboard accents). */
export const KELLY_VOLUNTEER_GRAPHICS_CUTOUTS: readonly string[] = [
  KELLY_ACCENT_CUTOUT_1,
  KELLY_ACCENT_CUTOUT_2,
  KELLY_ACCENT_CUTOUT_3,
  KELLY_ACCENT_CUTOUT_4,
];

/**
 * Team dashboard tabs reuse the four poses (still one accent per page).
 * Order: Overview→1, Social→2, Events→3, P5/VR→4, Youth→1, Metrics→2, Training→3, Resources→4, Messages→1.
 */
export const KELLY_ACCENT_TEAM_OVERVIEW = KELLY_ACCENT_CUTOUT_1;
export const KELLY_ACCENT_SOCIAL_MEDIA = KELLY_ACCENT_CUTOUT_2;
export const KELLY_ACCENT_EVENTS = KELLY_ACCENT_CUTOUT_3;
export const KELLY_ACCENT_POWER_OF_5 = KELLY_ACCENT_CUTOUT_4;
export const KELLY_ACCENT_YOUTH_OUTREACH = KELLY_ACCENT_CUTOUT_1;
export const KELLY_ACCENT_METRICS = KELLY_ACCENT_CUTOUT_2;
export const KELLY_ACCENT_TRAINING = KELLY_ACCENT_CUTOUT_3;
export const KELLY_ACCENT_RESOURCES = KELLY_ACCENT_CUTOUT_4;
export const KELLY_ACCENT_MESSAGES = KELLY_ACCENT_CUTOUT_1;

/**
 * Ordered hero sources: env override first, then default PNG, JPEG, SVG fallback.
 * Use with `onError` stepping in the client hero.
 */
export function getKellyDashboardHeroCandidates(): string[] {
  const chain = ENV_HERO ? [ENV_HERO, ...DEFAULT_HERO_CHAIN] : [...DEFAULT_HERO_CHAIN];
  return [...new Set(chain)];
}

/** Primary URL for metadata / simple imports. */
export const KELLY_DASHBOARD_HERO_PRIMARY = ENV_HERO || KELLY_DASHBOARD_HERO_DEFAULT;

/** @deprecated Use `getKellyDashboardHeroCandidates()` in the hero; kept for older imports. */
export const KELLY_DASHBOARD_HERO_IMAGE = KELLY_DASHBOARD_HERO_PRIMARY;

export type KellyHeadshotAsset = {
  id: string;
  label: string;
  description: string;
  /** Path under `public/` */
  path: string;
  comingSoon?: boolean;
};

/** Library listing for hubs and volunteers; upload files to match paths. */
export const KELLY_HEADSHOT_LIBRARY: KellyHeadshotAsset[] = [
  {
    id: "hero-dashboard",
    label: "Dashboard super header",
    description: "Compact volunteer hero — transparent PNG cutout. Not a collage tile.",
    path: KELLY_DASHBOARD_HERO_DEFAULT,
  },
  {
    id: "accent-cutout-1",
    label: "Kelly cutout · Pose A (composite quadrant 1)",
    description: "Approved transparent PNG for accents and Canva — single pose only.",
    path: KELLY_ACCENT_CUTOUT_1,
  },
  {
    id: "accent-cutout-2",
    label: "Kelly cutout · Pose B (composite quadrant 2)",
    description: "Approved transparent PNG for accents and Canva — single pose only.",
    path: KELLY_ACCENT_CUTOUT_2,
  },
  {
    id: "accent-cutout-3",
    label: "Kelly cutout · Pose C (composite quadrant 3)",
    description: "Approved transparent PNG for accents and Canva — single pose only.",
    path: KELLY_ACCENT_CUTOUT_3,
  },
  {
    id: "accent-cutout-4",
    label: "Kelly cutout · Pose D (composite quadrant 4)",
    description: "Approved transparent PNG for accents and Canva — single pose only.",
    path: KELLY_ACCENT_CUTOUT_4,
  },
  {
    id: "square-feed",
    label: "Square feed (1080)",
    description: "Instagram-style square; pair with Canva templates.",
    path: "/images/kelly/headshots/kelly-square.jpg",
    comingSoon: true,
  },
  {
    id: "story-vertical",
    label: "Story / reel vertical",
    description: "9:16 safe zone; keep key text inside center guides.",
    path: "/images/kelly/headshots/kelly-story.jpg",
    comingSoon: true,
  },
];
