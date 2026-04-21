import type { NormalizedIgMedia } from "./types";

export function normalizeIgMedia(edge: unknown): NormalizedIgMedia | null {
  if (!edge || typeof edge !== "object") return null;
  const e = edge as Record<string, unknown>;
  const id = typeof e.id === "string" ? e.id : null;
  if (!id) return null;
  const caption = typeof e.caption === "string" ? e.caption : null;
  const permalink = typeof e.permalink === "string" ? e.permalink : null;
  const mediaType = typeof e.media_type === "string" ? e.media_type : null;
  let timestamp: Date | null = null;
  if (typeof e.timestamp === "string") {
    const d = new Date(e.timestamp);
    timestamp = Number.isNaN(d.getTime()) ? null : d;
  }
  return {
    externalId: `instagram:media:${id}`,
    caption,
    permalink,
    mediaType,
    timestamp,
    raw: e as Record<string, unknown>,
  };
}
