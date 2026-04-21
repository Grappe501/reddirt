import { getOpenAIClient, getOpenAIConfigFromEnv } from "./client";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const client = getOpenAIClient();
  const { embeddingModel } = getOpenAIConfigFromEnv();
  const input = texts.map((t) => t.slice(0, 8000));
  const res = await client.embeddings.create({
    model: embeddingModel,
    input,
  });
  return res.data.sort((a, b) => a.index - b.index).map((d) => d.embedding as number[]);
}

export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await embedTexts([text]);
  return v;
}

export function parseStoredEmbedding(json: string): number[] {
  try {
    const v = JSON.parse(json) as unknown;
    if (!Array.isArray(v)) return [];
    return v.map((n) => Number(n)).filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
