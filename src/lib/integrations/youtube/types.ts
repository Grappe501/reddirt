export type YouTubeChannelConfig = {
  channelId: string;
  /** API key for read-only search/list (quota applies). OAuth for private metrics later. */
  apiKeyEnvKey?: string;
};

export type NormalizedYouTubeVideo = {
  /** Bare 11-char id for embeds */
  videoId: string;
  externalId: string;
  title: string | null;
  description: string | null;
  publishedAt: Date | null;
  canonicalUrl: string | null;
  thumbnailUrl: string | null;
  thumbnailWidth: number | null;
  thumbnailHeight: number | null;
  /** Rarely present on search:list; often null until playlistItems sync (Phase 2). */
  playlistId: string | null;
  raw: Record<string, unknown>;
};
