import type { NormalizedSubstackPost, SubstackFeedItemRaw } from "./types";

function slugFromLink(link: string): string | null {
  try {
    const u = new URL(link);
    const parts = u.pathname.split("/").filter(Boolean);
    const pIdx = parts.indexOf("p");
    if (pIdx >= 0 && parts[pIdx + 1]) return decodeURIComponent(parts[pIdx + 1]);
    const last = parts[parts.length - 1];
    if (last) return decodeURIComponent(last.replace(/\.html?$/i, ""));
    return null;
  } catch {
    return null;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImgSrc(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] ?? null;
}

function parseDate(item: SubstackFeedItemRaw): Date | null {
  const raw = item.isoDate ?? item.pubDate;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizeRssItem(item: SubstackFeedItemRaw): NormalizedSubstackPost | null {
  const link = item.link?.trim();
  if (!link) return null;

  const slug = slugFromLink(link);
  if (!slug) return null;

  const title = (item.title ?? "Untitled").trim();
  const html = item.content ?? "";
  const snippet = (item.contentSnippet ?? "").trim();
  const summary =
    snippet ||
    (html ? stripHtml(html).slice(0, 1200) : "") ||
    title;

  const enclosureUrl = item.enclosure?.url?.trim() || null;
  const imageFromContent = html ? firstImgSrc(html) : null;
  const itunesImage = typeof item.itunes?.image === "string" ? item.itunes.image.trim() : null;
  const featuredImageUrl = enclosureUrl || imageFromContent || itunesImage;

  let guid: string | null = null;
  if (typeof item.guid === "string" && item.guid.trim()) guid = item.guid.trim();
  else if (item.guid && typeof item.guid === "object" && typeof item.guid._ === "string" && item.guid._.trim()) {
    guid = item.guid._.trim();
  } else if (typeof (item as { id?: string }).id === "string" && (item as { id: string }).id.trim()) {
    guid = (item as { id: string }).id.trim();
  }

  const authorRaw = item.creator ?? item.author;
  const author =
    typeof authorRaw === "string" && authorRaw.trim() ? authorRaw.trim() : null;

  const tagsFromFeed = (item.categories ?? []).map((c) => c.trim()).filter(Boolean);

  return {
    feedGuid: guid,
    slug,
    canonicalUrl: link,
    title,
    summary,
    author,
    publishedAt: parseDate(item),
    featuredImageUrl,
    tagsFromFeed,
    rawItem: item,
  };
}
