import { communityWorkbenchHref } from "./links";
import { listCommunityWorkbenches } from "./load-workbench";
import type { CommunityWorkbenchSearchHit } from "./types";

function tokenize(q: string): string[] {
  return [
    ...new Set(
      q
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 1),
    ),
  ].slice(0, 12);
}

export async function searchCommunityWorkbenches(query: string, limit = 12): Promise<CommunityWorkbenchSearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  const workbenches = await listCommunityWorkbenches();
  const terms = tokenize(q);
  const qLower = q.toLowerCase();

  const scored = workbenches.map((wb) => {
    const blob = [wb.name, wb.tagline ?? "", wb.kind, wb.countySlug ?? ""].join(" ").toLowerCase();
    let score = 0;
    if (wb.name.toLowerCase() === qLower) score += 1;
    if (wb.name.toLowerCase().includes(qLower)) score += 0.6;
    if (wb.slug.includes(qLower.replace(/\s+/g, "-"))) score += 0.4;
    for (const term of terms) {
      if (wb.name.toLowerCase().includes(term)) score += 0.25;
      if (blob.includes(term)) score += 0.1;
    }
    return {
      slug: wb.slug,
      name: wb.name,
      kind: wb.kind,
      countySlug: wb.countySlug,
      tagline: wb.tagline,
      href: communityWorkbenchHref(wb.slug),
      score: Math.min(1, score),
    };
  });

  return scored
    .filter((s) => s.score > 0.08)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function communityWorkbenchSearchAsElectionPlanHits(
  hits: CommunityWorkbenchSearchHit[],
): Array<{
  id: string;
  title: string;
  href: string;
  excerpt: string;
  type: "Community Workbench";
  sourcePath: string;
  keywords: string[];
  score: number;
  confidence: "high" | "medium" | "low";
}> {
  return hits.map((h) => ({
    id: `workbench:${h.slug}`,
    title: `${h.name} · Community Workbench`,
    href: h.href,
    excerpt: h.tagline ?? `${h.kind} workbench · local operating center`,
    type: "Community Workbench" as const,
    sourcePath: "community-workbench-registry",
    keywords: [h.name, h.kind, h.countySlug ?? ""].filter(Boolean),
    score: h.score,
    confidence: h.score >= 0.75 ? "high" : h.score >= 0.4 ? "medium" : "low",
  }));
}
