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
  "events.detail.hero",
  "events.been.graphic",
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
    emptySlotLabel: "Kelly on the trail",
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
    emptySlotLabel: "Portrait forthcoming",
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
    emptySlotLabel: "Meet Kelly — trail still forthcoming",
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
    emptySlotLabel: "Campaign still forthcoming",
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
    emptySlotLabel: "Leadership proof forthcoming",
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
    emptySlotLabel: "Office work still forthcoming",
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
    emptySlotLabel: "Volunteer field still forthcoming",
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
    emptySlotLabel: "Closing trail still forthcoming",
  },
};

const INNER_SLOTS: Record<(typeof PUBLIC_MEDIA_INNER_SLOTS)[number], PublicMediaSlotDefinition> = {
  "about.hero": imageHero("about", "about.hero", "Kelly meeting Arkansans", "heroHome"),
  "about.experience": imageHero("about", "about.experience", "Experience in the field", "arkansasPorch", "any"),
  "about.portrait": imageHero("about", "about.portrait", "Portrait forthcoming", "arkansasPorch", "portrait"),
  "journey.hero": imageHero("about-journey", "journey.hero", "Across Arkansas", "heroHome"),
  "journey.strip": imageHero("about-journey", "journey.strip", "Trail proof forthcoming", "editorialDefault", "any"),
  "community.hero": imageHero("about-community", "community.hero", "Community work forthcoming", "heroHome"),
  "why.hero": imageHero("about-why", "why.hero", "Why this race — photo forthcoming", "heroHome"),
  "priorities.hero": imageHero("priorities", "priorities.hero", "Kelly Grappe", "kellySuperHeader"),
  "speaks.hero": videoOrImageHero("kelly-speaks", "speaks.hero", "Hear Kelly — video forthcoming", "heroHome"),
  "speaks.featured": videoOrImageHero("kelly-speaks", "speaks.featured", "Featured message forthcoming", "heroHome"),
  "campaign-photos.intro": imageHero(
    "campaign-photos",
    "campaign-photos.intro",
    "Trail photos forthcoming",
    "heroHome",
  ),
  "endorsements.hero": imageHero("endorsements", "endorsements.hero", "Confirmed endorsements publish here", "heroHome"),
  "understand.hero": imageHero("understand", "understand.hero", "Office explained", "heroHome"),
  "office.hero": imageHero("office", "office.hero", "Office work forthcoming", "heroHome"),
  "dd.hero": imageHero("direct-democracy", "dd.hero", "Direct democracy forthcoming", "heroHome"),
  "dd.ballot.hero": imageHero("direct-democracy", "dd.ballot.hero", "Ballot process — photo forthcoming", "heroHome"),
  "road.hero": imageHero("from-the-road", "road.hero", "From the Road", "heroHome"),
  "press.hero": imageHero("press-coverage", "press.hero", "Press coverage forthcoming", "heroHome"),
  "events.hero": imageHero("events", "events.hero", "Events on the trail", "heroHome"),
  "events.detail.hero": imageHero(
    "events",
    "events.detail.hero",
    "Kelly Grappe — campaign event",
    "heroHome",
  ),
  "events.been.graphic": imageHero(
    "events",
    "events.been.graphic",
    "Regnat Populus trail graphic (brand art only)",
    "heroHome",
    "any",
  ),
  "events.request.hero": imageHero("events", "events.request.hero", "Invite Kelly", "heroHome"),
  "schedule.hero": imageHero("schedule", "schedule.hero", "Schedule forthcoming", "heroHome"),
  "listening.hero": imageHero("listening-sessions", "listening.hero", "Listening sessions", "heroHome"),
  "arkansas.hero": imageHero("arkansas", "arkansas.hero", "Across Arkansas", "heroHome"),
  "get-involved.hero": imageHero("get-involved", "get-involved.hero", "Neighbors on the trail", "heroHome"),
  "donate.hero": imageHero("donate", "donate.hero", "Campaign work forthcoming", "heroHome"),
  "contact.hero": imageHero("contact", "contact.hero", "Contact the campaign", "heroHome"),
  "voter-reg.hero": imageHero("voter-registration", "voter-reg.hero", "Voter registration help", "heroHome"),
  "host-gathering.hero": imageHero("host-a-gathering", "host-gathering.hero", "Host a gathering", "heroHome"),
  "local-team.hero": imageHero("start-a-local-team", "local-team.hero", "Local teams forthcoming", "heroHome"),
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
