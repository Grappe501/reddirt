import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LegislativeTranscriptChunk } from "./legislativeTranscriptChunker";
import type { LegislativeVideoCandidate } from "./legislativeVideoArchiveStore";
import {
  appendCitationAnchor,
  appendCitationSource,
  appendClaimLedgerEntry,
  loadClaimLedger,
} from "@/lib/intelligence/claims/claimLedgerStore";
import { generateClaimFingerprint, normalizeClaimText } from "@/lib/intelligence/claims/claimNormalization";
import type { ClaimLedgerEntry } from "@/lib/intelligence/claims/claimLedgerTypes";

export const CHUNKS_DIR = "data/legislature/chunks";

export function loadTranscriptChunks(repoRoot: string = process.cwd()): LegislativeTranscriptChunk[] {
  const abs = path.join(repoRoot, CHUNKS_DIR, "transcript-chunks.json");
  if (!existsSync(abs)) return [];
  const file = JSON.parse(readFileSync(abs, "utf8")) as { chunks: LegislativeTranscriptChunk[] };
  return file.chunks;
}

export function saveTranscriptChunks(chunks: LegislativeTranscriptChunk[], repoRoot: string = process.cwd()): void {
  const abs = path.join(repoRoot, CHUNKS_DIR, "transcript-chunks.json");
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(
    abs,
    `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), chunks }, null, 2)}\n`,
    "utf8",
  );
}

export function createLegislativeVideoCitationSource(
  candidate: LegislativeVideoCandidate,
  repoRoot: string = process.cwd(),
): string {
  const sourceId = `cit-src-leg-video-${candidate.id}`;
  appendCitationSource(
    {
      id: sourceId,
      title: `${candidate.billNumber} committee video — ${candidate.committeeName}`,
      sourceType: "media",
      urlOrPath: candidate.videoUrl,
      publicationDate: candidate.meetingDate,
      retrievedAt: new Date().toISOString(),
      author: candidate.expectedSpeaker,
      publisher: "Arkansas Legislature (Sliq Harmony)",
      jurisdiction: "Arkansas",
      countySlug: null,
      opponentId: "kim-hammer",
      reliabilityRating: "HIGH",
      sourceConfidence: candidate.discoveryConfidence,
      quoteOrExcerpt: null,
      summary: `Committee/floor video archive for ${candidate.billNumber}`,
      limitations: ["Automated transcription requires human review", "Verify speaker in player"],
      createdAt: new Date().toISOString(),
    },
    repoRoot,
  );
  return sourceId;
}

export function createTimestampCitationAnchor(
  chunk: LegislativeTranscriptChunk,
  sourceId: string,
  repoRoot: string = process.cwd(),
): string {
  const anchorId = `cit-anchor-leg-${chunk.id}`;
  appendCitationAnchor(
    {
      id: anchorId,
      sourceId,
      anchorType: "url",
      lineRange: `${chunk.startTime}-${chunk.endTime}`,
      pageNumber: null,
      section: chunk.committeeName,
      claimSupportType:
        chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "DIRECT_SUPPORT" : "NEEDS_CONFIRMATION",
      excerpt: chunk.text.slice(0, 300),
      notes: `Legislative video timestamp ${chunk.startTime}–${chunk.endTime}; speaker=${chunk.speakerAttributionStatus}`,
    },
    repoRoot,
  );
  return anchorId;
}

function buildClaimEntry(chunk: LegislativeTranscriptChunk, anchorId: string, sourceId: string): ClaimLedgerEntry {
  const claimText = chunk.claimCandidates[0] ?? chunk.summary;
  const now = new Date().toISOString();
  const classification =
    chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "NEEDS_REVIEW" : "NEEDS_REVIEW";
  const normalized = normalizeClaimText(claimText);
  return {
    id: `claim-leg-${chunk.id}`,
    claimText,
    normalizedClaimText: normalized,
    claimFingerprint: generateClaimFingerprint({
      normalizedClaimText: normalized,
      countySlug: null,
      opponentId: "kim-hammer",
      domain: "opposition",
    }),
    claimType: "LEGISLATIVE_STATEMENT",
    domain: "opposition",
    countySlug: null,
    opponentId: "kim-hammer",
    topicTags: chunk.topicTags,
    sourceBriefIds: [],
    sourceEvidencePacketIds: [],
    sourceReviewItemIds: [],
    citationAnchorIds: [anchorId],
    supportingSourceIds: [sourceId],
    contradictingSourceIds: [],
    classification,
    verificationStatus: "DRAFT",
    publishabilityStatus: "NOT_PUBLISHABLE",
    evidenceDepthScore: chunk.confidenceScore,
    evidenceStrength: chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED" ? "MODERATE" : "WEAK",
    confidenceScore: chunk.confidenceScore,
    publicUseRisk: chunk.publicUseRisk,
    internalUseStatus: "RESEARCH_ONLY",
    recommendedHumanAction:
      chunk.speakerAttributionStatus === "SPEAKER_CONFIRMED"
        ? "Verify transcript + timestamp in committee video"
        : "Speaker attribution weak — do not use until verified",
    humanReview: {
      reviewedBy: null,
      reviewedAt: null,
      decision: null,
      notes: "",
      requiredEdits: [],
      approvalScope: "NONE",
    },
    history: [
      {
        timestamp: now,
        eventType: "INGESTED",
        actor: "legislativeClaimIngest",
        previousStatus: null,
        nextStatus: "DRAFT",
        notes: `From ${chunk.billNumber} video chunk ${chunk.startTime}`,
      },
    ],
    createdAt: now,
    updatedAt: now,
    createdBy: "legislativeClaimIngest",
    lastReviewedAt: null,
  };
}

export function bindLegislativeQuoteToClaimLedger(
  chunk: LegislativeTranscriptChunk,
  repoRoot: string = process.cwd(),
): string | null {
  if (!chunk.citationSourceId || !chunk.citationAnchorId) return null;
  if (chunk.speakerAttributionStatus === "UNKNOWN" || chunk.speakerAttributionStatus === "NOT_SPEAKER") return null;
  const entry = buildClaimEntry(chunk, chunk.citationAnchorId, chunk.citationSourceId);
  const ledger = loadClaimLedger(repoRoot);
  if (ledger.entries.some((e) => e.id === entry.id)) return entry.id;
  appendClaimLedgerEntry(entry, repoRoot);
  return entry.id;
}

export function ingestTranscriptChunksIntoClaimLedger(
  chunks: LegislativeTranscriptChunk[],
  repoRoot: string = process.cwd(),
): { ingested: number; skipped: number } {
  let ingested = 0;
  let skipped = 0;
  for (const chunk of chunks) {
    if (chunk.speakerAttributionStatus === "UNKNOWN") {
      skipped += 1;
      continue;
    }
    const claimId = bindLegislativeQuoteToClaimLedger(chunk, repoRoot);
    if (claimId) {
      chunk.claimLedgerIds = [claimId];
      ingested += 1;
    } else skipped += 1;
  }
  saveTranscriptChunks(chunks, repoRoot);
  return { ingested, skipped };
}

export function summarizeLegislativeClaimCoverage(repoRoot: string = process.cwd()) {
  const chunks = loadTranscriptChunks(repoRoot);
  return {
    totalChunks: chunks.length,
    withCitation: chunks.filter((c) => c.citationAnchorId).length,
    withClaims: chunks.filter((c) => c.claimLedgerIds.length).length,
    needsReview: chunks.filter((c) => c.reviewStatus === "NEEDS_REVIEW" || c.reviewStatus === "DRAFT").length,
  };
}
