import { prisma } from "@/lib/db";
import { embedQuery, cosineSimilarity, parseStoredEmbedding } from "./embeddings";

export type SearchHit = {
  path: string;
  title: string | null;
  content: string;
  score: number;
};

export async function semanticSearch(query: string, topK = 8): Promise<SearchHit[]> {
  const q = query.trim();
  if (!q) return [];

  const qVec = await embedQuery(q);
  const chunks = await prisma.searchChunk.findMany();

  const scored = chunks
    .map((c) => {
      const vec = parseStoredEmbedding(c.embedding);
      const score = cosineSimilarity(qVec, vec);
      return {
        path: c.path,
        title: c.title,
        content: c.content,
        score,
      };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
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
