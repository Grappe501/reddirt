import {
  ContentHubKind,
  ContentPlatform,
  InboundReviewStatus,
  InboundSourceType,
  PlatformConnectionStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";

function externalIdForSubstackPost(feedGuid: string | null | undefined, slug: string): string {
  const g = feedGuid?.trim();
  if (g) return `substack:guid:${g}`;
  return `substack:slug:${slug}`;
}

/**
 * Mirrors a `SyncedPost` row into `InboundContentItem` for the orchestrator inbox.
 * Preserves review/routing flags on update unless the post is hidden (forces SUPPRESSED).
 */
export async function upsertInboundFromSyncedPost(syncedPostId: string): Promise<void> {
  const post = await prisma.syncedPost.findUnique({ where: { id: syncedPostId } });
  if (!post) return;

  const externalId = externalIdForSubstackPost(post.feedGuid, post.slug);
  const excerpt = post.teaserOverride?.trim() || post.summary;
  const tagSet = [...post.tagsFromFeed, ...post.localCategories, ...post.localTags].filter(Boolean);
  const issueTags = [...post.issueTags];
  const contentKind: ContentHubKind | null = post.contentKind ?? ContentHubKind.STORY;

  const rawPayloadValue: Prisma.InputJsonValue | typeof Prisma.JsonNull =
    post.rawItem === null || post.rawItem === undefined
      ? Prisma.JsonNull
      : (post.rawItem as Prisma.InputJsonValue);

  await prisma.inboundContentItem.upsert({
    where: {
      sourcePlatform_externalId: {
        sourcePlatform: ContentPlatform.SUBSTACK,
        externalId,
      },
    },
    create: {
      sourcePlatform: ContentPlatform.SUBSTACK,
      sourceType: InboundSourceType.ARTICLE,
      externalId,
      authorName: post.author,
      title: post.title,
      excerpt,
      canonicalUrl: post.canonicalUrl,
      publishedAt: post.publishedAt,
      tags: tagSet,
      issueTags,
      countySlug: post.countySlug,
      countyFips: post.countyFips,
      city: post.city,
      campaignPhase: post.campaignPhase,
      contentSeries: post.contentSeries,
      playlistId: post.playlistId,
      featuredWeight: post.featuredWeight,
      contentKind,
      siteHidden: post.hidden,
      rawPayload: rawPayloadValue,
      syncTimestamp: new Date(),
      reviewStatus: post.hidden ? InboundReviewStatus.SUPPRESSED : InboundReviewStatus.PENDING,
      syncedPostId: post.id,
    },
    update: {
      authorName: post.author,
      title: post.title,
      excerpt,
      canonicalUrl: post.canonicalUrl,
      publishedAt: post.publishedAt,
      tags: tagSet,
      issueTags,
      countySlug: post.countySlug,
      countyFips: post.countyFips,
      city: post.city,
      campaignPhase: post.campaignPhase,
      contentSeries: post.contentSeries,
      playlistId: post.playlistId,
      featuredWeight: post.featuredWeight,
      contentKind,
      siteHidden: post.hidden,
      rawPayload: rawPayloadValue,
      syncTimestamp: new Date(),
      syncedPostId: post.id,
      ...(post.hidden ? { reviewStatus: InboundReviewStatus.SUPPRESSED } : {}),
    },
  });
}

export async function touchPlatformConnection(
  platform: ContentPlatform,
  patch: {
    status: PlatformConnectionStatus;
    lastSyncError?: string | null;
    accountName?: string | null;
  },
): Promise<void> {
  await prisma.platformConnection.upsert({
    where: { platform },
    create: {
      platform,
      status: patch.status,
      syncEnabled: platform === ContentPlatform.SUBSTACK,
      accountName: patch.accountName ?? null,
      lastSyncedAt: patch.status === PlatformConnectionStatus.OK ? new Date() : null,
      lastSyncError: patch.lastSyncError ?? null,
    },
    update: {
      status: patch.status,
      lastSyncedAt: patch.status === PlatformConnectionStatus.OK ? new Date() : undefined,
      lastSyncError: patch.lastSyncError ?? null,
      ...(patch.accountName !== undefined ? { accountName: patch.accountName } : {}),
    },
  });
}
