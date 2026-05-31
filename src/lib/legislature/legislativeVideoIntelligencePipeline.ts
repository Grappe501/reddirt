import { buildLegislativeSourcePacket } from "./arkansasLegislativeSourceDiscovery";
import {
  appendVideoProcessingAudit,
  enqueueVideoProcessingStep,
  loadVideoCandidates,
  saveVideoCandidates,
  upsertVideoCandidate,
  type LegislativeVideoCandidate,
} from "./legislativeVideoArchiveStore";
import { createLegislativeVideoCitationSource, createTimestampCitationAnchor, ingestTranscriptChunksIntoClaimLedger, loadTranscriptChunks, saveTranscriptChunks } from "./legislativeClaimIngest";
import { chunkTranscriptForIntelligence } from "./legislativeTranscriptChunker";
import { ingestLegislativeChunksIntoOppositionArchive } from "./legislativeOppositionIngest";
import {
  loadPriorityBillRegistry,
  markBillVideoDiscoveryStatus,
  savePriorityBillRegistry,
} from "./priorityBillRegistry";
import { detectSponsorPresentationWindow } from "./sponsorPresentationDetector";
import { verifySpeakerForChunk } from "./speakerVerification";
import { getLegislativeFetchPolicy, resetLegislativeFetchBudget } from "./legislativeFetch";
import { loadTranscriptSegments, storeTranscriptSegments, transcribeVideoCandidate } from "./legislativeTranscriptionPipeline";
import { DEFAULT_SPONSOR_NAME } from "./legislativeGovernance";
import { buildLegislativeVideoIntelligenceRollup } from "./legislativeVideoIntelligenceRollup";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

export type LegislativePipelineMode = "CRITICAL_ONLY" | "HIGH_AND_CRITICAL" | "ALL_PRIORITY";

export const LEGISLATIVE_VIDEO_ROLLUP_PATH = "data/legislature/video-archives/legislative-video-rollup.json";

function filterBillsByMode(
  bills: ReturnType<typeof loadPriorityBillRegistry>["bills"],
  mode: LegislativePipelineMode,
) {
  if (mode === "CRITICAL_ONLY") return bills.filter((b) => b.priorityLevel === "CRITICAL");
  if (mode === "HIGH_AND_CRITICAL") {
    return bills.filter((b) => b.priorityLevel === "CRITICAL" || b.priorityLevel === "HIGH");
  }
  return bills;
}

export function saveLegislativeVideoRollupJson(
  rollup: ReturnType<typeof buildLegislativeVideoIntelligenceRollup>,
  repoRoot: string = process.cwd(),
): string {
  const abs = path.join(repoRoot, LEGISLATIVE_VIDEO_ROLLUP_PATH);
  mkdirSync(path.dirname(abs), { recursive: true });
  writeFileSync(abs, `${JSON.stringify(rollup, null, 2)}\n`, "utf8");
  return abs;
}

export type PipelineRunResult = {
  mode: LegislativePipelineMode;
  billsProcessed: number;
  videoCandidatesAdded: number;
  transcriptionDeferred: number;
  chunksCreated: number;
  claimsIngested: number;
  oppositionItemsAdded: number;
  rollup: ReturnType<typeof buildLegislativeVideoIntelligenceRollup>;
  warnings: string[];
};

