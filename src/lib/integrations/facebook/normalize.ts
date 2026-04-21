import type { NormalizedPagePost } from "./types";

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
    createdTime,
    raw: e as Record<string, unknown>,
  };
}
