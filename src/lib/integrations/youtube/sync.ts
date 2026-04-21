import {
  ContentHubKind,
  ContentPlatform,
  InboundReviewStatus,
  InboundSourceType,
  MediaKind,
  PlatformConnectionStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { touchPlatformConnection } from "@/lib/orchestrator/upsert-inbound-from-synced-post";
import { createYouTubeClient } from "./client";
import { normalizeSearchVideoItem } from "./normalize";

export type YouTubeSyncResult =
  | { ok: true; upserted: number }
  | { ok: false; error: string; code: "config" | "api" };

export async function syncYouTubeChannelSearch(): Promise<YouTubeSyncResult> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID?.trim();
  if (!channelId) {
    await touchPlatformConnection(ContentPlatform.YOUTUBE, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: "YOUTUBE_CHANNEL_ID not set.",
    });
    return { ok: false, error: "YOUTUBE_CHANNEL_ID not configured.", code: "config" };
  }

  await touchPlatformConnection(ContentPlatform.YOUTUBE, {
    status: PlatformConnectionStatus.SYNCING,
    lastSyncError: null,
  });

  try {
    const client = createYouTubeClient({ channelId });
    const { items } = await client.listChannelUploads({ maxResults: 25 });
    let upserted = 0;
    for (const item of items) {
      const n = normalizeSearchVideoItem(item);
      if (!n) continue;

      let mediaAssetId: string | null = null;
      if (n.thumbnailUrl) {
        const existing = await prisma.mediaAsset.findFirst({
          where: { originPlatform: ContentPlatform.YOUTUBE, originExternalId: n.videoId },
        });
        if (existing) {
          mediaAssetId = existing.id;
          await prisma.mediaAsset.update({
            where: { id: existing.id },
            data: {
              url: n.thumbnailUrl,
              kind: MediaKind.IMAGE,
              width: n.thumbnailWidth ?? undefined,
              height: n.thumbnailHeight ?? undefined,
              alt: n.title ? `${n.title} — thumbnail` : "Video thumbnail",
            },
          });
        } else {
          const created = await prisma.mediaAsset.create({
            data: {
              url: n.thumbnailUrl,
              kind: MediaKind.IMAGE,
              width: n.thumbnailWidth ?? undefined,
              height: n.thumbnailHeight ?? undefined,
              alt: n.title ? `${n.title} — thumbnail` : "Video thumbnail",
              originPlatform: ContentPlatform.YOUTUBE,
              originExternalId: n.videoId,
            },
          });
          mediaAssetId = created.id;
        }
      }

      await prisma.inboundContentItem.upsert({
        where: {
          sourcePlatform_externalId: {
            sourcePlatform: ContentPlatform.YOUTUBE,
            externalId: n.externalId,
          },
        },
        create: {
          sourcePlatform: ContentPlatform.YOUTUBE,
          sourceType: InboundSourceType.VIDEO,
          externalId: n.externalId,
          title: n.title ?? "YouTube video",
          excerpt: n.description?.slice(0, 500) ?? null,
          body: n.description,
          canonicalUrl: n.canonicalUrl,
          publishedAt: n.publishedAt,
          mediaAssetId,
          contentKind: ContentHubKind.VIDEO,
          playlistId: n.playlistId,
          rawPayload: n.raw as Prisma.InputJsonValue,
          syncTimestamp: new Date(),
          /** Ingested only — reviewers set `REVIEWED` or `FEATURED` in Admin → Inbox before public hubs show the clip. */
          reviewStatus: InboundReviewStatus.PENDING,
        },
        update: {
          title: n.title ?? undefined,
          excerpt: n.description?.slice(0, 500) ?? undefined,
          body: n.description,
          canonicalUrl: n.canonicalUrl,
          publishedAt: n.publishedAt,
          mediaAssetId: mediaAssetId ?? undefined,
          contentKind: ContentHubKind.VIDEO,
          playlistId: n.playlistId ?? undefined,
          rawPayload: n.raw as Prisma.InputJsonValue,
          syncTimestamp: new Date(),
        },
      });
      upserted += 1;
    }
    await touchPlatformConnection(ContentPlatform.YOUTUBE, {
      status: PlatformConnectionStatus.OK,
      lastSyncError: null,
    });
    return { ok: true, upserted };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "YouTube sync failed.";
    await touchPlatformConnection(ContentPlatform.YOUTUBE, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: msg,
    });
    return { ok: false, error: msg, code: "api" };
  }
}
