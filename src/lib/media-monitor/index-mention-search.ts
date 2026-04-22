import { prisma } from "@/lib/db";
import { chunkTextForSearch } from "@/lib/campaign-briefings/chunk-for-search";
import { embedTexts } from "@/lib/openai/embeddings";
import { isOpenAIConfigured } from "@/lib/openai/client";

/** Embed mention text for campaign RAG (optional; skips when OpenAI not configured). */
export async function indexExternalMediaMentionSearch(mentionId: string): Promise<void> {
  if (!isOpenAIConfigured()) return;
  const m = await prisma.externalMediaMention.findUnique({
    where: { id: mentionId },
    include: { source: true },
  });
  if (!m) return;
  const textParts = [m.title, m.summary, m.fullText].filter(Boolean).join("\n\n");
  if (!textParts.trim() || textParts.length < 40) return;

  const chunks = chunkTextForSearch(textParts, 1600);
  if (!chunks.length) return;

  const basePath = `external-media:${m.id}`;
  const label = `Earned media · ${m.source.name}`;
  const batch = 10;
  for (let i = 0; i < chunks.length; i += batch) {
    const slice = chunks.slice(i, i + batch);
    const embed = await embedTexts(
      slice.map(
        (c) =>
          `${label}\nURL: ${m.canonicalUrl}\nPublished: ${m.publishedAt?.toISOString() ?? "unknown"}\n\n${c}`,
      ),
    );
    for (let j = 0; j < slice.length; j++) {
      const chunkIndex = i + j;
      await prisma.searchChunk.upsert({
        where: { path_chunkIndex: { path: basePath, chunkIndex } },
        create: {
          path: basePath,
          title: m.title,
          chunkIndex,
          content: slice[j]!,
          embedding: JSON.stringify(embed[j]!),
        },
        update: {
          title: m.title,
          content: slice[j]!,
          embedding: JSON.stringify(embed[j]!),
        },
      });
    }
  }
}
