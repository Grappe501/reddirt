/**
 * Usage: npm run ingest:compliance-library
 *
 * Upserts only docs/compliance official-source chunks into SearchChunk.
 * This does not wipe the broader site index.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvConfig } from "@next/env";
import { prisma } from "../src/lib/db";
import { chunkMarkdown } from "../src/lib/content/parse";
import { embedTexts } from "../src/lib/openai/embeddings";
import { readFile } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const shellOpenAiKey = process.env.OPENAI_API_KEY?.trim();
delete process.env.OPENAI_API_KEY;
loadEnvConfig(repoRoot);

const sources = [
  {
    path: "docs/compliance/OFFICIAL_ARKANSAS_COMPLIANCE_SOURCE_LIBRARY.md",
    titlePrefix: "Official Arkansas Compliance Source Library",
  },
];

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL required");
  const openaiKey = process.env.OPENAI_API_KEY?.trim() || shellOpenAiKey;
  if (openaiKey) process.env.OPENAI_API_KEY = openaiKey;
  const skipEmbeddings =
    process.env.INGEST_SKIP_EMBEDDINGS === "1" || process.env.INGEST_KEYWORD_ONLY === "1" || !openaiKey;
  if (skipEmbeddings) {
    console.warn("[ingest:compliance] No embeddings configured. Upserting keyword-only chunks.");
  }

  const chunks = (
    await Promise.all(
      sources.map(async (source) => {
        const absolutePath = path.join(repoRoot, source.path);
        const raw = await readFile(absolutePath, "utf8");
        return chunkMarkdown(source.path, raw).map((chunk) => ({
          ...chunk,
          title: `${source.titlePrefix}: ${chunk.title}`,
        }));
      }),
    )
  ).flat();

  console.log(`[ingest:compliance] Upserting ${chunks.length} official compliance chunk(s).`);
  const batchSize = 16;
  let embeddingUnavailable = skipEmbeddings;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    let embeddings: number[][];
    if (embeddingUnavailable) {
      embeddings = batch.map(() => []);
    } else {
      try {
        embeddings = await embedTexts(batch.map((chunk) => `${chunk.title}\n\n${chunk.content}`));
      } catch (error) {
        console.warn(
          "[ingest:compliance] OpenAI embeddings failed. Remaining chunks use keyword-only embeddings.",
          error instanceof Error ? error.message : error,
        );
        embeddingUnavailable = true;
        embeddings = batch.map(() => []);
      }
    }

    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      await prisma.searchChunk.upsert({
        where: { path_chunkIndex: { path: chunk.path, chunkIndex: chunk.chunkIndex } },
        create: {
          path: chunk.path,
          title: chunk.title,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          embedding: JSON.stringify(embeddings[j]),
        },
        update: {
          title: chunk.title,
          content: chunk.content,
          embedding: JSON.stringify(embeddings[j]),
        },
      });
    }
  }
  console.log("[ingest:compliance] Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
