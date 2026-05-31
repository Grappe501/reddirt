#!/usr/bin/env tsx
import { loadVideoCandidates, loadVideoProcessingQueue } from "../src/lib/legislature/legislativeVideoArchiveStore";
import { transcribeVideoCandidate } from "../src/lib/legislature/legislativeTranscriptionPipeline";

async function main() {
  const candidates = loadVideoCandidates();
  const queue = loadVideoProcessingQueue();
  let deferred = 0;
  for (const item of queue.queue.filter((q) => q.step === "TRANSCRIBE" && q.status === "PENDING")) {
    const candidate = candidates.candidates.find((c) => c.id === item.candidateId);
    if (!candidate) continue;
    const result = await transcribeVideoCandidate(candidate);
    if (result.status === "TRANSCRIPTION_DEFERRED") deferred += 1;
  }
  console.log(JSON.stringify({ queueItems: queue.queue.length, transcriptionDeferred: deferred }, null, 2));
}

main();
