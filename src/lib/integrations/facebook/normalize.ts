import type { NormalizedPagePost } from "./types";

function httpsUrl(value: unknown): string | null {
  return typeof value === "string" && value.startsWith("https://") ? value : null;
}

function pictureFromAttachments(attachments: unknown): string | null {
  if (!attachments || typeof attachments !== "object") return null;
  const data = (attachments as { data?: unknown }).data;
  if (!Array.isArray(data)) return null;
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const media = (item as { media?: { image?: { src?: unknown } } }).media;
    const fromMedia = httpsUrl(media?.image?.src);
    if (fromMedia) return fromMedia;
    const nested = pictureFromAttachments((item as { subattachments?: unknown }).subattachments);
    if (nested) return nested;
  }
  return null;
}

export function normalizePageFeedEdge(edge: unknown): NormalizedPagePost | null {
  if (!edge || typeof edge !== "object") return null;
  const e = edge as Record<string, unknown>;
  const id = typeof e.id === "string" ? e.id : null;
  if (!id) return null;
  const message = typeof e.message === "string" ? e.message : null;
  const permalinkUrl = typeof e.permalink_url === "string" ? e.permalink_url : null;
  let createdTime: Date | null = null;
  if (typeof e.created_time === "string") {
    const d = new Date(e.created_time);
    createdTime = Number.isNaN(d.getTime()) ? null : d;
  }
  return {
    externalId: `facebook:post:${id}`,
    sourceType: "POST",
    message,
    permalinkUrl,
    pictureUrl: httpsUrl(e.full_picture) ?? pictureFromAttachments(e.attachments),
    createdTime,
    raw: e as Record<string, unknown>,
  };
}
