/**
 * Substack RSS integration — types for fetch → normalize → persist.
 */

export type SubstackFeedItemRaw = {
  guid?: string | { _: string; isPermaLink?: string };
  link?: string;
  title?: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  categories?: string[];
  contentSnippet?: string;
  content?: string;
  enclosure?: { url?: string; type?: string };
  /** rss-parser may expose itunes:image or media:content depending on feed */
  itunes?: { image?: string };
};

export type NormalizedSubstackPost = {
  feedGuid: string | null;
  slug: string;
  canonicalUrl: string;
  title: string;
  summary: string;
  author: string | null;
  publishedAt: Date | null;
  featuredImageUrl: string | null;
  tagsFromFeed: string[];
  rawItem: SubstackFeedItemRaw;
};
