import type { NormalizedYouTubeVideo } from "./types";

function pickThumbnail(sn: Record<string, unknown>): {
  url: string;
  width: number | null;
  height: number | null;
} | null {
  const th = sn.thumbnails as Record<string, { url?: string; width?: number; height?: number }> | undefined;
  if (!th || typeof th !== "object") return null;
  const order = ["maxres", "high", "medium", "standard", "default"] as const;
  for (const k of order) {
    const t = th[k];
    if (t?.url && typeof t.url === "string") {
      return {
        url: t.url,
        width: typeof t.width === "number" ? t.width : null,
        height: typeof t.height === "number" ? t.height : null,
      };
    }
  }
  return null;
}

export function normalizeSearchVideoItem(item: unknown): NormalizedYouTubeVideo | null {
  if (!item || typeof item !== "object") return null;
  const row = item as Record<string, unknown>;
  const idObj = row.id as Record<string, unknown> | undefined;
  const videoId = idObj && typeof idObj.videoId === "string" ? idObj.videoId : null;
  if (!videoId) return null;
  const sn = row.snippet as Record<string, unknown> | undefined;
  const title = sn && typeof sn.title === "string" ? sn.title : null;
  const description = sn && typeof sn.description === "string" ? sn.description : null;
  let publishedAt: Date | null = null;
  if (sn && typeof sn.publishedAt === "string") {
    const d = new Date(sn.publishedAt);
    publishedAt = Number.isNaN(d.getTime()) ? null : d;
  }
  const thumb = sn && typeof sn === "object" ? pickThumbnail(sn as Record<string, unknown>) : null;
  return {
    videoId,
    externalId: `youtube:video:${videoId}`,
    title,
    description,
    publishedAt,
    canonicalUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`,
    thumbnailUrl: thumb?.url ?? null,
    thumbnailWidth: thumb?.width ?? null,
    thumbnailHeight: thumb?.height ?? null,
    playlistId: null,
    raw: row as Record<string, unknown>,
  };
}
