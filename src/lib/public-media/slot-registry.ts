/**
 * Typed public media slot registry — do not scatter slot strings in components.
 * Homepage slots stay stable; inner-page slots feed MediaPageHero / PublicMediaSlotFrame.
 */

import type { OwnedMediaDerivativeType, OwnedMediaKind, PublicMediaPlacementKind } from "@prisma/client";
import type { MediaKey } from "@/content/media/registry";

export const PUBLIC_MEDIA_PAGE_KEYS = [
  "home",
  "about",
  "about-journey",
  "about-community",
  "about-why",
  "priorities",
  "kelly-speaks",
  "campaign-photos",
  "endorsements",
  "understand",
  "office",
  "direct-democracy",
  "from-the-road",
  "press-coverage",
  "events",
  "schedule",
  "listening-sessions",
  "arkansas",
  "get-involved",
  "donate",
  "contact",
  "voter-registration",
  "host-a-gathering",
  "start-a-local-team",
] as const;

export type PublicMediaPageKey = (typeof PUBLIC_MEDIA_PAGE_KEYS)[number];

export const PUBLIC_MEDIA_HOME_SLOTS = [
  "home.hero.background",
  "home.hero.portrait",
  "home.personality.primary",
  "home.personality.secondary",
  "home.executiveLeadership",
  "home.officeServices",
  "home.volunteerCallout",
  "home.closing",
] as const;

export const PUBLIC_MEDIA_INNER_SLOTS = [
  "about.hero",
  "about.experience",
  "about.portrait",
  "journey.hero",
  "journey.strip",
  "community.hero",
  "why.hero",
  "priorities.hero",
  "speaks.hero",
  "speaks.featured",
  "campaign-photos.intro",
  "endorsements.hero",
  "understand.hero",
  "office.hero",
  "dd.hero",
  "dd.ballot.hero",
  "road.hero",
  "press.hero",
  "events.hero",
  "events.request.hero",
  "schedule.hero",
  "listening.hero",
  "arkansas.hero",
  "get-involved.hero",
  "donate.hero",
  "contact.hero",
  "voter-reg.hero",
  "host-gathering.hero",
  "local-team.hero",
] as const;

export const PUBLIC_MEDIA_ALL_SLOTS = [...PUBLIC_MEDIA_HOME_SLOTS, ...PUBLIC_MEDIA_INNER_SLOTS] as const;

export type PublicMediaSlotKey = (typeof PUBLIC_MEDIA_ALL_SLOTS)[number];

export type PublicMediaSlotDefinition = {
  pageKey: PublicMediaPageKey;
  slotKey: PublicMediaSlotKey;
  allowedKinds: readonly OwnedMediaKind[];
  allowedPlacementKinds: readonly PublicMediaPlacementKind[];
  requiredDerivative: OwnedMediaDerivativeType;
  expectedOrientation: "landscape" | "portrait" | "square" | "any";
  aspectRatioGuidance: string;
  videoAllowed: boolean;
  posterRequired: boolean;
  focalOverrideAllowed: boolean;
  captionSupported: boolean;
  /** Static MediaRef key in content registry used when owned placement is absent. */
  staticFallbackMediaKey: MediaKey;
  /** Operator-facing label when showing an empty / placeholder frame. */
  emptySlotLabel: string;
};

type SlotInput = Omit<PublicMediaSlotDefinition, "slotKey"> & { slotKey: PublicMediaSlotKey };

function slot(def: SlotInput): PublicMediaSlotDefinition {
  return def;
}

