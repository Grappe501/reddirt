import { loadTranscriptChunks, summarizeLegislativeClaimCoverage } from "./legislativeClaimIngest";
import { loadPriorityBillRegistry, summarizePriorityBills } from "./priorityBillRegistry";
import { loadVideoCandidates, summarizeVideoArchiveStore } from "./legislativeVideoArchiveStore";
import { loadTranscriptSegments } from "./legislativeTranscriptionPipeline";
import { summarizeSpeakerVerificationResults } from "./speakerVerification";
import { LEGISLATIVE_GOVERNANCE } from "./legislativeGovernance";

export type LegislativeVideoIntelligenceRollup = {
  generatedAt: string;
  priorityBillCount: number;
  criticalBillCount: number;
  videoCandidatesTotal: number;
  transcribedCandidates: number;
  transcriptSegmentCount: number;
  chunkCount: number;
  quoteCount: number;
  claimLedgerLinkedChunks: number;
  speakerVerification: ReturnType<typeof summarizeSpeakerVerificationResults>;
  billsWithTranscriptCoverage: string[];
  billsMissingVideo: string[];
  strongestQuotes: string[];
  quotesNeedingReview: string[];
  topHammerCommitteeQuotes: string[];
  policyThemesRepeating: string[];
  debateUsefulChunks: string[];
  countyMessagingUseful: string[];
  tooRiskyToUse: string[];
  transcriptionProviderStatus: string;
  automationNote: string;
  governance: typeof LEGISLATIVE_GOVERNANCE;
};

export function buildLegislativeVideoIntelligenceRollup(
  repoRoot: string = process.cwd(),
): LegislativeVideoIntelligenceRollup {
  const registry = loadPriorityBillRegistry(repoRoot);
  const prioritySummary = summarizePriorityBills(registry);
  const videoSummary = summarizeVideoArchiveStore(repoRoot);
  const segments = loadTranscriptSegments(repoRoot);
  const chunks = loadTranscriptChunks(repoRoot);
  const claimCoverage = summarizeLegislativeClaimCoverage(repoRoot);
  const speakerVerification = summarizeSpeakerVerificationResults(chunks);
  const candidates = loadVideoCandidates(repoRoot);

  const billsWithVideo = new Set(candidates.candidates.map((c) => `${c.billNumber}|${c.session}`));
  const billsMissingVideo = registry.bills
    .filter((b) => b.priorityLevel === "CRITICAL" || b.priorityLevel === "HIGH")
    .filter((b) => !billsWithVideo.has(`${b.billNumber}|${b.session}`))
    .map((b) => `${b.billNumber} (${b.session})`);

  const strongestQuotes = chunks
    .filter((c) => c.speakerAttributionStatus === "SPEAKER_CONFIRMED" && c.quoteCandidates.length)
    .flatMap((c) => c.quoteCandidates)
    .slice(0, 5);

  const quotesNeedingReview = chunks
    .filter((c) => c.speakerAttributionStatus !== "SPEAKER_CONFIRMED")
    .flatMap((c) => c.quoteCandidates)
    .slice(0, 5);

  const policyThemes = [...new Set(chunks.filter((c) => c.chunkType === "POLICY_RATIONALE").map((c) => c.billNumber))];

  return {
    generatedAt: new Date().toISOString(),
    priorityBillCount: prioritySummary.total,
    criticalBillCount: prioritySummary.byPriority.CRITICAL,
    videoCandidatesTotal: videoSummary.totalCandidates,
    transcribedCandidates: videoSummary.transcribed,
    transcriptSegmentCount: segments.segments.length,
    chunkCount: chunks.length,
    quoteCount: chunks.reduce((n, c) => n + c.quoteCandidates.length, 0),
    claimLedgerLinkedChunks: claimCoverage.withClaims,
    speakerVerification,
    billsWithTranscriptCoverage: [...new Set(chunks.map((c) => c.billNumber))],
    billsMissingVideo,
    strongestQuotes,
    quotesNeedingReview,
    topHammerCommitteeQuotes: strongestQuotes,
    policyThemesRepeating: policyThemes,
    debateUsefulChunks: chunks
      .filter((c) => c.chunkType === "POLICY_RATIONALE" || c.chunkType === "BILL_PRESENTATION")
      .map((c) => c.summary)
      .slice(0, 5),
    countyMessagingUseful: chunks
      .filter((c) => /county|election|ballot/i.test(c.text))
      .map((c) => c.summary)
      .slice(0, 5),
    tooRiskyToUse: chunks
      .filter((c) => c.publicUseRisk === "HIGH" || c.publicUseRisk === "CRITICAL")
      .map((c) => c.summary)
      .slice(0, 5),
    transcriptionProviderStatus:
      process.env.LEGISLATURE_TRANSCRIPTION_ENABLED === "1" ? "OPENAI_IF_CONFIGURED" : "DEFERRED",
    automationNote:
      chunks.length === 0
        ? "Pipeline ready — enable LEGISLATURE_LIVE_DISCOVERY=1 + transcription provider to process videos"
        : `${chunks.length} chunks indexed — human review required before message use`,
    governance: LEGISLATIVE_GOVERNANCE,
  };
}
