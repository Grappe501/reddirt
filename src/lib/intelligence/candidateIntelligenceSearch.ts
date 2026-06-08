/**
 * Admin intelligence search — keyword + semantic over the full prep corpus.
 */
import { embedQuery, embedTexts, cosineSimilarity } from "@/lib/openai/embeddings";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { searchChunks, type SearchHit } from "@/lib/openai/search";
import { pathToHref } from "@/lib/search/paths";
import { buildIntelSearchCorpus, countIntelSearchCorpus } from "@/lib/intelligence/intelligenceSearchCorpus";
import {
  detectIntelSearchIntent,
  expandIntelQueryTerms,
  extractIntelSnippet,
  intentBoostForKind,
  scoreIntelDocument,
  tokenizeIntelQuery,
} from "@/lib/intelligence/intelligenceSearchCore";

export type CandidateIntelSearchKind =
  | "nav"
  | "field_book"
  | "claim"
  | "chunk"
  | "trap_lane"
  | "sos_question"
  | "glossary"
  | "hammer_module"
  | "diligence"
  | "citation"
  | "debate_depth"
  | "offensive_move";

export type IntelStageSafe = "clear" | "verify" | "blocked" | "research";

export type CandidateIntelSearchResult = {
  kind: CandidateIntelSearchKind;
  href: string;
  title: string;
  snippet: string;
  score: number;
  section?: string;
  badge?: string;
  /** 0–1 when semantic rerank ran */
  semanticScore?: number;
  stageSafe?: IntelStageSafe;
  matchReason?: string;
};

export function inferStageSafeFromResult(r: CandidateIntelSearchResult): IntelStageSafe {
  const text = `${r.badge ?? ""} ${r.snippet} ${r.title}`.toLowerCase();
  if (/rejected|do.?not.?use|blocked|not.?publishable/.test(text)) return "blocked";
  if (/verified|human_verified|human_approved|clear/.test(text)) return "clear";
  if (/needs.?review|research.?question|staff.?verify|claims.?gate|gate/.test(text)) return "verify";
  if (r.kind === "claim" || r.kind === "trap_lane" || r.kind === "sos_question") return "verify";
  if (r.kind === "citation") return "research";
  return "research";
}

export type CandidateIntelCorpusCounts = {
  navLinks: number;
  fieldBookArticles: number;
  claims: number;
  searchChunks: number;
  corpusTotal: number;
  byKind: Record<string, number>;
};

const SEMANTIC_RERANK_POOL = 28;
const SEMANTIC_WEAK_THRESHOLD = 0.2;

export function intelligenceChunkPathToHref(path: string): string {
  if (path.startsWith("route:")) {
    const rest = path.slice("route:".length);
    return rest.length ? rest : "/";
  }
  if (path.startsWith("intel:opposition")) return "/admin/intelligence/opponents";
  if (path.startsWith("intel:")) return "/admin/intelligence/field-book";
  if (path.startsWith("brief:")) return "/admin/intelligence/top-tier-prep";
  if (path.replace(/\\/g, "/").toLowerCase().startsWith("docs/")) {
    return "/admin/intelligence/field-book";
  }
  return pathToHref(path);
}

function searchCorpusDocuments(
  query: string,
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK",
): CandidateIntelSearchResult[] {
  const phrase = query.trim();
  const terms = tokenizeIntelQuery(phrase);
  const expanded = expandIntelQueryTerms(terms);
  const intent = detectIntelSearchIntent(phrase, terms);
  const corpus = buildIntelSearchCorpus(profile);

  const scored = corpus
    .map((doc) => {
      const base = scoreIntelDocument(doc.title, doc.body, terms, expanded, phrase);
      const boost = doc.priority + intentBoostForKind(intent, doc.kind);
      const score = base + boost;
      if (score <= 0.08) return null;
      return {
        kind: doc.kind,
        href: doc.href,
        title: doc.title,
        snippet: extractIntelSnippet(doc.body, terms, phrase),
        score,
        section: doc.section,
        badge: doc.badge,
      } satisfies CandidateIntelSearchResult;
    })
    .filter((r): r is CandidateIntelSearchResult => r !== null)
    .sort((a, b) => b.score - a.score);

  return scored;
}

