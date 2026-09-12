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
  /** File-backed community still — sits above the footer on /about/community. */
  communityFooterStill: {
    src: "/media/campaign-photos/cafeteria-voter-conversation-20260617.png",
    alt: "Kelly Grappe talks with community members in a cafeteria line during a local gathering.",
    width: 1024,
    height: 768,
    objectPosition: "50% 40%",
  },
  /** File-backed speaking still — Why I’m Running “Why Secretary of State”. */
  whySosStill: {
    src: "/media/campaign-photos/stone-hall-remarks-campaign-sign-20260326.png",
    alt: "Kelly Grappe speaks indoors in a red-orange blazer beside her People Over Politics Secretary of State campaign sign.",
    width: 768,
    height: 1024,
    objectPosition: "50% 28%",
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
  /** File-backed formal still — `/endorsements` split hero (not the AFL-CIO card below). */
  endorsementsHero: {
    src: "/media/campaign-photos/formal-group-red-curtain-20260611.png",
    alt: "Kelly Grappe stands with civic and community leaders for a formal group photo in front of red stage curtains.",
    width: 1024,
    height: 768,
    objectPosition: "50% 40%",
  },
  /** File-backed petition still — My Plan Priority 2. */
  priorityPeoplesVoiceStill: {
    src: "/media/campaign-photos/outdoor-petition-table-crowd-20260606.png",
    alt: "Kelly Grappe talks with community members around an outdoor petition table.",
    width: 768,
    height: 1024,
    objectPosition: "50% 28%",
  },
  /** File-backed conversation still — My Plan Priority 4. */
  priorityTransparencyStill: {
    src: "/media/campaign-photos/gallery-voter-conversation-20260627.png",
    alt: "Kelly Grappe talks with a community member in a bright indoor gallery space.",
    width: 768,
    height: 1024,
    objectPosition: "50% 22%",
  },
  /** File-backed civic gathering still — My Plan Priority 6. */
  priorityEngagementStill: {
    src: "/media/campaign-photos/community-meeting-group-portrait-20260716.png",
    alt: "Kelly Grappe stands with community members for a group photo after a local meeting.",
    width: 1024,
    height: 768,
    objectPosition: "50% 42%",
  },
  /** File-backed professional still — Understand page hero. */
  understandHero: {
    src: "/media/campaign-photos/auditorium-credential-conversation-20260611.png",
    alt: "Kelly Grappe talks with a credentialed attendee on an auditorium floor beside theater seating.",
    width: 1024,
    height: 768,
    objectPosition: "50% 40%",
  },
  /** File-backed listening still — Understand “Two levels” heading. */
  understandTwoLevelsStill: {
    src: "/media/campaign-photos/democrats-meeting-listening-20260612.png",
    alt: "Kelly Grappe listens to a community member during an indoor civic meeting.",
    width: 768,
    height: 1024,
    objectPosition: "50% 22%",
  },
  /** File-backed elections still — /office/elections hero. */
  officeElectionsHero: {
    src: "/media/campaign-photos/i-voted-supporter-photo-20260303.png",
    alt: "Kelly Grappe smiles beside a supporter, wearing an I Voted sticker on her blazer at an indoor event.",
    width: 768,
    height: 1024,
    objectPosition: "50% 22%",
  },
  /** File-backed local still — Elections “Where county officials remain in charge”. */
  officeCountyOfficialsStill: {
    src: "/media/campaign-photos/mena-polk-meet-greet-20260411.png",
    alt: "Kelly Grappe talks with neighbors at a park meet-and-greet table in Mena, Arkansas.",
    width: 1536,
    height: 2048,
    objectPosition: "50% 28%",
  },
  /** File-backed commerce still — /office/business hero. */
  officeBusinessHero: {
    src: "/media/campaign-photos/cadence-bank-outdoor-conversation-20260502.png",
    alt: "Kelly Grappe talks with a community member outdoors near a Cadence Bank building.",
    width: 768,
    height: 1024,
    objectPosition: "50% 28%",
  },
  /** File-backed small-business still — sits above the footer on /office/business. */
  officeBusinessFooterStill: {
    src: "/media/campaign-photos/good-things-grow-hall-conversation-20260613.png",
    alt: "Kelly Grappe talks with seated community members at a Good Things Grow hall meal.",
    width: 768,
    height: 1024,
    objectPosition: "50% 22%",
  },
  /** File-backed conversation still — /office/notaries hero. */
  officeNotariesHero: {
    src: "/media/campaign-photos/brewery-meet-greet-conversation-20260426.png",
    alt: "Kelly Grappe talks with community members at a brewery meet-and-greet.",
    width: 1024,
    height: 768,
    objectPosition: "50% 32%",
  },
  /** File-backed civic still — sits above the footer on /office/notaries. */
  officeNotariesFooterStill: {
    src: "/media/campaign-photos/elks-lodge-breakfast-table-20260228.png",
    alt: "Kelly Grappe visits with seniors over breakfast in Northwest Arkansas.",
    width: 768,
    height: 1024,
    objectPosition: "50% 28%",
  },
  /** File-backed civic still — /office/records hero. */
  officeRecordsHero: {
    src: "/media/campaign-photos/historic-site-voter-conversation-20260627.png",
    alt: "Kelly Grappe talks with a community member at a historic-site gathering.",
    width: 1024,
    height: 768,
    objectPosition: "50% 38%",
  },
  /** File-backed listening still — sits above the footer on /office/records. */
  officeRecordsFooterStill: {
    src: "/media/campaign-photos/hall-apron-listening-20260429.png",
    alt: "Kelly Grappe listens to a community member during an indoor hall gathering.",
    width: 768,
    height: 1024,
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
