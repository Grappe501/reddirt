import Parser from "rss-parser";
import { getCampaignBlogUrl } from "@/config/external-campaign";
import { fetchSubstackFeedXml } from "./fetchFeed";
import { normalizeRssItem } from "./normalize";
import type { SubstackFeedItemRaw } from "./types";

const parser = new Parser({
  customFields: {
    item: ["media:content", "media:thumbnail"],
  },
});

export type PublicSubstackPost = {
  slug: string;
  title: string;
  summary: string;
  canonicalUrl: string;
  publishedAtIso: string | null;
  featuredImageUrl: string | null;
  author: string | null;
};

function resolvePublicFeedUrl(): string {
  const fromEnv = process.env.SUBSTACK_FEED_URL?.trim();
  if (fromEnv) return fromEnv;
  return `${getCampaignBlogUrl()}/feed`;
}

function clipSummary(raw: string, max = 260): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/** Substack / campaign notebook posts for public pages (cached RSS read). */
export async function listPublicSubstackPosts(): Promise<PublicSubstackPost[]> {
  const feedUrl = resolvePublicFeedUrl();
  const xml = await fetchSubstackFeedXml(feedUrl, 20_000, { revalidate: 600 });
  const feed = await parser.parseString(xml);
  const items = (feed.items ?? []) as SubstackFeedItemRaw[];

  const out: PublicSubstackPost[] = [];
  for (const raw of items) {
    const n = normalizeRssItem(raw);
    if (!n) continue;
    out.push({
      slug: n.slug,
      title: n.title,
      summary: clipSummary(n.summary),
      canonicalUrl: n.canonicalUrl,
      publishedAtIso: n.publishedAt ? n.publishedAt.toISOString() : null,
      featuredImageUrl: n.featuredImageUrl,
      author: n.author,
    });
  }

  out.sort((a, b) => {
    if (!a.publishedAtIso) return 1;
    if (!b.publishedAtIso) return -1;
    return b.publishedAtIso.localeCompare(a.publishedAtIso);
  });

  return out;
}
