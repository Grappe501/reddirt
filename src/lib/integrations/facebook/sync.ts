import { ContentPlatform, InboundReviewStatus, InboundSourceType, PlatformConnectionStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { touchPlatformConnection } from "@/lib/orchestrator/upsert-inbound-from-synced-post";
import { createFacebookClient } from "./client";
import { normalizePageFeedEdge } from "./normalize";

export type FacebookSyncResult =
  | { ok: true; upserted: number }
  | { ok: false; error: string; code: "config" | "api" | "unknown" };

/**
 * Ingest recent Page posts into `InboundContentItem`. Requires FACEBOOK_PAGE_ID + token env.
 * Comment ingestion and webhooks are future work.
 */
export async function syncFacebookPageFeed(): Promise<FacebookSyncResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim();
  if (!pageId) {
    await touchPlatformConnection(ContentPlatform.FACEBOOK, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: "FACEBOOK_PAGE_ID not set.",
    });
    return { ok: false, error: "FACEBOOK_PAGE_ID not configured.", code: "config" };
  }

  await touchPlatformConnection(ContentPlatform.FACEBOOK, {
    status: PlatformConnectionStatus.SYNCING,
    lastSyncError: null,
  });

  try {
    const client = createFacebookClient({ pageId });
    const feed = await client.fetchRecentPagePosts({ limit: 25 });
    let upserted = 0;
    for (const edge of feed.data ?? []) {
      const n = normalizePageFeedEdge(edge);
      if (!n) continue;
      await prisma.inboundContentItem.upsert({
        where: {
          sourcePlatform_externalId: {
            sourcePlatform: ContentPlatform.FACEBOOK,
            externalId: n.externalId,
          },
        },
        create: {
          sourcePlatform: ContentPlatform.FACEBOOK,
          sourceType: InboundSourceType.POST,
          externalId: n.externalId,
          title: n.message?.slice(0, 200) ?? "Facebook post",
          excerpt: n.message?.slice(0, 500) ?? null,
          body: n.message,
          canonicalUrl: n.permalinkUrl,
          publishedAt: n.createdTime,
          rawPayload: n.raw as Prisma.InputJsonValue,
          syncTimestamp: new Date(),
          reviewStatus: InboundReviewStatus.PENDING,
        },
        update: {
          title: n.message?.slice(0, 200) ?? undefined,
          excerpt: n.message?.slice(0, 500) ?? undefined,
          body: n.message,
          canonicalUrl: n.permalinkUrl,
          publishedAt: n.createdTime,
          rawPayload: n.raw as Prisma.InputJsonValue,
          syncTimestamp: new Date(),
        },
      });
      upserted += 1;
    }

    await touchPlatformConnection(ContentPlatform.FACEBOOK, {
      status: PlatformConnectionStatus.OK,
      lastSyncError: null,
    });
    return { ok: true, upserted };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Facebook sync failed.";
    await touchPlatformConnection(ContentPlatform.FACEBOOK, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: msg,
    });
    return { ok: false, error: msg, code: "api" };
  }
}

/** Safe default when Graph is not configured — records status without throwing. */
export async function runFacebookIngestionStub(): Promise<FacebookSyncResult> {
  return syncFacebookPageFeed();
}
