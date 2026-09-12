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
  "home.plan.bridge",
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
  "office.elections.hero",
  "office.business.hero",
  "office.notaries.hero",
  "office.records.hero",
  "office.capitol.hero",
  "office.why.hero",
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
    staticFallbackMediaKey: "homeHeroPortrait",
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
    staticFallbackMediaKey: "homePersonalityPrimary",
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
    staticFallbackMediaKey: "homePersonalitySecondary",
    emptySlotLabel: "Campaign still forthcoming",
  },
  "home.plan.bridge": {
    pageKey: "home",
    slotKey: "home.plan.bridge",
    allowedKinds: ["IMAGE"],
    allowedPlacementKinds: ["IMAGE"],
    requiredDerivative: "WEB_JPEG",
    expectedOrientation: "landscape",
    aspectRatioGuidance: "4:3 or 16:9",
    videoAllowed: false,
    posterRequired: false,
    focalOverrideAllowed: true,
    captionSupported: true,
    staticFallbackMediaKey: "homePlanBridge",
    emptySlotLabel: "Kelly with neighbors — trail still forthcoming",
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
    staticFallbackMediaKey: "homeExecutiveLeadership",
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
    staticFallbackMediaKey: "homeOfficeServices",
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
    staticFallbackMediaKey: "homeVolunteerCallout",
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
    staticFallbackMediaKey: "homeClosing",
    emptySlotLabel: "Closing trail still forthcoming",
  },
};

const INNER_SLOTS: Record<(typeof PUBLIC_MEDIA_INNER_SLOTS)[number], PublicMediaSlotDefinition> = {
  "about.hero": imageHero("about", "about.hero", "Kelly meeting Arkansans", "aboutHero"),
  "about.experience": imageHero("about", "about.experience", "Experience in the field", "aboutExperienceHero", "any"),
  "about.portrait": imageHero("about", "about.portrait", "Portrait forthcoming", "aboutPortrait", "portrait"),
  "journey.hero": imageHero("about-journey", "journey.hero", "Across Arkansas", "journeyHero"),
  "journey.strip": imageHero("about-journey", "journey.strip", "Trail proof forthcoming", "journeyStrip", "any"),
  "community.hero": imageHero("about-community", "community.hero", "Community work forthcoming", "communityHero"),
  "why.hero": imageHero("about-why", "why.hero", "Why this race — photo forthcoming", "whyHero"),
  "priorities.hero": imageHero("priorities", "priorities.hero", "Governing work forthcoming", "prioritiesHero"),
  "speaks.hero": videoOrImageHero("kelly-speaks", "speaks.hero", "Hear Kelly — video forthcoming", "speaksHero"),
  "speaks.featured": videoOrImageHero("kelly-speaks", "speaks.featured", "Featured message forthcoming", "speaksFeatured"),
  "campaign-photos.intro": imageHero(
    "campaign-photos",
    "campaign-photos.intro",
    "Trail photos forthcoming",
    "campaignPhotosIntro",
  ),
  "endorsements.hero": imageHero(
    "endorsements",
    "endorsements.hero",
    "Confirmed endorsements publish here",
    "endorsementsHero",
  ),
  "understand.hero": imageHero("understand", "understand.hero", "Office explained", "understandHero"),
  "office.hero": imageHero("office", "office.hero", "Office work forthcoming", "officeHubHero"),
  "office.elections.hero": imageHero("office", "office.elections.hero", "Elections trail still", "officeElectionsHero"),
  "office.business.hero": imageHero("office", "office.business.hero", "Business trail still", "officeBusinessHero"),
  "office.notaries.hero": imageHero("office", "office.notaries.hero", "Notaries trail still", "officeNotariesHero"),
  "office.records.hero": imageHero("office", "office.records.hero", "Records trail still", "officeRecordsHero"),
  "office.capitol.hero": imageHero("office", "office.capitol.hero", "Capitol trail still", "officeCapitolHero"),
  "office.why.hero": imageHero("office", "office.why.hero", "Why this race matters trail still", "officeWhyHero"),
  "dd.hero": imageHero("direct-democracy", "dd.hero", "Direct democracy forthcoming", "ddHubHero"),
  "dd.ballot.hero": imageHero(
    "direct-democracy",
    "dd.ballot.hero",
    "Ballot process trail still",
    "ddBallotHero",
  ),
  "road.hero": imageHero("from-the-road", "road.hero", "From the Road", "roadHero"),
  "press.hero": imageHero("press-coverage", "press.hero", "Press coverage forthcoming", "pressHero"),
  "events.hero": imageHero("events", "events.hero", "Events on the trail", "eventsHero"),
  "events.request.hero": imageHero("events", "events.request.hero", "Invite Kelly", "eventsRequestHero"),
  "schedule.hero": imageHero("schedule", "schedule.hero", "Schedule forthcoming", "scheduleHero"),
  "listening.hero": imageHero("listening-sessions", "listening.hero", "Listening sessions", "listeningHero"),
  "arkansas.hero": imageHero("arkansas", "arkansas.hero", "Across Arkansas", "arkansasHero"),
  "get-involved.hero": imageHero("get-involved", "get-involved.hero", "Neighbors on the trail", "getInvolvedHero"),
  "donate.hero": imageHero("donate", "donate.hero", "Campaign work forthcoming", "donateHero"),
  "contact.hero": imageHero("contact", "contact.hero", "Contact the campaign", "contactHero"),
  "voter-reg.hero": imageHero(
    "voter-registration",
    "voter-reg.hero",
    "Voter registration help",
    "voterRegHero",
  ),
  "host-gathering.hero": imageHero(
    "host-a-gathering",
    "host-gathering.hero",
    "Host a gathering",
    "hostGatheringHero",
  ),
  "local-team.hero": imageHero(
    "start-a-local-team",
    "local-team.hero",
    "Local teams forthcoming",
    "localTeamHero",
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
