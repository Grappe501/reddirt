/**
 * Central image registry — production URLs from www.kellygrappe.com (Squarespace CDN) where noted.
 * Fall back to /public SVGs when offline or after self-hosting.
 */

import { brandMediaFromLegacySite } from "@/config/brand-media";

export type MediaRef = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const media = {
  /** Legacy-site statewide still — swap for self-hosted hero loop when ready */
  heroHome: {
    src: brandMediaFromLegacySite.statewideBanner,
    alt: brandMediaFromLegacySite.statewideBannerAlt,
    width: 2000,
    height: 1125,
  },
  splitDemocracy: {
    src: "/media/placeholders/split-ballot-warm.svg",
    alt: "Abstract paper and ballot tones in red dirt and cream palette",
    width: 1200,
    height: 900,
  },
  splitLabor: {
    src: "/media/placeholders/split-work-warm.svg",
    alt: "Warm muted tones suggesting tools and work gloves on a bench",
    width: 1200,
    height: 900,
  },
  arkansasPorch: {
    src: brandMediaFromLegacySite.kellyPortrait,
    alt: brandMediaFromLegacySite.kellyPortraitAlt,
    width: 1500,
    height: 1000,
  },
  storyWarehouse: {
    src: "/media/placeholders/story-shift-floor.svg",
    alt: "Warehouse floor light and shadow, abstract",
    width: 1200,
    height: 800,
  },
  storySchool: {
    src: "/media/placeholders/story-classroom-notes.svg",
    alt: "Desk with papers and pens under warm lamp light, abstract",
    width: 1200,
    height: 800,
  },
  storyBakery: {
    src: "/media/placeholders/story-bakery-dawn.svg",
    alt: "Pre-dawn bakery warmth, flour dust and oven glow suggested",
    width: 1200,
    height: 800,
  },
  storyYouth: {
    src: "/media/placeholders/story-campus-dusk.svg",
    alt: "Campus path at dusk, quiet and open",
    width: 1200,
    height: 800,
  },
  storyRural: {
    src: "/media/placeholders/story-mail-route.svg",
    alt: "Long gravel road and mailbox silhouette at golden hour",
    width: 1200,
    height: 800,
  },
  storyNurse: {
    src: "/media/placeholders/story-hospital-quiet.svg",
    alt: "Soft hallway light, clinical calm, abstract",
    width: 1200,
    height: 800,
  },
  storyOrganizer: {
    src: "/media/placeholders/story-clipboard-doors.svg",
    alt: "Clipboard and neighborhood map on a kitchen table",
    width: 1200,
    height: 800,
  },
  storyFlood: {
    src: "/media/placeholders/story-waterline.svg",
    alt: "Water line on siding and sky clearing, abstract",
    width: 1200,
    height: 800,
  },
  editorialDefault: {
    src: "/media/placeholders/editorial-ink-field.svg",
    alt: "Notebook margin and field green, editorial texture",
    width: 1200,
    height: 700,
  },
  explainerSteps: {
    src: "/media/placeholders/explainer-steps.svg",
    alt: "Numbered path through soft shapes, teaching visual",
    width: 1200,
    height: 720,
  },
} as const satisfies Record<string, MediaRef>;

export type MediaKey = keyof typeof media;
