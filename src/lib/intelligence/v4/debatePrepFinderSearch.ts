import type { DebatePrepFinderEntry } from "@/lib/intelligence/v4/debateBriefingDepthTypes";

/** Client-safe search — operates on a pre-built index from the server. */
export function searchDebatePrepFinderEntries(
  index: DebatePrepFinderEntry[],
  query: string,
  limit = 24,
): DebatePrepFinderEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return index
    .filter((e) => {
      const hay = `${e.title} ${e.summary} ${e.tags.join(" ")}`.toLowerCase();
      return hay.includes(q) || q.split(/\s+/).every((word) => hay.includes(word));
    })
    .slice(0, limit);
}
