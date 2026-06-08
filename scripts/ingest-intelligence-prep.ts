/**
 * Upsert admin intelligence prep chunks into SearchChunk (intel:prep:* paths).
 * Does NOT delete existing chunks — safe to run after npm run ingest.
 *
 * Usage: npm run ingest:intelligence-prep
 * Requires: DATABASE_URL, OPENAI_API_KEY (optional — keyword-only if missing)
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/db";
import { loadIntelligencePrepSearchChunks } from "../src/lib/intelligence/intelligenceSearchIngestChunks";
import { embedTexts } from "../src/lib/openai/embeddings";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const shellOpenAiKey = process.env.OPENAI_API_KEY?.trim();
delete process.env.OPENAI_API_KEY;
loadEnvConfig(repoRoot);

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");

  const openaiKey = process.env.OPENAI_API_KEY?.trim() || shellOpenAiKey;
  if (openaiKey) process.env.OPENAI_API_KEY = openaiKey;

  const skipEmbeddings =
    process.env.INGEST_SKIP_EMBEDDINGS === "1" || process.env.INGEST_KEYWORD_ONLY === "1" || !openaiKey;

  const chunks = loadIntelligencePrepSearchChunks("CANDIDATE");
  console.log(`[ingest-intelligence-prep] Upserting ${chunks.length} intel:prep chunks…`);

  const batchSize = 12;
  let embeddingUnavailable = skipEmbeddings;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    let embeddings: number[][];
    if (embeddingUnavailable) {
      embeddings = batch.map(() => []);
    } else {
      try {
        embeddings = await embedTexts(batch.map((b) => b.content.slice(0, 8000)));
      } catch (err) {
        console.warn("[ingest-intelligence-prep] embeddings failed — keyword only:", err);
        embeddingUnavailable = true;
        embeddings = batch.map(() => []);
      }
    }
    for (let j = 0; j < batch.length; j++) {
      const b = batch[j]!;
      await prisma.searchChunk.upsert({
        where: { path_chunkIndex: { path: b.path, chunkIndex: b.chunkIndex } },
        create: {
          path: b.path,
          title: b.title,
          chunkIndex: b.chunkIndex,
          content: b.content,
          embedding: JSON.stringify(embeddings[j]),
        },
        update: {
          title: b.title,
          content: b.content,
          embedding: JSON.stringify(embeddings[j]),
        },
      });
    }
  }

  console.log("[ingest-intelligence-prep] Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
