import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { loadDebateWarRoomP4Packet } from "@/lib/intelligence/v4/debateWarRoomP4";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { loadPriorityBillRegistry, summarizePriorityBills } from "@/lib/legislature/priorityBillRegistry";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { summarizeVideoArchiveStore } from "@/lib/legislature/legislativeVideoArchiveStore";
import { summarizeLegislativeClaimCoverage } from "@/lib/legislature/legislativeClaimIngest";
import { getTranscriptionProviderStatus } from "@/lib/legislature/legislativeTranscriptionPipeline";
import { summarizeAudioExtractionReadiness } from "@/lib/legislature/legislativeAudioExtraction";
import { summarizeTranscriptionProviderReadiness } from "@/lib/legislature/legislativeTranscriptProvider";

export async function loadSafeLegislativeVideoPageData() {
  const launchMode = isIntelligenceOppositionDebateLaunchMode();
  const registry = tryIntelligenceLoad("priority-bill-registry", () => loadPriorityBillRegistry(), {
    opponentId: "kim-hammer",
    bills: [],
    version: 1,
    generatedAt: new Date().toISOString(),
  });
  const priority = summarizePriorityBills(registry);
  const rollup = tryIntelligenceLoad("legislative-video-rollup", () => buildLegislativeVideoIntelligenceRollup(), {
    generatedAt: new Date().toISOString(),
    chunkCount: 0,
    videoCandidatesTotal: 0,
    automationNote: "Rollup unavailable",
    strongestQuotes: [],
    quotesNeedingReview: [],
    billsMissingVideo: [],
    debateUsefulChunks: [],
    tooRiskyToUse: [],
    topHammerCommitteeQuotes: [],
    policyThemesRepeating: [],
    countyMessagingUseful: [],
    transcriptionProviderStatus: "NOT_CONFIGURED",
    priorityBillCount: 0,
    criticalBillCount: 0,
    transcribedCandidates: 0,
    transcriptSegmentCount: 0,
    quoteCount: 0,
    claimLedgerLinkedChunks: 0,
    speakerVerification: { confirmed: 0, likely: 0, needsReview: 0, unknown: 0 },
    billsWithTranscriptCoverage: [],
    governance: {
      publicationSafety: "NON_PUBLISHABLE",
      humanReviewRequired: true,
      labels: ["INTERNAL_DRAFT"],
    },
  });
  const video = tryIntelligenceLoad("video-archive-store", () => summarizeVideoArchiveStore(), {
    totalCandidates: 0,
    transcribed: 0,
    withVideoUrl: 0,
    byStatus: {},
  });
  const claims = tryIntelligenceLoad("legislative-claim-coverage", () => summarizeLegislativeClaimCoverage(), {
    withClaims: 0,
    totalChunks: 0,
    withCitation: 0,
    needsReview: 0,
  });
  const transcription = getTranscriptionProviderStatus();
  const audioReadiness = launchMode
    ? { enabled: false, ffmpegAvailable: false, note: "Deferred in debate launch mode" }
    : await summarizeAudioExtractionReadiness();
  const transcriptionReadiness = summarizeTranscriptionProviderReadiness();
  const p4 = launchMode ? loadDebateWarRoomP4Packet() : null;

  return { launchMode, registry, priority, rollup, video, claims, transcription, audioReadiness, transcriptionReadiness, p4 };
}
