import { prisma } from "@/lib/db";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { embedQuery, cosineSimilarity, parseStoredEmbedding } from "./embeddings";

export type SearchHit = {
  path: string;
  title: string | null;
  content: string;
  score: number;
};

/**
 * Retrieval tier for the campaign assistant: prefer on-site and internal briefs over external
 * background domains so answers anchor to the campaign site when both match.
 */
export function assistantPathTier(path: string): number {
  if (path.startsWith("route:")) return 0;
  if (path.startsWith("brief:")) return 1;
  const n = path.replace(/\\/g, "/").toLowerCase();
  if (n.startsWith("docs/")) return 2;
  if (path.startsWith("external:")) return 4;
  return 3;
}

/** Re-rank merged hits for /api/assistant: tier ascending, then similarity score descending. */
export function prioritizeHitsForAssistant(hits: SearchHit[], limit: number): SearchHit[] {
  if (hits.length === 0) return [];
  const enriched = hits.map((h, i) => ({ h, i, tier: assistantPathTier(h.path) }));
  enriched.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (b.h.score !== a.h.score) return b.h.score - a.h.score;
    return a.i - b.i;
  });
  return enriched.slice(0, limit).map((x) => x.h);
}

const SEMANTIC_WEAK_THRESHOLD = 0.18;

type ChunkRow = { path: string; title: string | null; content: string; embedding: string };

/** Load all chunks with fields needed for ranking (consider pgvector when this grows). */
async function loadSearchChunkRows(): Promise<ChunkRow[]> {
  return prisma.searchChunk.findMany({
    select: { path: true, title: true, content: true, embedding: true },
  });
}

/**
 * Vector similarity over the full index. Requires OpenAI for the query embedding.
 * Returns top-K by cosine similarity; skips rows with missing/invalid embeddings.
 */
export async function semanticSearch(query: string, topK = 8): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  const qVec = await embedQuery(q);
  const chunks = await loadSearchChunkRows();

  const scored = chunks
    .map((c) => {
      const vec = parseStoredEmbedding(c.embedding);
      if (!vec.length) return null;
      const score = cosineSimilarity(qVec, vec);
      if (!Number.isFinite(score)) return null;
      return { path: c.path, title: c.title, content: c.content, score };
    })
    .filter((s): s is SearchHit => s !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

const tokenize = (q: string) =>
  [
    ...new Set(
      q
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 2),
    ),
  ].slice(0, 12);

/**
 * Keyword / lexical fallback using Postgres case-insensitive substring match.
 * Works without OpenAI so search stays useful in dev and when embeddings are stale.
 */
export async function keywordSearchChunks(query: string, topK = 10): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  const terms = tokenize(q);
  const where =
    terms.length > 0
      ? { OR: terms.map((t) => ({ content: { contains: t, mode: "insensitive" as const } })) }
      : { content: { contains: q, mode: "insensitive" as const } };

  const rows = await prisma.searchChunk.findMany({
    where,
    take: Math.min(250, topK * 25),
    select: { path: true, title: true, content: true },
  });

  const rankTerms = terms.length > 0 ? terms : [q.toLowerCase()];
  const blob = (r: { title: string | null; content: string }) =>
    `${r.title ?? ""}\n${r.content}`.toLowerCase();

  const scored = rows.map((r) => {
    const b = blob(r);
    const hits = rankTerms.filter((t) => b.includes(t)).length;
    const score = rankTerms.length ? hits / rankTerms.length : b.includes(q.toLowerCase()) ? 1 : 0;
    return { path: r.path, title: r.title, content: r.content, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.content.length - a.content.length)
    .slice(0, topK);
}

function mergeHits(semantic: SearchHit[], keyword: SearchHit[], topK: number): SearchHit[] {
  const key = (h: SearchHit) => `${h.path}::${h.content.slice(0, 120)}`;
  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const h of semantic) {
    const k = key(h);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(h);
    if (out.length >= topK) return out;
  }
  for (const h of keyword) {
    const k = key(h);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(h);
    if (out.length >= topK) return out;
  }
  return out;
}

/**
 * Best-effort search: semantic when OpenAI is configured, always blended with keyword results
 * when semantic is weak or empty so the dialog isn’t a dead end.
 */
export async function searchChunks(query: string, topK = 10): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  const [keywordHits, semanticTry] = await Promise.all([
    keywordSearchChunks(q, topK),
    (async (): Promise<SearchHit[]> => {
      if (!isOpenAIConfigured()) return [];
      try {
        return await semanticSearch(q, topK);
      } catch (err) {
        console.warn("[search] semanticSearch failed:", err);
        return [];
      }
    })(),
  ]);

  const bestSemantic = semanticTry[0]?.score ?? 0;
  const semanticStrong = semanticTry.length > 0 && bestSemantic >= SEMANTIC_WEAK_THRESHOLD;

  if (semanticStrong) {
    return mergeHits(semanticTry, keywordHits, topK);
  }

  if (keywordHits.length) {
    return mergeHits(keywordHits, semanticTry, topK);
  }

  return semanticTry.slice(0, topK);
}

export function buildContextBlock(hits: SearchHit[], maxChars = 12000): string {
  let out = "";
  for (const h of hits) {
    const piece = `\n---\nPATH: ${h.path}\nTITLE: ${h.title ?? ""}\nCONTENT:\n${h.content}\n`;
    if (out.length + piece.length > maxChars) break;
    out += piece;
  }
  return out.trim();
}
