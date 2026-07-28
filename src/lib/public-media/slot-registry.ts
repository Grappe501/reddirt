/**
 * Typed public media slot registry — do not scatter slot strings in components.
 */

import type { OwnedMediaDerivativeType, OwnedMediaKind, PublicMediaPlacementKind } from "@prisma/client";

export const PUBLIC_MEDIA_PAGE_KEYS = ["home"] as const;
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

export type PublicMediaSlotKey = (typeof PUBLIC_MEDIA_HOME_SLOTS)[number];

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
  staticFallbackMediaKey: "heroHome" | "arkansasPorch" | "splitDemocracy" | "splitLabor";
};

const HOME_SLOTS: Record<PublicMediaSlotKey, PublicMediaSlotDefinition> = {
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
  },
};

export function isValidPublicMediaPage(pageKey: string): pageKey is PublicMediaPageKey {
  return (PUBLIC_MEDIA_PAGE_KEYS as readonly string[]).includes(pageKey);
}

export function isValidPublicMediaSlot(slotKey: string): slotKey is PublicMediaSlotKey {
  return (PUBLIC_MEDIA_HOME_SLOTS as readonly string[]).includes(slotKey);
}

export function getPublicMediaSlotDefinition(slotKey: string): PublicMediaSlotDefinition | null {
  if (!isValidPublicMediaSlot(slotKey)) return null;
  return HOME_SLOTS[slotKey];
}

export function listPublicMediaSlotsForPage(pageKey: string): PublicMediaSlotDefinition[] {
  if (!isValidPublicMediaPage(pageKey)) return [];
  return PUBLIC_MEDIA_HOME_SLOTS.map((k) => HOME_SLOTS[k]).filter((d) => d.pageKey === pageKey);
}
