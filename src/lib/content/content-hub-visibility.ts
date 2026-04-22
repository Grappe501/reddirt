import { ContentHubKind, ContentPlatform, InboundReviewStatus, Prisma } from "@prisma/client";

/**
 * # Content hub visibility & editorial semantics (Phase 1.5)
 *
 * Single source of truth for **what “public-visible” means** on hub surfaces.
 *
 * ---
 *
 * ## Inbound YouTube (`InboundContentItem`, `sourcePlatform: YOUTUBE`)
 *
 * | State | `reviewStatus` / flags | Meaning |
 * |-------|------------------------|---------|
 * | **Ingested** | `PENDING` (default after sync) | Stored from YouTube API; not yet cleared for public hubs. |
 * | **Reviewed** | `REVIEWED` | Editor approved for public video surfaces. |
 * | **Featured** | `FEATURED` | Editorial highlight; wins ordering and hero fallback. |
 * | **Suppressed / archived** | `SUPPRESSED`, `ARCHIVED` | Never public on hubs. |
 * | **Hidden from site** | `siteHidden: true` | Never public on hubs (operational hide without changing review enum). |
 *
 * **Public-visible for video hubs** (featured video on campaign trail, understand, hero fallbacks, etc.):
 * - `sourcePlatform === YOUTUBE`
 * - `siteHidden === false`
 * - `reviewStatus` ∈ { `REVIEWED`, `FEATURED` }
 *
 * **Homepage featured video** (`getFeaturedYoutubeForHub`):
 * 1. If `HomepageConfig.featuredHomepageVideoInboundId` is set: use that row **only if** it satisfies **public-visible for video hubs** (same rules as above).
 * 2. Else: first **FEATURED** public-visible YouTube row (by `featuredWeight` desc, `publishedAt` desc).
 * 3. Else: first **REVIEWED** public-visible YouTube row with `contentKind` in video-like kinds or `null`.
 *
 * **Pending** items never appear on public video surfaces or homepage hero until a reviewer sets `REVIEWED` or `FEATURED` in Admin → Inbox.
 *
 * ---
 *
 * ## Substack / road (`SyncedPost`)
 *
 * | State | Meaning |
 * |-------|---------|
 * | **Synced** | Row exists from RSS; may be `hidden` or not. |
 * | **Hidden** | `hidden: true` — excluded from all public road surfaces and mirrored inbound `SUPPRESSED`. |
 * | **Public road** | `hidden: false` and `contentKind` is `null`, `STORY`, or `ROAD_UPDATE`. |
 *
 * **Homepage “From the Road” preview** (`listRoadPreviewPosts`):
 * - Public road filter **+** `orderBy: featuredRoadPreview desc, publishedAt desc`, `take: 6`.
 *
 * **`/from-the-road` page** (`listFromTheRoadPosts`):
 * - Same public road filter **+** `orderBy: publishedAt desc`, larger limit.
 *
 * ## Inbound Facebook & Instagram (field posts on `/from-the-road`)
 *
 * - `sourcePlatform` ∈ { `FACEBOOK`, `INSTAGRAM` }
 * - `siteHidden === false`
 * - `reviewStatus` ∈ { `REVIEWED`, `FEATURED` } (same review bar as public YouTube)
 *
 * Ingested via admin platform sync; posts stay `PENDING` until an editor approves in Admin → Inbox.
 *
 * ---
 */

/** Never shown on public video hubs. */
export const INBOUND_VIDEO_REVIEW_EXCLUDED: InboundReviewStatus[] = [
  InboundReviewStatus.PENDING,
  InboundReviewStatus.SUPPRESSED,
  InboundReviewStatus.ARCHIVED,
];

/** Shown on public video hubs and homepage/featured video when combined with `siteHidden: false` and YouTube platform. */
export const INBOUND_VIDEO_REVIEW_PUBLIC: InboundReviewStatus[] = [
  InboundReviewStatus.REVIEWED,
  InboundReviewStatus.FEATURED,
];

/** Prisma filter: YouTube rows eligible for public video surfaces. */
export const inboundYoutubePublicWhere: Prisma.InboundContentItemWhereInput = {
  sourcePlatform: ContentPlatform.YOUTUBE,
  siteHidden: false,
  reviewStatus: { in: INBOUND_VIDEO_REVIEW_PUBLIC },
};

/** Substack posts eligible for road preview + `/from-the-road` (see module doc). */
export const roadPostPublicWhere: Prisma.SyncedPostWhereInput = {
  hidden: false,
  OR: [
    { contentKind: null },
    { contentKind: { in: [ContentHubKind.STORY, ContentHubKind.ROAD_UPDATE] } },
  ],
};

/** Facebook + Instagram: approved for the public /from-the-road field grid (same review band as YouTube on hubs). */
export const inboundSocialFromRoadWhere: Prisma.InboundContentItemWhereInput = {
  sourcePlatform: { in: [ContentPlatform.FACEBOOK, ContentPlatform.INSTAGRAM] },
  siteHidden: false,
  reviewStatus: { in: INBOUND_VIDEO_REVIEW_PUBLIC },
};
