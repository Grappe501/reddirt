/**
 * Canonical file-backed campaign photo registry (launch-first).
 * Do not invent counties, events, or people — use "Unknown" until confirmed.
 *
 * Existing trail stills remain in `campaign-trail-photos.ts` until individually
 * promoted here with real captions/alt/county metadata.
 */

import type { CampaignPhotoRecord } from "@/content/media/campaign-photo-types";
import { UNKNOWN } from "@/content/media/campaign-photo-types";

/**
 * Structured photo assets ready for county pages / Journey / Meet Kelly.
 */
export const CAMPAIGN_PHOTO_REGISTRY: CampaignPhotoRecord[] = [
  {
    id: "afl-cio-pre-event-networking-20260629",
    src: "/media/campaign-photos/afl-cio-pre-event-networking-20260629.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260629_103631.png",
      width: 1536,
      height: 2048,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "AFL-CIO Meeting",
      county: UNKNOWN,
      city: UNKNOWN,
      venue: UNKNOWN,
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: ["Arkansas AFL-CIO"],
      campaignTheme: "Coalition Building",
      relatedIssue: "Labor",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about", "/about/journey", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe talks with attendees before addressing an Arkansas AFL-CIO gathering, standing in conversation inside the event venue.",
      caption:
        "Kelly Grappe speaks with attendees before addressing the Arkansas AFL-CIO meeting, where she later earned the organization's endorsement for Secretary of State.",
      extendedDescription:
        "Kelly Grappe visits with attendees before speaking at an Arkansas AFL-CIO event. Rather than preparing in isolation, she is pictured engaging directly with participants in conversation shortly before delivering remarks that resulted in the organization's endorsement of her campaign for Secretary of State.",
      seoDescription:
        "Kelly Grappe meets with attendees before an Arkansas AFL-CIO meeting that later endorsed her for Secretary of State.",
    },
    notes:
      "Candid pre-event networking; Feature photo (not homepage hero). Location/county/city pending confirmation. Story tags: Leadership, Listening, Coalition Building, Campaign Trail, Labor, Endorsements, Community Engagement. Suggested placement: Endorsements, Campaign Journey, Meet Kelly; secondary Labor/Workforce, News, Photo Gallery, Kelly Across Arkansas.",
    createdAt: "2026-07-28T05:33:00.000Z",
    updatedAt: "2026-07-28T05:33:00.000Z",
  },
  {
    id: "mena-polk-meet-greet-20260411",
    src: "/media/campaign-photos/mena-polk-meet-greet-20260411.png",
    heroLevel: "FEATURE",
    publicationStatus: "DRAFT",
    basic: {
      originalFilename: "20260411_112755.png",
      width: 1536,
      height: 2048,
      orientation: "PORTRAIT",
      fileType: "image/png",
      captureDateIso: UNKNOWN,
      cameraDevice: UNKNOWN,
    },
    campaign: {
      eventName: "Candidate Meet & Greet in the Park",
      county: "Polk",
      city: "Mena",
      venue: "Park (Mena)",
      eventDate: UNKNOWN,
      photographer: UNKNOWN,
      peopleVisible: ["Kelly Grappe"],
      organizations: [],
      campaignTheme: "Community Engagement",
      relatedIssue: "Voter Outreach",
      relatedSpeechVideoIds: [],
      relatedBlogPaths: [],
      relatedEventIds: [],
      relatedPagePaths: ["/about/journey", "/about", "/counties/polk", "/volunteer", "/get-involved"],
      homepageCandidate: false,
      featuredPhoto: true,
    },
    accessibility: {
      altText:
        "Kelly Grappe speaks with a voter at a campaign information table during a community meet-and-greet in Mena, Arkansas.",
      caption:
        "Kelly Grappe visits with voters during a community candidate meet-and-greet in Mena, Arkansas, answering questions and discussing her vision for the Secretary of State's office.",
      extendedDescription:
        "Kelly Grappe talks with a community member beside her campaign table at a candidate meet-and-greet in Mena, Arkansas. Campaign literature, yard signs, and volunteer materials are displayed as residents gather in the park to meet candidates and discuss issues affecting their community.",
      seoDescription:
        "Kelly Grappe meets voters at a candidate meet-and-greet in Mena, Polk County, Arkansas.",
    },
    notes:
      "Feature photo (4.5/5) — retail politics / candid conversation. Tags: Community Engagement, Listening, Campaign Trail, Retail Politics, Meet & Greet, Polk County, Mena, Voter Outreach. Primary: Kelly Across Arkansas, Campaign Journey, Meet Kelly. Secondary: Polk County page, Volunteer, Events, Photo Gallery. Related org host pending if civic group confirmed.",
    createdAt: "2026-07-28T05:35:00.000Z",
    updatedAt: "2026-07-28T05:35:00.000Z",
  },
];

export function listCampaignPhotos(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY;
}

export function listPublishedCampaignPhotos(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY.filter((p) => p.publicationStatus === "PUBLISHED");
}

export function getCampaignPhotoById(id: string): CampaignPhotoRecord | null {
  return CAMPAIGN_PHOTO_REGISTRY.find((p) => p.id === id) ?? null;
}

export function listCampaignPhotosByCounty(county: string): CampaignPhotoRecord[] {
  const c = county.trim().toLowerCase().replace(/\s+county$/, "");
  if (!c) return [];
  return CAMPAIGN_PHOTO_REGISTRY.filter((p) => {
    if (p.campaign.county === "Unknown") return false;
    const stored = p.campaign.county.toLowerCase().replace(/\s+county$/, "");
    return stored === c || stored.includes(c) || c.includes(stored);
  });
}

export function listFeatureCandidates(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY.filter(
    (p) =>
      p.heroLevel === "FEATURE" &&
      (p.publicationStatus === "DRAFT" ||
        p.publicationStatus === "IN_REVIEW" ||
        p.publicationStatus === "APPROVED" ||
        p.publicationStatus === "PUBLISHED"),
  );
}

export function listHeroCandidates(): CampaignPhotoRecord[] {
  return CAMPAIGN_PHOTO_REGISTRY.filter(
    (p) => p.heroLevel === "HERO" && (p.publicationStatus === "APPROVED" || p.publicationStatus === "PUBLISHED"),
  );
}

export function assertCampaignPhotoRegistryInvariants(
  records: CampaignPhotoRecord[] = CAMPAIGN_PHOTO_REGISTRY,
): void {
  const ids = new Set<string>();
  for (const p of records) {
    if (ids.has(p.id)) throw new Error(`Duplicate photo id: ${p.id}`);
    ids.add(p.id);
    if (!p.src.trim()) throw new Error(`Photo missing src: ${p.id}`);
    if (p.publicationStatus === "PUBLISHED") {
      if (!p.accessibility.altText.trim()) throw new Error(`Published photo missing alt: ${p.id}`);
      if (!p.accessibility.caption.trim()) throw new Error(`Published photo missing caption: ${p.id}`);
    }
    if (p.campaign.peopleVisible.some((name) => !name.trim())) {
      throw new Error(`Empty peopleVisible entry: ${p.id}`);
    }
  }
}
