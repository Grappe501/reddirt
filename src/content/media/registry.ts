/**
 * Central image registry — defaults use **local** `/public` media (`brand-media.ts`).
 */

import { brandMediaFromLegacySite } from "@/config/brand-media";

export type MediaRef = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS object-position when the still is cropped to fill a slot (portraits in landscape panes). */
  objectPosition?: string;
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
    width: 2000,
    height: 1125,
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
  /** File-backed professional still — Experience page “Why this maps to the office”. */
  experienceRelevanceStill: {
    src: "/media/campaign-photos/afl-cio-pre-event-networking-20260629.png",
    alt: "Kelly Grappe talks with attendees before an Arkansas AFL-CIO gathering, standing in conversation inside the event venue.",
    width: 1536,
    height: 2048,
    objectPosition: "50% 22%",
  },
  /** File-backed rural trail still — Meet Kelly “Rural Arkansas matters”. */
  aboutRuralStill: {
    src: "/media/campaign-photos/cave-city-watermelon-festival-parade-20260725.png",
    alt: "Kelly Grappe waves from a parade trailer on Main Street at the Cave City Watermelon Festival in Sharp County.",
    width: 768,
    height: 1024,
    objectPosition: "50% 22%",
  },
  /** File-backed farm still — Meet Kelly family section (Rose Bud / animals at home). */
  aboutFamilyStill: {
    src: "/media/campaign-trail/016-img-7957.jpg",
    alt: "Kelly Grappe sits at home holding two young goats.",
    width: 1600,
    height: 1600,
    objectPosition: "50% 28%",
  },
  /** File-backed campaign still — community conversation. Fills the homepage band before My Plan. */
  homePlanBridge: {
    src: "/media/campaign-photos/community-center-voter-circle-20260713.png",
    alt: "Kelly Grappe talks with community members in a bright indoor lobby during a campaign gathering.",
    width: 1024,
    height: 768,
    objectPosition: "50% 38%",
  },
  /** File-backed campaign still — Johnson County Peach Festival. Fills `/priorities` split hero. */
  prioritiesHero: {
    src: "/media/campaign-photos/johnson-county-peach-festival-parade-20260718.png",
    alt: "Kelly Grappe waves to parade spectators while walking the Johnson County Peach Festival route in Clarksville.",
    width: 768,
    height: 1024,
    objectPosition: "50% 22%",
  },
  /** File-backed campaign still — AFL-CIO pre-event networking. Fills `/endorsements` split hero. */
  endorsementsHero: {
    src: "/media/campaign-photos/afl-cio-pre-event-networking-20260629.png",
    alt: "Kelly Grappe talks with attendees before addressing an Arkansas AFL-CIO gathering, standing in conversation inside the event venue.",
    width: 1536,
    height: 2048,
    objectPosition: "50% 22%",
  },
  explainerSteps: {
    src: "/media/placeholders/explainer-steps.svg",
    alt: "Numbered path through soft shapes, teaching visual",
    width: 1200,
    height: 720,
  },
} as const satisfies Record<string, MediaRef>;

export type MediaKey = keyof typeof media;
