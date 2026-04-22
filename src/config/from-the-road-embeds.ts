import { DEFAULT_SOCIAL_FACEBOOK_URL } from "@/config/social";

/**
 * Public embed configuration for /from-the-road (NEXT_PUBLIC_* only — safe in client).
 *
 * - Facebook: Page plugin iframe (timeline scrolls inside the widget).
 * - TikTok: no official “full profile in iframe” — pass numeric video ids for `/embed/v2/{id}` iframes.
 */
export type FromTheRoadEmbedsConfig = {
  facebookPageUrl: string | null;
  /** TikTok video ids (numbers only) for embed iframes; order preserved. */
  tiktokVideoIds: string[];
  /**
   * YouTube playlist id for `videoseries` embed (often the channel “Uploads” list — starts with `UU…`).
   * Set `NEXT_PUBLIC_FTR_YOUTUBE_UPLOADS_PLAYLIST_ID` in env.
   */
  youtubePlaylistId: string | null;
  /** Instagram post shortcodes for official `/p/{code}/embed` iframes (no full profile feed API). */
  instagramEmbedShortcodes: string[];
};

export function getFromTheRoadEmbedsConfig(): FromTheRoadEmbedsConfig {
  const fb =
    process.env.NEXT_PUBLIC_FTR_FACEBOOK_PAGE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL?.trim() ||
    DEFAULT_SOCIAL_FACEBOOK_URL;
  const raw = process.env.NEXT_PUBLIC_FTR_TIKTOK_VIDEO_IDS?.trim() ?? "";
  const tiktokVideoIds = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^\d{8,20}$/.test(s));

  const ytPl = process.env.NEXT_PUBLIC_FTR_YOUTUBE_UPLOADS_PLAYLIST_ID?.trim() ?? "";
  const youtubePlaylistId = /^[a-zA-Z0-9_-]{10,}$/.test(ytPl) ? ytPl : null;

  const igRaw = process.env.NEXT_PUBLIC_FTR_INSTAGRAM_EMBED_SHORTCODES?.trim() ?? "";
  const instagramEmbedShortcodes = igRaw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter((s) => /^[A-Za-z0-9_-]{3,}$/.test(s));

  return { facebookPageUrl: fb, tiktokVideoIds, youtubePlaylistId, instagramEmbedShortcodes };
}

export function fromTheRoadHasLiveEmbeds(c: FromTheRoadEmbedsConfig): boolean {
  return (
    Boolean(c.facebookPageUrl) ||
    c.tiktokVideoIds.length > 0 ||
    Boolean(c.youtubePlaylistId) ||
    c.instagramEmbedShortcodes.length > 0
  );
}
