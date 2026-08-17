import Parser from "rss-parser";
import {
  fromTheRoadPostHref,
  getCampaignBlogCommentsUrl,
  getCampaignBlogPostUrl,
  getCampaignBlogUrl,
} from "@/config/external-campaign";
import { fetchSubstackFeedXml } from "./fetchFeed";
import { normalizeRssItem } from "./normalize";
import { isLikelyPaywalledHtml, sanitizeSubstackArticleHtml } from "./sanitize-public-html";
import type { SubstackFeedItemRaw } from "./types";

const parser = new Parser({
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      "media:content",
      "media:thumbnail",
    ],
  },
});

const SKIP_SLUGS = new Set(["coming-soon"]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const REVALIDATE_SECONDS = 600;

export type PublicSubstackPost = {
  slug: string;
  title: string;
  summary: string;
  canonicalUrl: string;
  publishedAtIso: string | null;
  featuredImageUrl: string | null;
  author: string | null;
  htmlBody: string;
  isLikelyPaywalled: boolean;
  commentUrl: string;
  nativeHref: string;
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

function isUsableSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !SKIP_SLUGS.has(slug.toLowerCase());
}

async function fetchSubstackJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "RedDirtSite/1.0 (public journal)",
      },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type ArchiveRow = {
  slug?: string;
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  truncated_body_text?: string | null;
  canonical_url?: string;
  post_date?: string;
  cover_image?: string | null;
  audience?: string | null;
  publishedBylines?: { name?: string }[];
};

function fromArchiveRow(row: ArchiveRow): PublicSubstackPost | null {
  const slug = row.slug?.trim() ?? "";
  if (!isUsableSlug(slug)) return null;
  const title = (row.title ?? "Untitled").trim();
  const summary = clipSummary(
    (row.truncated_body_text || row.description || row.subtitle || title).trim(),
  );
  return {
    slug,
    title,
    summary,
    canonicalUrl: row.canonical_url?.trim() || getCampaignBlogPostUrl(slug),
    publishedAtIso: row.post_date ?? null,
    featuredImageUrl: row.cover_image?.trim() || null,
    author: row.publishedBylines?.[0]?.name?.trim() || null,
    htmlBody: "",
    isLikelyPaywalled: (row.audience ?? "everyone") !== "everyone",
    commentUrl: getCampaignBlogCommentsUrl(slug),
    nativeHref: fromTheRoadPostHref(slug),
  };
}

type PostApiResponse = {
  slug?: string;
  title?: string;
  description?: string | null;
  truncated_body_text?: string | null;
  body_html?: string | null;
  canonical_url?: string;
  post_date?: string;
  cover_image?: string | null;
  audience?: string | null;
  publishedBylines?: { name?: string }[];
};

function fromApiPost(row: PostApiResponse): PublicSubstackPost | null {
  const slug = row.slug?.trim() ?? "";
  if (!isUsableSlug(slug)) return null;
  const htmlBody = sanitizeSubstackArticleHtml(row.body_html ?? "");
  const summary = clipSummary(
    (row.truncated_body_text || row.description || row.title || "").trim(),
  );
  const paywalled =
    (row.audience ?? "everyone") !== "everyone" || isLikelyPaywalledHtml(htmlBody);
  return {
    slug,
    title: (row.title ?? "Untitled").trim(),
    summary,
    canonicalUrl: row.canonical_url?.trim() || getCampaignBlogPostUrl(slug),
    publishedAtIso: row.post_date ?? null,
    featuredImageUrl: row.cover_image?.trim() || null,
    author: row.publishedBylines?.[0]?.name?.trim() || null,
    htmlBody,
    isLikelyPaywalled: paywalled,
    commentUrl: getCampaignBlogCommentsUrl(slug),
    nativeHref: fromTheRoadPostHref(slug),
  };
}

