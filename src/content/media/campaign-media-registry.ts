/**
 * Canonical file-backed campaign media registry (Pass 1).
 * Do not scatter YouTube IDs in page components — import selectors from here.
 */

import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { emptyTranscript, isPublicMedia, isPublicTranscript, youtubePosterUrl } from "@/lib/media/campaign-transcript";
import { mergeMediaWithPublishedOverlay } from "@/lib/media/youtube-transcripts/publish-overlay";
import { extractCanonicalYoutubeVideoId } from "@/lib/media/youtube-id";

function withOverlay(media: CampaignMediaRecord): CampaignMediaRecord {
  return mergeMediaWithPublishedOverlay(media);
}

function record(
  partial: Omit<CampaignMediaRecord, "provider" | "transcript" | "thumbnailUrl"> & {
    transcript?: CampaignMediaRecord["transcript"];
    thumbnailUrl?: string;
  },
): CampaignMediaRecord {
  const { transcript, thumbnailUrl, ...rest } = partial;
  return {
    ...rest,
    provider: "YOUTUBE",
    transcript: transcript ?? emptyTranscript(),
    thumbnailUrl: thumbnailUrl ?? youtubePosterUrl(rest.youtubeVideoId),
  };
}

/**
 * Editorial review pending titles must stay DRAFT / IN_REVIEW until verified.
 * PUBLISHED records below use only campaign-verified public titles from Phase 1C packet.
 */