async function semanticRerankCorpusHits(
  query: string,
  hits: CandidateIntelSearchResult[],
): Promise<CandidateIntelSearchResult[]> {
  if (!isOpenAIConfigured() || hits.length < 2) return hits;
  const pool = hits.slice(0, SEMANTIC_RERANK_POOL);
  try {
    const qVec = await embedQuery(query);
    const texts = pool.map((h) => `${h.title}\n${h.snippet}`);
    const docVecs = await embedTexts(texts);
    const reranked = pool.map((h, i) => {
      const sem = cosineSimilarity(qVec, docVecs[i] ?? []);
      const blended = h.score * 0.55 + sem * 0.45;
      return { ...h, score: blended, semanticScore: sem };
    });
    reranked.sort((a, b) => b.score - a.score);
    const tail = hits.slice(SEMANTIC_RERANK_POOL);
    return [...reranked, ...tail];
  } catch (err) {
    console.warn("[intel-search] semantic rerank failed:", err);
    return hits;
  }
}

function hitsToChunkResults(hits: SearchHit[]): CandidateIntelSearchResult[] {
  return hits.map((h) => ({
    kind: "chunk" as const,
    href: intelligenceChunkPathToHref(h.path),
    title: h.title ?? h.path,
    snippet: h.content.slice(0, 280) + (h.content.length > 280 ? "…" : ""),
    score: h.score,
    badge: h.path.startsWith("intel:") ? "Opposition intel" : "Indexed",
    semanticScore: h.score,
  }));
}

