export type MediaSourceType =
  | "NEWSPAPER"
  | "NEWS_MAGAZINE"
  | "DIGITAL_LOCAL"
  | "TV"
  | "RADIO"
  | "BLOG"
  | "OTHER";

export type DiscoveryMethod =
  | "RSS_IF_AVAILABLE"
  | "SITEMAP_IF_AVAILABLE"
  | "SEARCH_PAGE"
  | "TAG_PAGE"
  | "CATEGORY_PAGE"
  | "SECTION_PAGE"
  | "HOMEPAGE_RECRAWL"
  | "VIDEO_PAGE"
  | "MANUAL_SEED";

export interface ArkansasMediaSourceSeed {
  slug: string;
  name: string;
  sourceType: MediaSourceType;
  region: string;
  coveredCities: string[];
  homepage: string;
  priority: number;
  discoveryMethods: DiscoveryMethod[];
  rssUrl?: string | null;
  sitemapUrl?: string | null;
  searchUrlTemplate?: string | null;
  notes?: string | null;
  isActive: boolean;
}
