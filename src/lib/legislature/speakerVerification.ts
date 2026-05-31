import type { LegislativeTranscriptChunk } from "./legislativeTranscriptChunker";
import type { SpeakerAttributionStatus } from "./sponsorPresentationDetector";

export type SpeakerVerificationContext = {
  sponsorName: string;
  billNumber: string;
  isPresentationWindow: boolean;
  chairRecognitionInText: boolean;
  billMentionInText: boolean;
};

export function calculateSpeakerConfidence(
  chunk: LegislativeTranscriptChunk,
  context: SpeakerVerificationContext,
): number {
  let score = 0;
  if (chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED") score += 50;
  if (context.chairRecognitionInText) score += 25;
  if (context.billMentionInText) score += 10;
  if (context.isPresentationWindow) score += 10;
  if (chunk.speaker.toLowerCase().includes(context.sponsorName.split(" ")[1]?.toLowerCase() ?? "hammer")) score += 15;
  return Math.min(100, score);
}

export function verifySpeakerForChunk(
  chunk: LegislativeTranscriptChunk,
  sponsorName: string,
): { status: SpeakerAttributionStatus; confidence: number; requiresReview: boolean } {
  const context: SpeakerVerificationContext = {
    sponsorName,
    billNumber: chunk.billNumber,
    isPresentationWindow: chunk.chunkType === "BILL_PRESENTATION",
    chairRecognitionInText: /recognized|presents the bill/i.test(chunk.text),
    billMentionInText: new RegExp(chunk.billNumber, "i").test(chunk.text),
  };
  const confidence = calculateSpeakerConfidence(chunk, context);

  let status: SpeakerAttributionStatus = chunk.speakerAttributionStatus;
  if (confidence >= 80 && context.chairRecognitionInText) status = "SPEAKER_CONFIRMED";
  else if (confidence >= 55) status = "LIKELY_SPEAKER";
  else if (confidence >= 25) status = "NEEDS_REVIEW";
  else status = "UNKNOWN";

  return {
    status,
    confidence,
    requiresReview: status !== "SPEAKER_CONFIRMED",
  };
}

export function requireHumanReviewForWeakAttribution(chunk: LegislativeTranscriptChunk): boolean {
  return (
    chunk.speakerAttributionStatus !== "SPEAKER_CONFIRMED" ||
    chunk.reviewStatus === "DRAFT" ||
    chunk.publicUseRisk === "HIGH" ||
    chunk.publicUseRisk === "CRITICAL"
  );
}

export function summarizeSpeakerVerificationResults(chunks: LegislativeTranscriptChunk[]): {
  confirmed: number;
  likely: number;
  needsReview: number;
  unknown: number;
} {
  const counts = { confirmed: 0, likely: 0, needsReview: 0, unknown: 0 };
  for (const c of chunks) {
    if (c.speakerAttributionStatus === "SPEAKER_CONFIRMED") counts.confirmed += 1;
    else if (c.speakerAttributionStatus === "LIKELY_SPEAKER") counts.likely += 1;
    else if (c.speakerAttributionStatus === "NEEDS_REVIEW") counts.needsReview += 1;
    else counts.unknown += 1;
  }
  return counts;
}

/** Weak attribution cannot produce VERIFIED quote status. */
export function quoteReviewStatusFromSpeaker(
  status: SpeakerAttributionStatus,
): "VERIFIED" | "NEEDS_REVIEW" | "UNUSABLE" {
  if (status === "SPEAKER_CONFIRMED") return "NEEDS_REVIEW"; // transcript still needs human review
  if (status === "LIKELY_SPEAKER") return "NEEDS_REVIEW";
  return "UNUSABLE";
}
