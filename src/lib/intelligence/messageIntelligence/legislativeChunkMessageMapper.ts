import type { LegislativeTranscriptChunk } from "@/lib/legislature/legislativeTranscriptChunker";
import type { MessageRecommendation } from "./messageIntelligenceTypes";

function rec(
  partial: Omit<MessageRecommendation, "id"> & { id?: string },
  index: number,
): MessageRecommendation {
  return {
    id: partial.id ?? `mie-leg-${index}-${Date.now().toString(36)}`,
    ...partial,
  };
}

export function mapLegislativeChunkToMessageRecommendations(
  chunk: LegislativeTranscriptChunk,
  index: number,
): MessageRecommendation[] {
  const out: MessageRecommendation[] = [];
  const weakSpeaker = chunk.speakerAttributionStatus !== "SPEAKER_CONFIRMED";
  const citationDepth = chunk.citationAnchorId ? 70 : 20;
  const confidence = weakSpeaker ? Math.min(chunk.confidenceScore, 45) : chunk.confidenceScore;
  const reviewStatus = weakSpeaker || chunk.reviewStatus === "NEEDS_REVIEW" ? "NEEDS_REVIEW" : "DRAFT";
  const publicUseRisk = weakSpeaker ? "HIGH" : chunk.publicUseRisk;

  const anchors = [
    chunk.videoUrl,
    chunk.citationAnchorId ?? "no-citation",
    `${chunk.startTime}-${chunk.endTime}`,
  ].filter(Boolean);

  if (chunk.chunkType === "POLICY_RATIONALE" || chunk.chunkType === "BILL_PRESENTATION") {
    out.push(
      rec(
        {
          category: weakSpeaker ? "RISKY_THEME" : "DEBATE_LANE",
          text: `[INTERNAL] ${chunk.billNumber} ${chunk.chunkType}: ${chunk.summary.slice(0, 160)}`,
          evidenceAnchors: anchors,
          claimLedgerIds: chunk.claimLedgerIds,
          citationDepthScore: citationDepth,
          confidenceScore: confidence,
          reviewStatus,
          publicUseRisk,
          recommendedHumanAction: weakSpeaker
            ? "Verify speaker + transcript before debate use"
            : "Human transcript review then internal strategy use",
          sourceSystems: ["legislativeTranscriptChunk", chunk.billNumber],
        },
        index,
      ),
    );
  }

  if (/county|election|ballot|clerk/i.test(chunk.text)) {
    out.push(
      rec(
        {
          category: "COUNTY_OPPORTUNITY",
          text: `[INTERNAL COUNTY] ${chunk.summary.slice(0, 140)}`,
          evidenceAnchors: anchors,
          claimLedgerIds: chunk.claimLedgerIds,
          citationDepthScore: citationDepth,
          confidenceScore: confidence,
          reviewStatus: "NEEDS_REVIEW",
          publicUseRisk: "HIGH",
          recommendedHumanAction: "County messaging requires citation + human review",
          sourceSystems: ["legislativeChunkMessageMapper"],
        },
        index * 10 + 1,
      ),
    );
  }

  if (chunk.chunkType === "ATTACK_SURFACE" || chunk.chunkType === "CONTRADICTION_CANDIDATE") {
    out.push(
      rec(
        {
          category: "EVIDENCE_ANGLE",
          text: `[INTERNAL OPPOSITION] ${chunk.summary.slice(0, 140)}`,
          evidenceAnchors: anchors,
          claimLedgerIds: chunk.claimLedgerIds,
          citationDepthScore: citationDepth,
          confidenceScore: confidence,
          reviewStatus: "NEEDS_REVIEW",
          publicUseRisk: "MEDIUM",
          recommendedHumanAction: "Verify contradiction with primary source before internal use",
          sourceSystems: ["legislativeChunkMessageMapper"],
        },
        index * 10 + 2,
      ),
    );
  }

  for (const quote of chunk.quoteCandidates) {
    out.push(
      rec(
        {
          category: weakSpeaker ? "WEAK_ANGLE" : "TALKING_POINT",
          text: weakSpeaker
            ? `[UNVERIFIED SPEAKER — DO NOT USE] ${quote.slice(0, 120)}`
            : `[TRANSCRIPT REVIEW REQUIRED] ${quote.slice(0, 120)}`,
          evidenceAnchors: anchors,
          claimLedgerIds: chunk.claimLedgerIds,
          citationDepthScore: citationDepth,
          confidenceScore: weakSpeaker ? 25 : Math.min(confidence, 60),
          reviewStatus: "NEEDS_REVIEW",
          publicUseRisk: weakSpeaker ? "CRITICAL" : "HIGH",
          recommendedHumanAction: "Human transcript + speaker verification required",
          sourceSystems: ["legislativeQuoteCandidate"],
        },
        index * 10 + 3,
      ),
    );
  }

  if (weakSpeaker) {
    out.push(
      rec(
        {
          category: "AVOID_PHRASE",
          text: `Do not attribute to Hammer without verification: "${chunk.text.slice(0, 80)}…"`,
          evidenceAnchors: anchors,
          claimLedgerIds: [],
          citationDepthScore: 0,
          confidenceScore: 90,
          reviewStatus: "HUMAN_VERIFIED",
          publicUseRisk: "CRITICAL",
          recommendedHumanAction: "Block from message use until SPEAKER_CONFIRMED",
          sourceSystems: ["speakerVerification"],
        },
        index * 10 + 4,
      ),
    );
  }

  return out;
}

export function mapAllLegislativeChunksToMessages(
  chunks: LegislativeTranscriptChunk[],
): MessageRecommendation[] {
  return chunks.flatMap((c, i) => mapLegislativeChunkToMessageRecommendations(c, i));
}
