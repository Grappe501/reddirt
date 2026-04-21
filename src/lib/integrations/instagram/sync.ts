import {
  ContentPlatform,
  InboundReviewStatus,
  InboundSourceType,
  PlatformConnectionStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { touchPlatformConnection } from "@/lib/orchestrator/upsert-inbound-from-synced-post";
import { createInstagramClient } from "./client";
import { normalizeIgMedia } from "./normalize";

export type InstagramSyncResult =
  | { ok: true; upserted: number }
  | { ok: false; error: string; code: "config" | "api" };

export async function syncInstagramMedia(): Promise<InstagramSyncResult> {
  const igUserId = process.env.INSTAGRAM_USER_ID?.trim();
  if (!igUserId) {
    await touchPlatformConnection(ContentPlatform.INSTAGRAM, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: "INSTAGRAM_USER_ID not set.",
    });
    return { ok: false, error: "INSTAGRAM_USER_ID not configured.", code: "config" };
  }

  await touchPlatformConnection(ContentPlatform.INSTAGRAM, {
    status: PlatformConnectionStatus.SYNCING,
    lastSyncError: null,
  });

  try {
    const client = createInstagramClient({ igUserId });
    const feed = await client.fetchRecentMedia({ limit: 25 });
    let upserted = 0;
    for (const edge of feed.data ?? []) {
      const n = normalizeIgMedia(edge);
      if (!n) continue;
      const sourceType =
        n.mediaType === "REELS"
          ? InboundSourceType.REEL
          : n.mediaType === "VIDEO"
            ? InboundSourceType.VIDEO
            : InboundSourceType.POST;
      await prisma.inboundContentItem.upsert({
        where: {
          sourcePlatform_externalId: {
            sourcePlatform: ContentPlatform.INSTAGRAM,
            externalId: n.externalId,
          },
        },
        create: {
          sourcePlatform: ContentPlatform.INSTAGRAM,
          sourceType,
          externalId: n.externalId,
          title: n.caption?.slice(0, 200) ?? "Instagram",
          excerpt: n.caption?.slice(0, 500) ?? null,
          body: n.caption,
          canonicalUrl: n.permalink,
          publishedAt: n.timestamp,
          rawPayload: n.raw as Prisma.InputJsonValue,
          syncTimestamp: new Date(),
          reviewStatus: InboundReviewStatus.PENDING,
        },
        update: {
          sourceType,
          title: n.caption?.slice(0, 200) ?? undefined,
          excerpt: n.caption?.slice(0, 500) ?? undefined,
          body: n.caption,
          canonicalUrl: n.permalink,
          publishedAt: n.timestamp,
          rawPayload: n.raw as Prisma.InputJsonValue,
          syncTimestamp: new Date(),
        },
      });
      upserted += 1;
    }
    await touchPlatformConnection(ContentPlatform.INSTAGRAM, {
      status: PlatformConnectionStatus.OK,
      lastSyncError: null,
    });
    return { ok: true, upserted };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Instagram sync failed.";
    await touchPlatformConnection(ContentPlatform.INSTAGRAM, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: msg,
    });
    return { ok: false, error: msg, code: "api" };
  }
}
