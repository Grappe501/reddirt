/** Tag overlap score for related content — deterministic, no DB. */

export function relatedByTags<T extends { slug: string; tags: string[] }>(
  item: T,
  pool: T[],
  opts?: { limit?: number; excludeSlug?: string },
): T[] {
  const limit = opts?.limit ?? 3;
  const exclude = opts?.excludeSlug ?? item.slug;
  const tags = new Set(item.tags.map((t) => t.toLowerCase()));

  const scored = pool
    .filter((p) => p.slug !== exclude)
    .map((p) => {
      let score = 0;
      for (const t of p.tags) {
        if (tags.has(t.toLowerCase())) score += 1;
      }
      return { item: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.item.slug.localeCompare(b.item.slug));

  return scored.slice(0, limit).map((x) => x.item);
}