function fromRssItem(raw: SubstackFeedItemRaw): PublicSubstackPost | null {
  const n = normalizeRssItem(raw);
  if (!n || !isUsableSlug(n.slug)) return null;
  const encoded = typeof raw.contentEncoded === "string" ? raw.contentEncoded : "";
  const htmlBody = sanitizeSubstackArticleHtml(encoded || n.rawItem.content || "");
  return {
    slug: n.slug,
    title: n.title,
    summary: clipSummary(n.summary),
    canonicalUrl: n.canonicalUrl,
    publishedAtIso: n.publishedAt ? n.publishedAt.toISOString() : null,
    featuredImageUrl: n.featuredImageUrl,
    author: n.author,
    htmlBody,
    isLikelyPaywalled: isLikelyPaywalledHtml(htmlBody),
    commentUrl: getCampaignBlogCommentsUrl(n.slug),
    nativeHref: fromTheRoadPostHref(n.slug),
  };
}

function mergePosts(primary: PublicSubstackPost[], overlay: PublicSubstackPost[]): PublicSubstackPost[] {
  const bySlug = new Map<string, PublicSubstackPost>();
  for (const post of overlay) bySlug.set(post.slug, post);
  for (const post of primary) {
    const existing = bySlug.get(post.slug);
    if (!existing) {
      bySlug.set(post.slug, post);
      continue;
    }
    bySlug.set(post.slug, {
      ...existing,
      ...post,
      htmlBody: post.htmlBody || existing.htmlBody,
      featuredImageUrl: post.featuredImageUrl || existing.featuredImageUrl,
      summary: post.summary || existing.summary,
    });
  }
  return [...bySlug.values()].sort((a, b) => {
    if (!a.publishedAtIso) return 1;
    if (!b.publishedAtIso) return -1;
    return b.publishedAtIso.localeCompare(a.publishedAtIso);
  });
}

async function listFromRss(): Promise<PublicSubstackPost[]> {
  const feedUrl = resolvePublicFeedUrl();
  const xml = await fetchSubstackFeedXml(feedUrl, 20_000, { revalidate: REVALIDATE_SECONDS });
  const feed = await parser.parseString(xml);
  const items = (feed.items ?? []) as SubstackFeedItemRaw[];
  const out: PublicSubstackPost[] = [];
  for (const raw of items) {
    const post = fromRssItem(raw);
    if (post) out.push(post);
  }
  return out;
}

async function listFromArchive(): Promise<PublicSubstackPost[]> {
  const url = `${getCampaignBlogUrl()}/api/v1/archive?sort=new&search=&offset=0&limit=50`;
  const rows = await fetchSubstackJson<ArchiveRow[]>(url);
  if (!Array.isArray(rows)) return [];
  const out: PublicSubstackPost[] = [];
  for (const row of rows) {
    const post = fromArchiveRow(row);
    if (post) out.push(post);
  }
  return out;
}

/** Substack / campaign notebook posts for public pages (cached RSS + archive). */
export async function listPublicSubstackPosts(): Promise<PublicSubstackPost[]> {
  const [rss, archive] = await Promise.all([
    listFromRss().catch(() => [] as PublicSubstackPost[]),
    listFromArchive().catch(() => [] as PublicSubstackPost[]),
  ]);
  if (rss.length === 0 && archive.length === 0) return [];
  return mergePosts(rss, archive);
}

export async function getPublicSubstackPostBySlug(slug: string): Promise<PublicSubstackPost | null> {
  const clean = slug.trim();
  if (!isUsableSlug(clean)) return null;

  try {
    const listed = await listPublicSubstackPosts();
    const fromList = listed.find((p) => p.slug === clean);
    if (fromList?.htmlBody) return fromList;
    if (fromList && fromList.isLikelyPaywalled) return fromList;
  } catch {
    // Fall through to the per-post public API.
  }

  const api = await fetchSubstackJson<PostApiResponse>(
    `${getCampaignBlogUrl()}/api/v1/posts/${encodeURIComponent(clean)}`,
  );
  if (!api) return null;
  return fromApiPost(api);
}
