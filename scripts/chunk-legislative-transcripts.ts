#!/usr/bin/env tsx
import { loadTranscriptSegments } from "../src/lib/legislature/legislativeTranscriptionPipeline";
import { chunkTranscriptForIntelligence } from "../src/lib/legislature/legislativeTranscriptChunker";
import { detectSponsorPresentationWindow } from "../src/lib/legislature/sponsorPresentationDetector";
import { verifySpeakerForChunk } from "../src/lib/legislature/speakerVerification";
import { loadTranscriptChunks, saveTranscriptChunks, createLegislativeVideoCitationSource, createTimestampCitationAnchor } from "../src/lib/legislature/legislativeClaimIngest";
import { loadVideoCandidates } from "../src/lib/legislature/legislativeVideoArchiveStore";
import { DEFAULT_SPONSOR_NAME } from "../src/lib/legislature/legislativeGovernance";

function main() {
  const segments = loadTranscriptSegments();
  const candidates = loadVideoCandidates();
  let created = 0;

  for (const candidate of candidates.candidates) {
    const segs = segments.segments.filter((s) => s.videoCandidateId === candidate.id);
    if (!segs.length) continue;
    const window = detectSponsorPresentationWindow(segs, candidate.billNumber, DEFAULT_SPONSOR_NAME);
    const chunks = chunkTranscriptForIntelligence(segs, {
      billNumber: candidate.billNumber,
      session: candidate.session,
      committeeName: candidate.committeeName,
      meetingDate: candidate.meetingDate,
      videoUrl: candidate.videoUrl,
      videoCandidateId: candidate.id,
      speakerAttributionStatus: window?.speakerAttributionStatus ?? "NEEDS_REVIEW",
      speaker: DEFAULT_SPONSOR_NAME,
    });
    const sourceId = createLegislativeVideoCitationSource(candidate);
    for (const chunk of chunks) {
      const v = verifySpeakerForChunk(chunk, DEFAULT_SPONSOR_NAME);
      chunk.speakerAttributionStatus = v.status;
      chunk.citationSourceId = sourceId;
      chunk.citationAnchorId = createTimestampCitationAnchor(chunk, sourceId);
    }
    saveTranscriptChunks([...loadTranscriptChunks(), ...chunks]);
    created += chunks.length;
  }
  console.log(JSON.stringify({ chunksCreated: created }, null, 2));
}

main();