function mergeResults(groups: CandidateIntelSearchResult[][], limit: number): CandidateIntelSearchResult[] {
  const key = (r: CandidateIntelSearchResult) => `${r.kind}::${r.href}::${r.title.slice(0, 40)}`;
  const seen = new Set<string>();
  const flat = groups.flat().sort((a, b) => b.score - a.score);
  const out: CandidateIntelSearchResult[] = [];
  const kindCounts: Record<string, number> = {};
  const kindCaps: Record<string, number> = {
    nav: 5,
    field_book: 4,
    claim: 4,
    trap_lane: 5,
    sos_question: 5,
    hammer_module: 4,
    glossary: 3,
    diligence: 3,
    citation: 3,
    debate_depth: 4,
    offensive_move: 3,
    chunk: 5,
  };

  for (const r of flat) {
    const k = key(r);
    if (seen.has(k)) continue;
    const cap = kindCaps[r.kind] ?? 4;
    if ((kindCounts[r.kind] ?? 0) >= cap) continue;
    seen.add(k);
    kindCounts[r.kind] = (kindCounts[r.kind] ?? 0) + 1;
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}

export type SearchCandidateIntelligenceOptions = {
  query: string;
  profile?: "CANDIDATE" | "STAFF" | "CLERK_WEEK";
  limit?: number;
  searchChunkCount?: number;
  semanticRerank?: boolean;
};

export async function searchCandidateIntelligence(
  options: SearchCandidateIntelligenceOptions,
): Promise<{ results: CandidateIntelSearchResult[]; corpusCounts: CandidateIntelCorpusCounts }> {
  const q = options.query.trim();
  const profile = options.profile ?? "CANDIDATE";
  const limit = options.limit ?? 20;
  const chunkPool = options.searchChunkCount ?? 20;
  const doSemantic = options.semanticRerank !== false;

  const corpusMeta = countIntelSearchCorpus(profile);
  const corpusCounts: CandidateIntelCorpusCounts = {
    navLinks: corpusMeta.byKind.nav ?? 0,
    fieldBookArticles: corpusMeta.byKind.field_book ?? 0,
    claims: corpusMeta.byKind.claim ?? 0,
    searchChunks: 0,
    corpusTotal: corpusMeta.total,
    byKind: corpusMeta.byKind,
  };

  if (!q) {
    return { results: [], corpusCounts };
  }

  let corpusHits = searchCorpusDocuments(q, profile);
  const bestKeyword = corpusHits[0]?.score ?? 0;
  const needsSemantic = doSemantic && (bestKeyword < 0.45 || q.split(/\s+/).length >= 4);

  if (needsSemantic && corpusHits.length) {
    corpusHits = await semanticRerankCorpusHits(q, corpusHits);
  }

  const [chunkHits] = await Promise.all([
    searchChunks(q, chunkPool).catch(() => [] as SearchHit[]),
  ]);

  corpusCounts.searchChunks = chunkHits.length;

  const chunkResults = hitsToChunkResults(chunkHits);
  const bestChunk = chunkResults[0]?.semanticScore ?? chunkResults[0]?.score ?? 0;
  const chunkStrong = bestChunk >= SEMANTIC_WEAK_THRESHOLD;

  const results = mergeResults(
    [corpusHits, chunkStrong ? chunkResults : []],
    limit,
  );

  if (results.length < limit && !chunkStrong && chunkResults.length) {
    const merged = mergeResults([results, chunkResults], limit);
    return { results: merged, corpusCounts };
  }

  return { results, corpusCounts };
}

/** Reciprocal rank fusion across multiple query result lists. */
export function fuseSearchResults(
  lists: CandidateIntelSearchResult[][],
  limit: number,
  k = 60,
): CandidateIntelSearchResult[] {
  const scores = new Map<string, { result: CandidateIntelSearchResult; score: number }>();
  for (const list of lists) {
    list.forEach((r, rank) => {
      const key = `${r.kind}::${r.href}`;
      const rrf = 1 / (k + rank + 1);
      const prev = scores.get(key);
      if (prev) {
        prev.score += rrf;
        prev.result.score = Math.max(prev.result.score, r.score);
        if (r.semanticScore && (!prev.result.semanticScore || r.semanticScore > prev.result.semanticScore)) {
          prev.result.semanticScore = r.semanticScore;
        }
      } else {
        scores.set(key, { result: { ...r }, score: rrf });
      }
    });
  }
  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map((x) => ({ ...x.result, score: x.score + x.result.score * 0.15 }))
    .slice(0, limit);
}

export async function searchCandidateIntelligenceMulti(
  queries: string[],
  options: Omit<SearchCandidateIntelligenceOptions, "query"> & { query?: never },
): Promise<{ results: CandidateIntelSearchResult[]; corpusCounts: CandidateIntelCorpusCounts }> {
  const active = queries.map((q) => q.trim()).filter(Boolean);
  if (!active.length) {
    const empty = await searchCandidateIntelligence({ query: " ", ...options, limit: 0 });
    return { results: [], corpusCounts: empty.corpusCounts };
  }
  const lists = await Promise.all(
    active.map((q) => searchCandidateIntelligence({ ...options, query: q })),
  );
  const limit = options.limit ?? 24;
  const fused = fuseSearchResults(
    lists.map((l) => l.results),
    limit,
  );
  return {
    results: fused.map((r) => ({
      ...r,
      stageSafe: r.stageSafe ?? inferStageSafeFromResult(r),
      matchReason: r.matchReason ?? r.section ?? KIND_LABEL[r.kind],
    })),
    corpusCounts: lists[0]!.corpusCounts,
  };
}

const KIND_LABEL: Record<CandidateIntelSearchKind, string> = {
  nav: "Prep page",
  field_book: "Field Book",
  claim: "Claim",
  chunk: "Indexed intel",
  trap_lane: "Trap lane script",
  sos_question: "SOS question",
  glossary: "Glossary",
  hammer_module: "Hammer research",
  diligence: "Diligence",
  citation: "Citation",
  debate_depth: "Debate depth guide",
  offensive_move: "Offensive move",
};

export function buildCandidateIntelContextBlock(
  results: CandidateIntelSearchResult[],
  maxChars = 14000,
): string {
  let out = "";
  for (const r of results) {
    const piece = `\n---\nKIND: ${r.kind}\nHREF: ${r.href}\nTITLE: ${r.title}\nSECTION: ${r.section ?? ""}\nBADGE: ${r.badge ?? ""}\nCONTENT:\n${r.snippet}\n`;
    if (out.length + piece.length > maxChars) break;
    out += piece;
  }
  return out.trim();
}
