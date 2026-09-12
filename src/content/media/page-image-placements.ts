import { media, type MediaKey } from "@/content/media/registry";
import { listAllPublicMediaSlots, type PublicMediaSlotKey } from "@/lib/public-media/slot-registry";

export type PageImagePlacement = {
  id: string;
  page: string;
  path: string;
  mediaKey: MediaKey;
  slotKey?: PublicMediaSlotKey;
  kind: "slot" | "inline";
};

/**
 * Every visitor-page still we pin (heroes + section stills).
 * County albums, campaign-photo folders, and homepage photo galleries are not listed —
 * those folders may repeat a still that also lives on a page.
 */
export const PAGE_IMAGE_PLACEMENTS: PageImagePlacement[] = [
  ...listAllPublicMediaSlots().map((slot) => ({
    id: `slot:${slot.slotKey}`,
    page: slot.pageKey,
    path: slot.pageKey === "home" ? "/" : `/${slot.pageKey}`,
    mediaKey: slot.staticFallbackMediaKey,
    slotKey: slot.slotKey,
    kind: "slot" as const,
  })),
  { id: "inline:communityFooter", page: "about-community", path: "/about/community", mediaKey: "communityFooterStill", kind: "inline" },
  { id: "inline:whySos", page: "about-why", path: "/about/why-im-running", mediaKey: "whySosStill", kind: "inline" },
  { id: "inline:experienceRelevance", page: "about", path: "/about/experience", mediaKey: "experienceRelevanceStill", kind: "inline" },
  { id: "inline:aboutRural", page: "about", path: "/about", mediaKey: "aboutRuralStill", kind: "inline" },
  { id: "inline:aboutFamily", page: "about", path: "/about", mediaKey: "aboutFamilyStill", kind: "inline" },
  { id: "inline:priorityVoice", page: "priorities", path: "/priorities", mediaKey: "priorityPeoplesVoiceStill", kind: "inline" },
  { id: "inline:priorityTransparency", page: "priorities", path: "/priorities", mediaKey: "priorityTransparencyStill", kind: "inline" },
  { id: "inline:priorityEngagement", page: "priorities", path: "/priorities", mediaKey: "priorityEngagementStill", kind: "inline" },
  { id: "inline:understandTwoLevels", page: "understand", path: "/understand", mediaKey: "understandTwoLevelsStill", kind: "inline" },
  { id: "inline:officeCountyOfficials", page: "office", path: "/office/elections", mediaKey: "officeCountyOfficialsStill", kind: "inline" },
  { id: "inline:officeBusinessFooter", page: "office", path: "/office/business", mediaKey: "officeBusinessFooterStill", kind: "inline" },
  { id: "inline:officeNotariesFooter", page: "office", path: "/office/notaries", mediaKey: "officeNotariesFooterStill", kind: "inline" },
  { id: "inline:officeRecordsFooter", page: "office", path: "/office/records", mediaKey: "officeRecordsFooterStill", kind: "inline" },
  { id: "inline:officeCapitolFooter", page: "office", path: "/office/capitol", mediaKey: "officeCapitolFooterStill", kind: "inline" },
  { id: "inline:officeWhyFooter", page: "office", path: "/office/why-this-race-matters", mediaKey: "officeWhyFooterStill", kind: "inline" },
  { id: "inline:ddTitleReview", page: "direct-democracy", path: "/direct-democracy/ballot-initiative-process", mediaKey: "ddBallotTitleReviewStill", kind: "inline" },
  { id: "inline:ddPetitions", page: "direct-democracy", path: "/direct-democracy/ballot-initiative-process", mediaKey: "ddBallotPetitionsStill", kind: "inline" },
  { id: "inline:ddWhyRace", page: "direct-democracy", path: "/direct-democracy/ballot-initiative-process", mediaKey: "ddBallotWhyRaceStill", kind: "inline" },
  { id: "inline:whatWeBelieve", page: "about", path: "/what-we-believe", mediaKey: "whatWeBelieveStill", kind: "inline" },
  { id: "inline:resources", page: "get-involved", path: "/resources", mediaKey: "resourcesHero", kind: "inline" },
  { id: "inline:editorialLocalPower", page: "editorial", path: "/editorial", mediaKey: "editorialLocalPower", kind: "inline" },
];

const PATH_TO_OG_MEDIA: Record<string, MediaKey> = {
  "/": "heroHome",
  "/about": "aboutHero",
  "/about/experience": "aboutExperienceHero",
  "/about/why-im-running": "whyHero",
  "/about/community": "communityHero",
  "/about/journey": "journeyHero",
  "/priorities": "prioritiesHero",
  "/endorsements": "endorsementsHero",
  "/understand": "understandHero",
  "/office": "officeHubHero",
  "/office/elections": "officeElectionsHero",
  "/office/business": "officeBusinessHero",
  "/office/notaries": "officeNotariesHero",
  "/office/records": "officeRecordsHero",
  "/office/capitol": "officeCapitolHero",
  "/office/why-this-race-matters": "officeWhyHero",
  "/direct-democracy": "ddHubHero",
  "/direct-democracy/ballot-initiative-process": "ddBallotHero",
  "/from-the-road": "roadHero",
  "/press-coverage": "pressHero",
  "/events": "eventsHero",
  "/events/request": "eventsRequestHero",
  "/schedule": "scheduleHero",
  "/listening-sessions": "listeningHero",
  "/arkansas": "arkansasHero",
  "/arkansas-visits": "arkansasHero",
  "/get-involved": "getInvolvedHero",
  "/volunteer": "getInvolvedHero",
  "/donate": "donateHero",
  "/contact": "contactHero",
  "/host-a-gathering": "hostGatheringHero",
  "/start-a-local-team": "localTeamHero",
  "/campaign-photos": "campaignPhotosIntro",
  "/what-we-believe": "whatWeBelieveStill",
  "/resources": "resourcesHero",
  "/kelly-speaks": "speaksHero",
};

export function ogStillForPath(path: string): (typeof media)[MediaKey] | null {
  const key = PATH_TO_OG_MEDIA[path.replace(/\/$/, "") || "/"];
  return key ? media[key] : null;
}

export function assertPageImagePlacementsUnique(): { src: string; ids: string[] }[] {
  const bySrc = new Map<string, string[]>();
  for (const placement of PAGE_IMAGE_PLACEMENTS) {
    const src = media[placement.mediaKey]?.src;
    if (!src || src.includes("/placeholders/")) continue;
    const ids = bySrc.get(src) ?? [];
    ids.push(placement.id);
    bySrc.set(src, ids);
  }
  return [...bySrc.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([src, ids]) => ({ src, ids }));
}
