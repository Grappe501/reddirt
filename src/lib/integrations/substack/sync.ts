import Parser from "rss-parser";
import type { Prisma } from "@prisma/client";
import { ContentPlatform, PlatformConnectionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  touchPlatformConnection,
  upsertInboundFromSyncedPost,
} from "@/lib/orchestrator/upsert-inbound-from-synced-post";
import { fetchSubstackFeedXml, SubstackFeedError } from "./fetchFeed";
import { normalizeRssItem } from "./normalize";
import type { SubstackFeedItemRaw } from "./types";

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail"],
  },
});

export type SubstackSyncResult =
  | { ok: true; upserted: number; feedUrl: string }
  | { ok: false; error: string; code: SubstackFeedError["causeCode"] | "parse" | "unknown" };

async function resolveFeedUrl(explicit?: string | null): Promise<string | null> {
  const trimmed = explicit?.trim();
  if (trimmed) return trimmed;
  const env = process.env.SUBSTACK_FEED_URL?.trim();
  if (env) return env;
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return settings?.substackFeedUrl?.trim() ?? null;
}

export async function syncSubstackPosts(options?: { feedUrl?: string | null }): Promise<SubstackSyncResult> {
  const feedUrl = await resolveFeedUrl(options?.feedUrl ?? null);
  if (!feedUrl) {
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        lastSubstackSyncOk: false,
        lastSubstackSyncError: "No Substack feed URL configured (env SUBSTACK_FEED_URL or admin settings).",
        updatedAt: new Date(),
      },
      update: {
        lastSubstackSyncAt: new Date(),
        lastSubstackSyncOk: false,
        lastSubstackSyncError: "No Substack feed URL configured (env SUBSTACK_FEED_URL or admin settings).",
        updatedAt: new Date(),
      },
    });
    await touchPlatformConnection(ContentPlatform.SUBSTACK, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: "No Substack feed URL configured.",
    });
    return { ok: false, error: "No Substack feed URL configured.", code: "missing_url" };
  }

  let xml: string;
  try {
    xml = await fetchSubstackFeedXml(feedUrl);
  } catch (e) {
    const code =
      e instanceof SubstackFeedError ? e.causeCode : e instanceof Error && e.name === "AbortError" ? "network" : "network";
    const msg = e instanceof Error ? e.message : "Feed fetch failed.";
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        substackFeedUrl: feedUrl,
        lastSubstackSyncAt: new Date(),
        lastSubstackSyncOk: false,
        lastSubstackSyncError: msg,
        updatedAt: new Date(),
      },
      update: {
        substackFeedUrl: feedUrl,
        lastSubstackSyncAt: new Date(),
        lastSubstackSyncOk: false,
        lastSubstackSyncError: msg,
        updatedAt: new Date(),
      },
    });
    await touchPlatformConnection(ContentPlatform.SUBSTACK, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: msg,
    });
    return { ok: false, error: msg, code };
  }

  let feed: Awaited<ReturnType<typeof parser.parseString>>;
  try {
    feed = await parser.parseString(xml);
  } catch {
    const msg = "Could not parse RSS XML.";
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        substackFeedUrl: feedUrl,
        lastSubstackSyncAt: new Date(),
        lastSubstackSyncOk: false,
        lastSubstackSyncError: msg,
        updatedAt: new Date(),
      },
      update: {
        substackFeedUrl: feedUrl,
        lastSubstackSyncAt: new Date(),
        lastSubstackSyncOk: false,
        lastSubstackSyncError: msg,
        updatedAt: new Date(),
      },
    });
    await touchPlatformConnection(ContentPlatform.SUBSTACK, {
      status: PlatformConnectionStatus.ERROR,
      lastSyncError: msg,
    });
    return { ok: false, error: msg, code: "parse" };
  }

  const items = (feed.items ?? []) as SubstackFeedItemRaw[];
  let upserted = 0;

  for (const raw of items) {
    const n = normalizeRssItem(raw);
    if (!n) continue;

    const rawItem = n.rawItem as unknown as Prisma.InputJsonValue;

    const saved = await prisma.syncedPost.upsert({
      where: { slug: n.slug },
      create: {
        feedGuid: n.feedGuid,
        slug: n.slug,
        canonicalUrl: n.canonicalUrl,
        title: n.title,
        summary: n.summary,
        author: n.author,
        publishedAt: n.publishedAt,
        featuredImageUrl: n.featuredImageUrl,
        tagsFromFeed: n.tagsFromFeed,
        source: "substack",
        lastSyncedAt: new Date(),
        rawItem,
      },
      update: {
        feedGuid: n.feedGuid,
        canonicalUrl: n.canonicalUrl,
        title: n.title,
        summary: n.summary,
        author: n.author,
        publishedAt: n.publishedAt,
        featuredImageUrl: n.featuredImageUrl,
        tagsFromFeed: n.tagsFromFeed,
        lastSyncedAt: new Date(),
        rawItem,
      },
    });
    await upsertInboundFromSyncedPost(saved.id);
    upserted += 1;
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      substackFeedUrl: feedUrl,
      lastSubstackSyncAt: new Date(),
      lastSubstackSyncOk: true,
      lastSubstackSyncError: null,
      updatedAt: new Date(),
    },
    update: {
      substackFeedUrl: feedUrl,
      lastSubstackSyncAt: new Date(),
      lastSubstackSyncOk: true,
      lastSubstackSyncError: null,
      updatedAt: new Date(),
    },
  });

  await touchPlatformConnection(ContentPlatform.SUBSTACK, {
    status: PlatformConnectionStatus.OK,
    lastSyncError: null,
    accountName: "Substack RSS",
  });

  return { ok: true, upserted, feedUrl };
}