export async function runLegislativeVideoIntelligencePipeline(
  repoRoot: string = process.cwd(),
  mode: LegislativePipelineMode = "CRITICAL_ONLY",
): Promise<PipelineRunResult> {
  resetLegislativeFetchBudget();
  const policy = getLegislativeFetchPolicy();
  const registry = loadPriorityBillRegistry(repoRoot);
  const warnings: string[] = [];
  let videoCandidatesAdded = 0;
  let transcriptionDeferred = 0;
  let chunksCreated = 0;
  let claimsIngested = 0;
  let oppositionItemsAdded = 0;

  const priorityBills = filterBillsByMode(registry.bills, mode).slice(0, policy.maxFetchesPerRun);

  for (const bill of priorityBills) {
    const packet = await buildLegislativeSourcePacket(bill.billNumber, bill.session, repoRoot, policy);
    warnings.push(...packet.retrievalWarnings);

    for (const vc of packet.videoCandidates) {
      const id = `lvc-${bill.billNumber}-${bill.session.replace(/\//g, "-")}-${videoCandidatesAdded}`;
      const candidate: LegislativeVideoCandidate = {
        id,
        billNumber: bill.billNumber,
        session: bill.session,
        committeeName: vc.committeeName,
        meetingDate: vc.meetingDate,
        videoUrl: vc.videoUrl,
        sourcePageUrl: vc.sourcePageUrl,
        sourceType: vc.sourceType,
        duration: null,
        agendaPosition: null,
        sponsorExpected: bill.sponsor.includes("Hammer"),
        expectedSpeaker: DEFAULT_SPONSOR_NAME,
        discoveryConfidence: vc.discoveryConfidence,
        processingStatus: "DISCOVERED",
        retrievalWarnings: packet.retrievalWarnings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existing = loadVideoCandidates(repoRoot);
      if (!existing.candidates.some((c) => c.videoUrl === candidate.videoUrl)) {
        upsertVideoCandidate(candidate, repoRoot);
        videoCandidatesAdded += 1;
        enqueueVideoProcessingStep(candidate.id, "TRANSCRIBE", repoRoot);
        appendVideoProcessingAudit(
          { eventType: "VIDEO_DISCOVERED", candidateId: candidate.id, notes: bill.billNumber },
          repoRoot,
        );
      }

      const tx = await transcribeVideoCandidate(candidate, repoRoot);
      if (tx.status === "TRANSCRIPTION_DEFERRED") {
        transcriptionDeferred += 1;
        candidate.processingStatus = "TRANSCRIPTION_DEFERRED";
        upsertVideoCandidate(candidate, repoRoot);
        continue;
      }

      if (tx.segments.length) {
        storeTranscriptSegments(tx.segments, repoRoot);
        candidate.processingStatus = "TRANSCRIBED";
        upsertVideoCandidate(candidate, repoRoot);

        const window = detectSponsorPresentationWindow(tx.segments, bill.billNumber, DEFAULT_SPONSOR_NAME);
        const chunks = chunkTranscriptForIntelligence(tx.segments, {
          billNumber: bill.billNumber,
          session: bill.session,
          committeeName: vc.committeeName,
          meetingDate: vc.meetingDate,
          videoUrl: vc.videoUrl,
          videoCandidateId: candidate.id,
          speakerAttributionStatus: window?.speakerAttributionStatus ?? "NEEDS_REVIEW",
          speaker: DEFAULT_SPONSOR_NAME,
        });

        const sourceId = createLegislativeVideoCitationSource(candidate, repoRoot);
        for (const chunk of chunks) {
          const verified = verifySpeakerForChunk(chunk, DEFAULT_SPONSOR_NAME);
          chunk.speakerAttributionStatus = verified.status;
          chunk.citationSourceId = sourceId;
          chunk.citationAnchorId = createTimestampCitationAnchor(chunk, sourceId, repoRoot);
          chunk.reviewStatus = verified.requiresReview ? "NEEDS_REVIEW" : "DRAFT";
        }

        const existingChunks = loadTranscriptChunks(repoRoot);
        saveTranscriptChunks([...existingChunks, ...chunks], repoRoot);
        chunksCreated += chunks.length;

        const claimResult = ingestTranscriptChunksIntoClaimLedger(chunks, repoRoot);
        claimsIngested += claimResult.ingested;

        const opp = ingestLegislativeChunksIntoOppositionArchive(chunks, repoRoot);
        oppositionItemsAdded += opp.itemsAdded;

        candidate.processingStatus = "CLAIMS_INGESTED";
        upsertVideoCandidate(candidate, repoRoot);
      }
    }

    bill.videoDiscoveryStatus = packet.videoCandidates.length ? "CANDIDATES_FOUND" : "NONE";
    bill.retrievalStatus = packet.videoCandidates.length ? "VIDEO_DISCOVERED" : bill.retrievalStatus;
    markBillVideoDiscoveryStatus(bill.billNumber, bill.session, bill.videoDiscoveryStatus, bill.retrievalStatus, repoRoot);
  }

  savePriorityBillRegistry(registry, repoRoot);
  const rollup = buildLegislativeVideoIntelligenceRollup(repoRoot);
  saveLegislativeVideoRollupJson(rollup, repoRoot);

  return {
    mode,
    billsProcessed: priorityBills.length,
    videoCandidatesAdded,
    transcriptionDeferred,
    chunksCreated,
    claimsIngested,
    oppositionItemsAdded,
    rollup,
    warnings,
  };
}
