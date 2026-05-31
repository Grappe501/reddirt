import type { SpeakerAttributionStatus } from "./sponsorPresentationDetector";
import type { TranscriptSegment } from "./legislativeTranscriptionTypes";

export type TranscriptChunkType =
  | "BILL_PRESENTATION"
  | "POLICY_RATIONALE"
  | "DEFENSE_OF_BILL"
  | "RESPONSE_TO_QUESTION"
  | "PROCEDURAL_STATEMENT"
  | "VALUE_STATEMENT"
  | "ATTACK_SURFACE"
  | "CONTRADICTION_CANDIDATE"
  | "MESSAGEABLE_QUOTE"
  | "CONTEXT_CHUNK";

export type LegislativeTranscriptChunk = {
  id: string;
  billNumber: string;
  session: string;
  committeeName: string;
  meetingDate: string;
  videoUrl: string;
  transcriptSegmentIds: string[];
  speaker: string;
  speakerAttributionStatus: SpeakerAttributionStatus;
  startTime: string;
  endTime: string;
  text: string;
  summary: string;
  chunkType: TranscriptChunkType;
  topicTags: string[];
  quoteCandidates: string[];
  claimCandidates: string[];
  citationSourceId: string | null;
  citationAnchorId: string | null;
  claimLedgerIds: string[];
  publicUseRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidenceScore: number;
  reviewStatus: "DRAFT" | "NEEDS_REVIEW" | "HUMAN_VERIFIED" | "REJECTED";
};

export function classifyTranscriptChunkText(text: string): TranscriptChunkType {
  const t = text.toLowerCase();
  if (/present|author of|sponsor/i.test(t)) return "BILL_PRESENTATION";
  if (/\?/.test(text) && /answer|respond|because/i.test(t)) return "RESPONSE_TO_QUESTION";
  if (/integrity|security|fraud|election|county|ballot/i.test(t)) return "POLICY_RATIONALE";
  if (/believe|value|principle|faith/i.test(t)) return "VALUE_STATEMENT";
  if (text.length < 120 && /["']/.test(text)) return "MESSAGEABLE_QUOTE";
  return "CONTEXT_CHUNK";
}

export function chunkTranscriptForIntelligence(
  segments: TranscriptSegment[],
  meta: {
    billNumber: string;
    session: string;
    committeeName: string;
    meetingDate: string;
    videoUrl: string;
    videoCandidateId: string;
    speakerAttributionStatus: SpeakerAttributionStatus;
    speaker: string;
  },
): LegislativeTranscriptChunk[] {
  if (!segments.length) return [];
  const chunks: LegislativeTranscriptChunk[] = [];
  const windowSize = 3;
  for (let i = 0; i < segments.length; i += windowSize) {
    const group = segments.slice(i, i + windowSize);
    const text = group.map((s) => s.text).join(" ");
    if (!text.trim()) continue;
    const chunkType = classifyTranscriptChunkText(text);
    chunks.push({
      id: `ltc-${meta.videoCandidateId}-${i}`,
      billNumber: meta.billNumber,
      session: meta.session,
      committeeName: meta.committeeName,
      meetingDate: meta.meetingDate,
      videoUrl: meta.videoUrl,
      transcriptSegmentIds: group.map((s) => s.id),
      speaker: meta.speaker,
      speakerAttributionStatus: meta.speakerAttributionStatus,
      startTime: group[0].startTime,
      endTime: group[group.length - 1].endTime,
      text,
      summary: text.slice(0, 200),
      chunkType,
      topicTags: [],
      quoteCandidates: chunkType === "MESSAGEABLE_QUOTE" ? [text.slice(0, 280)] : [],
      claimCandidates: chunkType === "POLICY_RATIONALE" ? [text.slice(0, 200)] : [],
      citationSourceId: null,
      citationAnchorId: null,
      claimLedgerIds: [],
      publicUseRisk: meta.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "MEDIUM" : "HIGH",
      confidenceScore: meta.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? 75 : 45,
      reviewStatus: meta.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "NEEDS_REVIEW" : "DRAFT",
    });
  }
  return chunks;
}

export function extractQuoteCandidates(chunks: LegislativeTranscriptChunk[]): string[] {
  return chunks.flatMap((c) => c.quoteCandidates);
}

export function extractClaimCandidatesFromTranscriptChunks(chunks: LegislativeTranscriptChunk[]): string[] {
  return chunks.flatMap((c) => c.claimCandidates);
}