function imageHero(
  pageKey: PublicMediaPageKey,
  slotKey: PublicMediaSlotKey,
  emptySlotLabel: string,
  staticFallbackMediaKey: MediaKey = "editorialDefault",
  orientation: "landscape" | "portrait" | "any" = "landscape",
): PublicMediaSlotDefinition {
  return slot({
    pageKey,
    slotKey,
    allowedKinds: ["IMAGE"],
    allowedPlacementKinds: ["IMAGE", "BACKGROUND"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: orientation,
    aspectRatioGuidance: orientation === "portrait" ? "4:5" : "16:9",
    videoAllowed: false,
    posterRequired: false,
    focalOverrideAllowed: true,
    captionSupported: true,
    staticFallbackMediaKey,
    emptySlotLabel,
  });
}

function videoOrImageHero(
  pageKey: PublicMediaPageKey,
  slotKey: PublicMediaSlotKey,
  emptySlotLabel: string,
  staticFallbackMediaKey: MediaKey = "heroHome",
): PublicMediaSlotDefinition {
  return slot({
    pageKey,
    slotKey,
    allowedKinds: ["IMAGE", "VIDEO"],
    allowedPlacementKinds: ["BACKGROUND", "IMAGE", "VIDEO"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "landscape",
    aspectRatioGuidance: "16:9",
    videoAllowed: true,
    posterRequired: true,
    focalOverrideAllowed: true,
    captionSupported: false,
    staticFallbackMediaKey,
    emptySlotLabel,
  });
}

const HOME_SLOTS: Record<(typeof PUBLIC_MEDIA_HOME_SLOTS)[number], PublicMediaSlotDefinition> = {
  "home.hero.background": {
    pageKey: "home",
    slotKey: "home.hero.background",
    allowedKinds: ["IMAGE", "VIDEO"],
    allowedPlacementKinds: ["BACKGROUND", "IMAGE", "VIDEO"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "landscape",
    aspectRatioGuidance: "16:9 or wider",
    videoAllowed: true,
    posterRequired: true,
    focalOverrideAllowed: true,
    captionSupported: false,
    staticFallbackMediaKey: "heroHome",
    emptySlotLabel: "Home hero background — trail still or loop",
  },
  "home.hero.portrait": {
    pageKey: "home",
    slotKey: "home.hero.portrait",
    allowedKinds: ["IMAGE"],
    allowedPlacementKinds: ["PORTRAIT", "IMAGE"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "portrait",
    aspectRatioGuidance: "4:5",
    videoAllowed: false,
    posterRequired: false,
    focalOverrideAllowed: true,
    captionSupported: true,
    staticFallbackMediaKey: "arkansasPorch",
    emptySlotLabel: "Home hero portrait",
  },
  "home.personality.primary": {
    pageKey: "home",
    slotKey: "home.personality.primary",
    allowedKinds: ["IMAGE"],
    allowedPlacementKinds: ["IMAGE", "PORTRAIT"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "any",
    aspectRatioGuidance: "3:2 or 4:5",
    videoAllowed: false,
    posterRequired: false,
    focalOverrideAllowed: true,
    captionSupported: true,
    staticFallbackMediaKey: "arkansasPorch",
    emptySlotLabel: "Home Meet Kelly primary still",
  },
  "home.personality.secondary": {
    pageKey: "home",
    slotKey: "home.personality.secondary",
    allowedKinds: ["IMAGE"],
    allowedPlacementKinds: ["IMAGE"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "any",
    aspectRatioGuidance: "3:2",
    videoAllowed: false,
    posterRequired: false,
    focalOverrideAllowed: true,
    captionSupported: true,
    staticFallbackMediaKey: "splitDemocracy",
    emptySlotLabel: "Home Meet Kelly secondary still",
  },
  "home.executiveLeadership": {
    pageKey: "home",
    slotKey: "home.executiveLeadership",
    allowedKinds: ["IMAGE"],
    allowedPlacementKinds: ["IMAGE", "PORTRAIT"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "any",
    aspectRatioGuidance: "3:2",
    videoAllowed: false,
    posterRequired: false,
    focalOverrideAllowed: true,
    captionSupported: true,
    staticFallbackMediaKey: "arkansasPorch",
    emptySlotLabel: "Home leadership proof still",
  },
  "home.officeServices": {
    pageKey: "home",
    slotKey: "home.officeServices",
    allowedKinds: ["IMAGE"],
    allowedPlacementKinds: ["IMAGE"],
    requiredDerivative: "THUMBNAIL",
    expectedOrientation: "landscape",
    aspectRatioGuidance: "16:9",
    videoAllowed: false,
    posterRequired: false,
    focalOverrideAllowed: true,
    captionSupported: false,
    staticFallbackMediaKey: "splitLabor",
    emptySlotLabel: "Home office-services still",
  },
  "home.volunteerCallout": {
    pageKey: "home",
    slotKey: "home.volunteerCallout",
    allowedKinds: ["IMAGE"],
    allowedPlacementKinds: ["IMAGE"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "any",
    aspectRatioGuidance: "3:2",
    videoAllowed: false,
    posterRequired: false,
    focalOverrideAllowed: true,
    captionSupported: true,
    staticFallbackMediaKey: "arkansasPorch",
    emptySlotLabel: "Home volunteer callout still",
  },
  "home.closing": {
    pageKey: "home",
    slotKey: "home.closing",
    allowedKinds: ["IMAGE", "VIDEO"],
    allowedPlacementKinds: ["BACKGROUND", "IMAGE", "VIDEO"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "landscape",
    aspectRatioGuidance: "16:9",
    videoAllowed: true,
    posterRequired: true,
    focalOverrideAllowed: true,
    captionSupported: false,
    staticFallbackMediaKey: "heroHome",
    emptySlotLabel: "Home closing band media",
  },
};

const INNER_SLOTS: Record<(typeof PUBLIC_MEDIA_INNER_SLOTS)[number], PublicMediaSlotDefinition> = {
  "about.hero": imageHero("about", "about.hero", "Meet Kelly hero — qualifications proof", "arkansasPorch"),
  "about.experience": imageHero("about", "about.experience", "Experience band still", "arkansasPorch", "any"),
  "about.portrait": imageHero("about", "about.portrait", "Meet Kelly portrait", "arkansasPorch", "portrait"),
  "journey.hero": imageHero("about-journey", "journey.hero", "Across Arkansas hero still", "heroHome"),
  "journey.strip": imageHero("about-journey", "journey.strip", "Journey proof strip still", "editorialDefault", "any"),
  "community.hero": imageHero("about-community", "community.hero", "Community page hero still", "arkansasPorch"),
  "why.hero": imageHero("about-why", "why.hero", "Why I'm running hero still", "arkansasPorch"),
  "priorities.hero": imageHero("priorities", "priorities.hero", "Priorities hero — governing proof", "splitLabor"),
  "speaks.hero": videoOrImageHero("kelly-speaks", "speaks.hero", "Video slot: hear Kelly", "heroHome"),
  "speaks.featured": videoOrImageHero("kelly-speaks", "speaks.featured", "Featured Kelly message video", "heroHome"),
  "campaign-photos.intro": imageHero(
    "campaign-photos",
    "campaign-photos.intro",
    "Campaign photos intro still",
    "heroHome",
  ),
  "endorsements.hero": imageHero(
    "endorsements",
    "endorsements.hero",
    "Endorsements hero (empty until confirmed)",
    "editorialDefault",
  ),
  "understand.hero": imageHero("understand", "understand.hero", "Office explainer hero still", "splitDemocracy"),
  "office.hero": imageHero("office", "office.hero", "Office area hero still", "splitDemocracy"),
  "dd.hero": imageHero("direct-democracy", "dd.hero", "Direct democracy hero still", "splitDemocracy"),
  "dd.ballot.hero": imageHero(
    "direct-democracy",
    "dd.ballot.hero",
    "Ballot initiative process hero",
    "explainerSteps",
  ),
  "road.hero": imageHero("from-the-road", "road.hero", "From the Road hero still", "heroHome"),
  "press.hero": imageHero("press-coverage", "press.hero", "Press coverage hero still", "editorialDefault"),
  "events.hero": imageHero("events", "events.hero", "Events calendar hero still", "heroHome"),
  "events.request.hero": imageHero("events", "events.request.hero", "Invite Kelly hero still", "arkansasPorch"),
  "schedule.hero": imageHero("schedule", "schedule.hero", "Schedule hero still", "heroHome"),
  "listening.hero": imageHero("listening-sessions", "listening.hero", "Listening sessions hero still", "arkansasPorch"),
  "arkansas.hero": imageHero("arkansas", "arkansas.hero", "Arkansas presence hero still", "heroHome"),
  "get-involved.hero": imageHero("get-involved", "get-involved.hero", "Get involved proof still", "arkansasPorch"),
  "donate.hero": imageHero("donate", "donate.hero", "Donate page proof still", "arkansasPorch"),
  "contact.hero": imageHero("contact", "contact.hero", "Contact page still", "editorialDefault"),
  "voter-reg.hero": imageHero(
    "voter-registration",
    "voter-reg.hero",
    "Voter registration hero still",
    "splitDemocracy",
  ),
  "host-gathering.hero": imageHero(
    "host-a-gathering",
    "host-gathering.hero",
    "Host a gathering proof still",
    "arkansasPorch",
  ),
  "local-team.hero": imageHero(
    "start-a-local-team",
    "local-team.hero",
    "Start a local team proof still",
    "arkansasPorch",
  ),
};

const ALL_SLOTS: Record<PublicMediaSlotKey, PublicMediaSlotDefinition> = {
  ...HOME_SLOTS,
  ...INNER_SLOTS,
};

export function isValidPublicMediaPage(pageKey: string): pageKey is PublicMediaPageKey {
  return (PUBLIC_MEDIA_PAGE_KEYS as readonly string[]).includes(pageKey);
}

export function isValidPublicMediaSlot(slotKey: string): slotKey is PublicMediaSlotKey {
  return (PUBLIC_MEDIA_ALL_SLOTS as readonly string[]).includes(slotKey);
}

export function getPublicMediaSlotDefinition(slotKey: string): PublicMediaSlotDefinition | null {
  if (!isValidPublicMediaSlot(slotKey)) return null;
  return ALL_SLOTS[slotKey];
}

export function listPublicMediaSlotsForPage(pageKey: string): PublicMediaSlotDefinition[] {
  if (!isValidPublicMediaPage(pageKey)) return [];
  return PUBLIC_MEDIA_ALL_SLOTS.map((k) => ALL_SLOTS[k]).filter((d) => d.pageKey === pageKey);
}

export function listAllPublicMediaSlots(): PublicMediaSlotDefinition[] {
  return PUBLIC_MEDIA_ALL_SLOTS.map((k) => ALL_SLOTS[k]);
}
