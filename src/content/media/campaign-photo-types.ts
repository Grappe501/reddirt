/**
 * Structured campaign photo assets (launch-first — file-backed).
 * Prefer Unknown over guessing counties/events/people.
 */

export type CampaignPhotoHeroLevel = "HERO" | "FEATURE" | "SUPPORTING" | "UNREVIEWED";

export type CampaignPhotoPublicationStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "APPROVED"
  | "PUBLISHED"
  | "ARCHIVED";

/** Use explicit Unknown rather than inventing geography or identities. */
export type CampaignPhotoFieldValue = string | "Unknown";

export type CampaignPhotoBasicMetadata = {
  originalFilename: string;
  width?: number;
  height?: number;
  orientation?: "LANDSCAPE" | "PORTRAIT" | "SQUARE" | "Unknown";
  fileType?: string;
  captureDateIso?: string | "Unknown";
  gpsLat?: number;
  gpsLng?: number;
  cameraDevice?: string | "Unknown";
};

export type CampaignPhotoCampaignMetadata = {
  eventName: CampaignPhotoFieldValue;
  county: CampaignPhotoFieldValue;
  city: CampaignPhotoFieldValue;
  venue: CampaignPhotoFieldValue;
  eventDate: CampaignPhotoFieldValue;
  photographer: CampaignPhotoFieldValue;
  peopleVisible: string[];
  organizations: string[];
  campaignTheme: CampaignPhotoFieldValue;
  relatedIssue: CampaignPhotoFieldValue;
  relatedSpeechVideoIds: string[];
  relatedBlogPaths: string[];
  relatedEventIds: string[];
  relatedPagePaths: string[];
  homepageCandidate: boolean;
  featuredPhoto: boolean;
};

export type CampaignPhotoAccessibility = {
  altText: string;
  caption: string;
  extendedDescription?: string;
  seoDescription?: string;
};

export type CampaignPhotoRecord = {
  id: string;
  /** Public URL under /public when synced */
  src: string;
  heroLevel: CampaignPhotoHeroLevel;
  publicationStatus: CampaignPhotoPublicationStatus;
  basic: CampaignPhotoBasicMetadata;
  campaign: CampaignPhotoCampaignMetadata;
  accessibility: CampaignPhotoAccessibility;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const UNKNOWN: CampaignPhotoFieldValue = "Unknown";

export function emptyCampaignPhotoCampaignMetadata(): CampaignPhotoCampaignMetadata {
  return {
    eventName: UNKNOWN,
    county: UNKNOWN,
    city: UNKNOWN,
    venue: UNKNOWN,
    eventDate: UNKNOWN,
    photographer: UNKNOWN,
    peopleVisible: [],
    organizations: [],
    campaignTheme: UNKNOWN,
    relatedIssue: UNKNOWN,
    relatedSpeechVideoIds: [],
    relatedBlogPaths: [],
    relatedEventIds: [],
    relatedPagePaths: [],
    homepageCandidate: false,
    featuredPhoto: false,
  };
}