export const CAMPAIGN_MEDIA_REGISTRY: CampaignMediaRecord[] = [
  record({
    id: "office-belongs-to-the-people",
    slug: "this-office-belongs-to-the-people",
    youtubeVideoId: "eKVz5pFJxtk",
    format: "FULL_VIDEO",
    title: "This Office Belongs to the People!",
    shortTitle: "This Office Belongs to the People",
    description:
      "Kelly Grappe on the governing philosophy that the Secretary of State’s office belongs to the people of Arkansas.",
    summary: "Primary campaign message: Government That Works for Every Arkansan — People Over Politics.",
    topics: ["Vision", "People Over Politics", "Secretary of State"],
    relatedPagePaths: ["/priorities", "/about"],
    featured: true,
    homepageEligible: true,
    publicationStatus: "PUBLISHED",
  }),
  record({
    id: "ripples-hot-springs-village",
    slug: "creating-the-ripples-in-hot-springs-village",
    youtubeVideoId: "aO712RsR0pQ",
    format: "CAMPAIGN_STORY",
    title: "Creating the Ripples in Hot Springs Village",
    shortTitle: "Creating Ripples Across Arkansas",
    description:
      "Campaign momentum and community presence from Hot Springs Village — Kelly Across Arkansas.",
    summary: "Personality and momentum story from the campaign trail.",
    topics: ["Campaign Trail", "Community", "Hot Springs Village"],
    counties: ["Garland"],
    relatedPagePaths: ["/about/journey", "/get-involved", "/volunteer"],
    featured: true,
    homepageEligible: true,
    publicationStatus: "PUBLISHED",
  }),
  record({
    id: "county-clerk-convention-forum-2026",
    slug: "arkansas-county-clerk-convention-forum-2026",
    youtubeVideoId: "Hl_n-A9aL1s",
    format: "CANDIDATE_FORUM",
    title: "Arkansas County Clerk Convention Secretary of State Candidate Forum 2026",
    shortTitle: "County Clerk Convention Candidate Forum",
    description:
      "Kelly Grappe at the Arkansas County Clerk Convention — election administration and county partnerships.",
    summary: "Qualification and election-administration forum appearance.",
    topics: ["Elections", "County Clerks", "Election Security"],
    relatedPagePaths: ["/priorities", "/about", "/understand"],
    featured: true,
    homepageEligible: false,
    publicationStatus: "PUBLISHED",
  }),
  record({
    id: "primary-election-night",
    slug: "primary-election-night",
    youtubeVideoId: "amiTVLt85AM",
    format: "CAMPAIGN_STORY",
    title: "Primary Election Night",
    description: "Primary election night — a campaign built with the people of Arkansas.",
    summary: "Campaign journey milestone: volunteers, supporters, and community.",
    topics: ["Campaign Journey", "Volunteers", "Momentum"],
    relatedPagePaths: ["/about", "/get-involved", "/volunteer"],
    featured: true,
    homepageEligible: false,
    publicationStatus: "PUBLISHED",
  }),
  record({
    id: "leadership-speech-kz33isxz0zq",
    slug: "campaign-video-editorial-review-pending-kz33",
    youtubeVideoId: "KZ33iSxZ0ZQ",
    format: "LEADERSHIP_ADDRESS",
    title: "Campaign Video — Editorial Review Pending",
    description: "Leadership speech pending editorial title and transcript review.",
    topics: ["Leadership"],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-speech-srzdujbvfrs",
    slug: "campaign-video-editorial-review-pending-srzd",
    youtubeVideoId: "SrzDUJBvFrs",
    format: "FULL_VIDEO",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign speech pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-video-c2v1uznumf4",
    slug: "campaign-video-editorial-review-pending-c2v1",
    youtubeVideoId: "c2v1uZNUMf4",
    format: "FULL_VIDEO",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign video pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-speech-provisional-m7mlk",
    slug: "campaign-video-editorial-review-pending-m7ml",
    youtubeVideoId: "m7Mlk_bUbq4",
    format: "FULL_VIDEO",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign speech pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-video-72okvawfzzw",
    slug: "campaign-video-editorial-review-pending-72ok",
    youtubeVideoId: "72oKVAwfzZw",
    format: "FULL_VIDEO",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign video pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-video-3iwsa5gwmdc",
    slug: "campaign-video-editorial-review-pending-3iws",
    youtubeVideoId: "3iWSa5Gwmdc",
    format: "FULL_VIDEO",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign video pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-short-52egsv4wwgc",
    slug: "campaign-short-editorial-review-pending-52eg",
    youtubeVideoId: "52egsV4WWgc",
    format: "SHORT",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign Short (9:16) pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-short-x6m-smmbyq4",
    slug: "campaign-short-editorial-review-pending-x6m",
    youtubeVideoId: "X6M_SMmbYQ4",
    format: "SHORT",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign Short (9:16) pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-short-scytosxso3a",
    slug: "campaign-short-editorial-review-pending-scyt",
    youtubeVideoId: "scytoSXSO3A",
    format: "SHORT",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign Short (9:16) pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-short-1bofm9ao8bu",
    slug: "campaign-short-editorial-review-pending-1bof",
    youtubeVideoId: "1BOFM9ao8bU",
    format: "SHORT",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign Short (9:16) pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-short-btgyhwuxqi",
    slug: "campaign-short-editorial-review-pending-btgy",
    youtubeVideoId: "b_tGYhWuXqI",
    format: "SHORT",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign Short (9:16) pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-short-scpu5qasitq",
    slug: "campaign-short-editorial-review-pending-scpu",
    youtubeVideoId: "Scpu5qASiTQ",
    format: "SHORT",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign Short (9:16) pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-short-kscpwlsgt0o",
    slug: "campaign-short-editorial-review-pending-kscp",
    youtubeVideoId: "KSCpwLsGT0o",
    format: "SHORT",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign Short (9:16) pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-short-drvbq75fcma",
    slug: "campaign-short-editorial-review-pending-drvb",
    youtubeVideoId: "dRVbQ75FcmA",
    format: "SHORT",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign Short (9:16) pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-video-mihybn8zpr0",
    slug: "campaign-video-editorial-review-pending-mihy",
    youtubeVideoId: "Mihybn8zPR0",
    format: "FULL_VIDEO",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign video pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
  record({
    id: "campaign-video-gxsq4xrogyk",
    slug: "campaign-video-editorial-review-pending-gxsq",
    youtubeVideoId: "GXSQ4XroGyk",
    format: "FULL_VIDEO",
    title: "Campaign Video — Editorial Review Pending",
    description: "Campaign video pending editorial title and transcript review.",
    topics: [],
    relatedPagePaths: ["/kelly-speaks"],
    featured: false,
    homepageEligible: false,
    publicationStatus: "DRAFT",
  }),
];

export function listCampaignMedia(): CampaignMediaRecord[] {
  return CAMPAIGN_MEDIA_REGISTRY.map(withOverlay);
}

export function listPublishedCampaignMedia(): CampaignMediaRecord[] {
  return listCampaignMedia().filter(isPublicMedia);
}

export function getCampaignMediaById(id: string): CampaignMediaRecord | null {
  const m = CAMPAIGN_MEDIA_REGISTRY.find((x) => x.id === id);
  return m ? withOverlay(m) : null;
}

export function getCampaignMediaBySlug(slug: string): CampaignMediaRecord | null {
  const m = CAMPAIGN_MEDIA_REGISTRY.find((x) => x.slug === slug);
  return m ? withOverlay(m) : null;
}

export function getPublishedCampaignMediaBySlug(slug: string): CampaignMediaRecord | null {
  const m = getCampaignMediaBySlug(slug);
  return m && isPublicMedia(m) ? m : null;
}

export function getCampaignMediaByYoutubeId(youtubeVideoId: string): CampaignMediaRecord | null {
  const canonical = extractCanonicalYoutubeVideoId(youtubeVideoId) ?? youtubeVideoId.trim();
  const m = CAMPAIGN_MEDIA_REGISTRY.find((x) => x.youtubeVideoId === canonical);
  return m ? withOverlay(m) : null;
}

export function listPublishedWithTranscript(): CampaignMediaRecord[] {
  return listPublishedCampaignMedia().filter(isPublicTranscript);
}

export function assertCampaignMediaRegistryInvariants(records: CampaignMediaRecord[] = CAMPAIGN_MEDIA_REGISTRY): void {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const yt = new Set<string>();
  for (const m of records) {
    if (ids.has(m.id)) throw new Error(`Duplicate media id: ${m.id}`);
    if (slugs.has(m.slug)) throw new Error(`Duplicate slug: ${m.slug}`);
    if (yt.has(m.youtubeVideoId)) throw new Error(`Duplicate YouTube id: ${m.youtubeVideoId}`);
    ids.add(m.id);
    slugs.add(m.slug);
    yt.add(m.youtubeVideoId);
    if (m.publicationStatus === "PUBLISHED" && !m.title.trim()) {
      throw new Error(`Published media missing title: ${m.id}`);
    }
    if (m.transcript.status === "PUBLISHED") {
      if (!m.transcript.plainText.trim()) throw new Error(`Published transcript empty: ${m.id}`);
      for (const seg of m.transcript.segments) {
        if (!seg.text.trim()) throw new Error(`Empty transcript segment: ${m.id}/${seg.id}`);
      }
    }
    if (m.format === "SHORT" && m.publicationStatus === "PUBLISHED") {
      /* SHORT format is the Short discriminator */
    }
  }
}
