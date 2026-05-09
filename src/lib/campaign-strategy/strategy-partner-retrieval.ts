import type { StrategyManualChunk } from "./strategy-chunking";
import { toIndexRow } from "./strategy-chunking";

const tokenize = (q: string) =>
  [
    ...new Set(
      q
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((t) => t.length > 2),
    ),
  ].slice(0, 20);

export function scoreStrategyChunkForTerms(
  chunk: StrategyManualChunk,
  terms: string[],
  pathBoostKey?: string,
): number {
  if (!terms.length) return 0;
  const blob = `${chunk.navLabel}\n${chunk.sourceFile}\n${chunk.manualDomain}\n${chunk.heading ?? ""}\n${chunk.parentHeadings.join(" ")}\n${chunk.plainText}`.toLowerCase().replace(/\\/g, "/");
  let hits = 0;
  for (const t of terms) {
    if (blob.includes(t)) hits += 1;
  }
  let score = hits / terms.length;
  if (pathBoostKey !== undefined && chunk.pathKey === pathBoostKey) {
    score += 0.4;
  }
  return score;
}

export type StrategyPartnerRetrievalOpts = {
  /** Manual chapter key (same as chunk `pathKey`; `""` is overview). Biases ranking toward this chapter. */
  pathKey?: string;
  topK?: number;
};

/**
 * Lexical retrieval over in-memory manual chunks (no embeddings). Falls back to the
 * current chapter’s largest sections when the query matches nothing.
 */
export function selectStrategyManualChunksForQuery(
  chunks: StrategyManualChunk[],
  retrievalQuery: string,
  opts: StrategyPartnerRetrievalOpts = {},
): StrategyManualChunk[] {
  const q = retrievalQuery.trim().toLowerCase();
  const terms = tokenize(retrievalQuery);
  const pathBoost = opts.pathKey;
  const topK = opts.topK ?? 10;

  const scored = chunks
    .map((c) => ({
      c,
      s: scoreStrategyChunkForTerms(c, terms, pathBoost),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.c.characterCount - a.c.characterCount);

  let picked = scored.slice(0, topK).map((x) => x.c);

  if (picked.length < 4 && q.length > 0) {
    const substrHits = chunks
      .map((c) => ({
        c,
        s:
          (c.plainText.toLowerCase().includes(q) ? 0.5 : 0) +
          (pathBoost !== undefined && c.pathKey === pathBoost ? 0.35 : 0),
      }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || b.c.characterCount - a.c.characterCount)
      .slice(0, topK)
      .map((x) => x.c);
    const seen = new Set(picked.map((c) => c.id));
    for (const c of substrHits) {
      if (picked.length >= topK) break;
      if (!seen.has(c.id)) {
        seen.add(c.id);
        picked.push(c);
      }
    }
  }

  if (!picked.length && pathBoost !== undefined) {
    const inChapter = chunks
      .filter((c) => c.pathKey === pathBoost)
      .sort((a, b) => b.characterCount - a.characterCount);
    picked = inChapter.slice(0, Math.min(topK, 6));
  }

  if (!picked.length) {
    picked = [...chunks].sort((a, b) => b.characterCount - a.characterCount).slice(0, Math.min(topK, 6));
  }

  return picked;
}

export function buildStrategyPartnerContextBlock(chunks: StrategyManualChunk[], maxChars: number): string {
  const maxBody = Math.max(1200, maxChars - 400 * chunks.length);
  const per = Math.floor(maxBody / Math.max(1, chunks.length));
  const parts: string[] = [];

  for (const c of chunks) {
    const row = toIndexRow(c);
    const locator =
      row.adminReaderUrl.trim().length > 0
        ? `Reader: ${row.adminReaderUrl}`
        : `Doc: ${row.repoRelativePath}`;
    const head = [`[chunk ${c.id}]`, locator, `Chapter: ${c.navLabel}${c.heading ? ` · ${c.heading}` : ""}`, "---"].join("\n");
    const body = c.plainText.length <= per ? c.plainText : `${c.plainText.slice(0, per)}…`;
    parts.push(`${head}\n${body}`);
  }

  let text = parts.join("\n\n");
  if (text.length > maxChars) {
    text = text.slice(0, maxChars) + "…";
  }
  return text;
}
