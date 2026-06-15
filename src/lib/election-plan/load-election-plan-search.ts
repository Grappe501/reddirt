import indexSource from "../../../data/election-plan/election-plan-search-index.json";
import type { PageBriefLink } from "./load-page-briefs";

export type ElectionPlanSearchResultType =
  | "Executive Book"
  | "County"
  | "City"
  | "Campus"
  | "Calendar"
  | "Budget"
  | "Message"
  | "Leadership"
  | "Doctrine"
  | "Academy"
  | "Public Website"
  | "Strategic Plan"
  | "Campaign Brain"
  | "Election Plan";

export type ElectionPlanSearchEntry = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  type: ElectionPlanSearchResultType;
  sourcePath: string;
  keywords: string[];
};

export type ElectionPlanSearchHit = ElectionPlanSearchEntry & {
  score: number;
  confidence: "high" | "medium" | "low";
};

type SearchIndexFile = {
  version: number;
  generatedAt: string;
  entryCount: number;
  entries: ElectionPlanSearchEntry[];
};

function tokenize(q: string): string[] {
  return [
    ...new Set(
      q
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 1),
    ),
  ].slice(0, 16);
}

function confidenceFromScore(score: number): ElectionPlanSearchHit["confidence"] {
  if (score >= 0.75) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

function loadIndex(): SearchIndexFile {
  return indexSource as SearchIndexFile;
}

export function getElectionPlanSearchIndex(): ElectionPlanSearchEntry[] {
  return loadIndex().entries;
}

export function searchElectionPlanLocal(query: string, limit = 12): ElectionPlanSearchHit[] {
  const q = query.trim();
  if (!q) return [];

  const entries = getElectionPlanSearchIndex();
  const terms = tokenize(q);
  const qLower = q.toLowerCase();

  const scored = entries.map((entry) => {
    const titleLower = entry.title.toLowerCase();
    const blob = [entry.title, entry.excerpt, entry.keywords.join(" "), entry.type, entry.sourcePath]
      .join("\n")
      .toLowerCase();

    let score = 0;

    if (titleLower.includes(qLower)) score += 0.5;
    if (entry.href.toLowerCase().includes(qLower.replace(/\s+/g, "-"))) score += 0.3;

    for (const term of terms) {
      if (titleLower.includes(term)) score += 0.25;
      if (entry.keywords.some((k) => k.toLowerCase().includes(term))) score += 0.2;
      if (blob.includes(term)) score += 0.1;
    }

    const matchedTerms = terms.filter((t) => blob.includes(t)).length;
    if (terms.length > 0) score += (matchedTerms / terms.length) * 0.3;

    return { ...entry, score: Math.min(1, score) };
  });

  return scored
    .filter((s) => s.score > 0.08)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
    .map((hit) => ({
      ...hit,
      confidence: confidenceFromScore(hit.score),
    }));
}

export function electionPlanSearchHref(query?: string): string {
  if (!query?.trim()) return "/election-plan/search";
  return `/election-plan/search?q=${encodeURIComponent(query.trim())}`;
}

export function getSearchIndexMeta() {
  const idx = loadIndex();
  return { version: idx.version, generatedAt: idx.generatedAt, entryCount: idx.entryCount };
}

/** Suggested queries for empty search state */
export const ELECTION_PLAN_SEARCH_SUGGESTIONS: Array<{ label: string; query: string }> = [
  { label: "Searcy County plan", query: "Searcy County" },
  { label: "Power of 5", query: "Power of 5" },
  { label: "Campaign budget", query: "budget" },
  { label: "Direct democracy", query: "direct democracy" },
  { label: "Counties 20% increase", query: "20% increase county" },
  { label: "Freshman week", query: "freshman week" },
];
