/**
 * Build SearchChunk rows from admin intelligence prep corpus for ingest.
 * Paths prefixed intel:prep: — admin search only, never public Ask Kelly.
 */
import { buildIntelSearchCorpus, type IntelSearchDocument } from "@/lib/intelligence/intelligenceSearchCorpus";

const MAX_CHUNK_CHARS = 3200;

export type IntelPrepIngestChunk = {
  path: string;
  title: string;
  chunkIndex: number;
  content: string;
};

function chunkDocument(doc: IntelSearchDocument): IntelPrepIngestChunk[] {
  const basePath = `intel:prep:${doc.kind}:${doc.id}`;
  const body = doc.body.trim();
  if (body.length <= MAX_CHUNK_CHARS) {
    return [
      {
        path: basePath,
        title: doc.title,
        chunkIndex: 0,
        content: `${doc.title}\n${doc.section ?? ""}\n${doc.badge ?? ""}\n\n${body}`,
      },
    ];
  }
  const chunks: IntelPrepIngestChunk[] = [];
  let offset = 0;
  let idx = 0;
  while (offset < body.length) {
    const slice = body.slice(offset, offset + MAX_CHUNK_CHARS);
    chunks.push({
      path: basePath,
      title: doc.title,
      chunkIndex: idx,
      content: `${doc.title} (part ${idx + 1})\n\n${slice}`,
    });
    offset += MAX_CHUNK_CHARS;
    idx++;
  }
  return chunks;
}

export function loadIntelligencePrepSearchChunks(
  profile: "CANDIDATE" | "STAFF" | "CLERK_WEEK" = "CANDIDATE",
): IntelPrepIngestChunk[] {
  return buildIntelSearchCorpus(profile).flatMap(chunkDocument);
}
