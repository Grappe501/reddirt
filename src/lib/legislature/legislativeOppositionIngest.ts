import type { LegislativeTranscriptChunk } from "./legislativeTranscriptChunker";
import { loadOppositionArchive, saveOppositionArchive } from "@/lib/opposition/oppositionArchiveStore";
import { bindAllOppositionArchiveCitations } from "@/lib/opposition/oppositionCitationBinder";
import type { OppositionArchiveItem, OppositionClipRecord, OppositionQuoteRecord } from "@/lib/opposition/oppositionArchiveTypes";

export function ingestLegislativeChunksIntoOppositionArchive(
  chunks: LegislativeTranscriptChunk[],
  repoRoot: string = process.cwd(),
): { itemsAdded: number; quotesAdded: number; clipsAdded: number } {
  const bundle = loadOppositionArchive(repoRoot);
  let itemsAdded = 0;
  let quotesAdded = 0;
  let clipsAdded = 0;

  const videoUrls = new Set(chunks.map((c) => c.videoUrl));
  for (const url of videoUrls) {
    const sample = chunks.find((c) => c.videoUrl === url)!;
    const clipId = `leg-clip-${sample.billNumber}-${sample.session.replace(/\//g, "-")}`;
    if (!bundle.clips.records.some((c) => c.id === clipId)) {
      bundle.clips.records.push({
        id: clipId,
        opponentId: "kim-hammer",
        title: `${sample.billNumber} committee video — ${sample.committeeName}`,
        url,
        clipType: "DIRECT_OPPONENT",
        timestamp: sample.startTime,
        citationSourceId: sample.citationSourceId,
        retrievalNeeded: false,
        createdAt: new Date().toISOString(),
      });
      clipsAdded += 1;
    }
  }

  for (const chunk of chunks) {
    const itemId = `archive-leg-chunk-${chunk.id}`;
    if (bundle.items.items.some((i) => i.id === itemId)) continue;

    const item: OppositionArchiveItem = {
      id: itemId,
      opponentId: "kim-hammer",
      itemType: "VIDEO_CLIP",
      title: `${chunk.billNumber} ${chunk.chunkType} (${chunk.startTime})`,
      date: chunk.meetingDate,
      sourceTitle: chunk.committeeName,
      sourceUrlOrPath: chunk.videoUrl,
      sourceType: "LEGISLATIVE_COMMITTEE_VIDEO",
      topicTags: [chunk.chunkType, ...chunk.topicTags],
      countyTags: [],
      officeTags: ["legislature"],
      summary: chunk.summary,
      directQuotes: chunk.quoteCandidates,
      clipReferences: [`leg-clip-${chunk.billNumber}-${chunk.session.replace(/\//g, "-")}`],
      writingReferences: [],
      claimIds: chunk.claimLedgerIds,
      citationSourceIds: chunk.citationSourceId ? [chunk.citationSourceId] : [],
      citationAnchorIds: chunk.citationAnchorId ? [chunk.citationAnchorId] : [],
      reliabilityRating: chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "HIGH" : "MEDIUM",
      sourceConfidence: chunk.confidenceScore,
      publicUseRisk: chunk.publicUseRisk,
      researchStatus:
        chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "PARTIAL_SOURCE" : "NEEDS_REVIEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    bundle.items.items.push(item);
    itemsAdded += 1;

    for (const quote of chunk.quoteCandidates) {
      const quoteId = `leg-quote-${chunk.id}`;
      if (!bundle.quotes.records.some((q) => q.id === quoteId)) {
        const usable = chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED";
        bundle.quotes.records.push({
          id: quoteId,
          opponentId: "kim-hammer",
          quoteText: quote,
          context: `${chunk.billNumber} ${chunk.startTime}–${chunk.endTime} speaker=${chunk.speakerAttributionStatus}`,
          sourceUrlOrPath: chunk.videoUrl,
          date: chunk.meetingDate,
          citationSourceId: chunk.citationSourceId,
          citationAnchorId: chunk.citationAnchorId,
          usable,
          unusableReason: usable ? null : "Speaker attribution not confirmed or transcript needs review",
          publicUseRisk: chunk.publicUseRisk,
          createdAt: new Date().toISOString(),
        });
        quotesAdded += 1;
      }
    }
  }

  saveOppositionArchive(bundle, repoRoot);
  bindAllOppositionArchiveCitations(repoRoot);
  return { itemsAdded, quotesAdded, clipsAdded };
}
