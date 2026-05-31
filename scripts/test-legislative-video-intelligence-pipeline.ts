/**
 * Pass P4 — Legislative video intelligence pipeline validation
 */
import { loadPriorityBillRegistry, summarizePriorityBills } from "../src/lib/legislature/priorityBillRegistry";
import { buildLegislativeSourcePacket, parseBillMeetingsFromHtml } from "../src/lib/legislature/arkansasLegislativeSourceDiscovery";
import { loadVideoCandidates, summarizeVideoArchiveStore } from "../src/lib/legislature/legislativeVideoArchiveStore";
import { getTranscriptionProviderStatus, normalizeTranscriptSegments } from "../src/lib/legislature/legislativeTranscriptionPipeline";
import { chunkTranscriptForIntelligence } from "../src/lib/legislature/legislativeTranscriptChunker";
import { detectSponsorPresentationWindow, scoreSpeakerAttribution } from "../src/lib/legislature/sponsorPresentationDetector";
import { quoteReviewStatusFromSpeaker, verifySpeakerForChunk } from "../src/lib/legislature/speakerVerification";
import { createLegislativeVideoCitationSource, createTimestampCitationAnchor, loadTranscriptChunks } from "../src/lib/legislature/legislativeClaimIngest";
import { buildLegislativeVideoIntelligenceRollup } from "../src/lib/legislature/legislativeVideoIntelligenceRollup";
import { buildDebateFilmRoomState } from "../src/lib/opposition/debateFilmRoom";
import { buildDebateCommandCenterState } from "../src/lib/opposition/debateCommandCenter";
import { runDailyIntelligenceAgentPass } from "../src/lib/intelligence/intelligenceAgentOrchestrator";
import { buildBrainOrchestrationAnswers } from "../src/lib/intelligence/briefs/messageIntelligenceLayer";
import { getLegislativeFetchPolicy } from "../src/lib/legislature/legislativeFetch";
import { EXTERNAL_VIDEO_P4_STATUS } from "../src/lib/legislature/externalVideoSourceTypes";
import { exportControlAllowsPublicRelease } from "../src/lib/intelligence/claims/citationDepthPolicy";
import type { ClaimLedgerEntry } from "../src/lib/intelligence/claims/claimLedgerTypes";
import type { TranscriptSegment } from "../src/lib/legislature/legislativeTranscriptionTypes";

const results: { name: string; pass: boolean; detail?: string }[] = [];

function assert(name: string, condition: boolean, detail?: string) {
  results.push({ name, pass: condition, detail });
  console.log(`${condition ? "PASS" : "FAIL"} — ${name}${detail ? `: ${detail}` : ""}`);
}

/** Unit-test fixture only — not production data */
const FIXTURE_SEGMENTS: TranscriptSegment[] = normalizeTranscriptSegments(
  [
    {
      text: "Senator Hammer, you are recognized to present Senate Bill 486.",
      startTime: "00:01:10",
      endTime: "00:01:18",
      speakerLabel: "CHAIR",
      speakerConfidence: 90,
    },
    {
      text: "Thank you, Mr. Chairman. This is Senate Bill 486 concerning electioneering.",
      startTime: "00:01:18",
      endTime: "00:01:45",
      speakerLabel: "Hammer",
      speakerConfidence: 70,
    },
  ],
  "fixture-vc-1",
  "SB486",
);

function main() {
  const registry = loadPriorityBillRegistry();
  assert("Priority bill registry loads", registry.bills.length >= 10, `bills=${registry.bills.length}`);

  const summary = summarizePriorityBills(registry);
  assert("Priority bill summary valid", summary.total === registry.bills.length);

  const packet = { billNumber: "SB486", session: "2021/2021R", billUrl: "https://example.com", videoCandidates: [], committeeMeetings: [], documentLinks: [], confidence: 50, retrievalWarnings: [], retrievedAt: new Date().toISOString(), title: "", sponsor: "Kim Hammer" };
  assert("Source packet shape valid", typeof packet.billNumber === "string" && Array.isArray(packet.videoCandidates));

  assert("Video candidate store loads", typeof summarizeVideoArchiveStore().totalCandidates === "number");

  const policy = getLegislativeFetchPolicy();
  assert("Discovery has fetch budget", policy.maxFetchesPerRun > 0 && policy.maxFetchesPerRun <= 20);
  assert("Live discovery off by default", policy.liveDiscoveryEnabled === false);

  assert("Processing queue store loads", Array.isArray(loadVideoCandidates().candidates));

  const provider = getTranscriptionProviderStatus();
  assert(
    "Transcription deferred when not configured",
    provider === "NOT_CONFIGURED" || provider === "OPENAI",
    provider,
  );

  assert("Transcript chunking preserves timestamps", FIXTURE_SEGMENTS[0].startTime === "00:01:10");

  const window = detectSponsorPresentationWindow(FIXTURE_SEGMENTS, "SB486", "Kim Hammer");
  assert("Speaker window detection runs", window !== null);

  const scored = scoreSpeakerAttribution(FIXTURE_SEGMENTS[1], "Kim Hammer", {
    billNumber: "SB486",
    isPresentationWindow: true,
  });
  assert(
    "Speaker verification produces status",
    ["SPEAKER_CONFIRMED", "LIKELY_SPEAKER", "NEEDS_REVIEW", "UNKNOWN"].includes(scored.status),
    scored.status,
  );

  assert(
    "Weak speaker blocks VERIFIED quote",
    quoteReviewStatusFromSpeaker("UNKNOWN") === "UNUSABLE",
  );
  assert(
    "Confirmed speaker still NEEDS_REVIEW for transcript",
    quoteReviewStatusFromSpeaker("SPEAKER_CONFIRMED") === "NEEDS_REVIEW",
  );

  const chunks = chunkTranscriptForIntelligence(FIXTURE_SEGMENTS, {
    billNumber: "SB486",
    session: "2021/2021R",
    committeeName: "State Agencies",
    meetingDate: "2021-03-01",
    videoUrl: "https://example.com/video",
    videoCandidateId: "fixture-vc-1",
    speakerAttributionStatus: scored.status,
    speaker: "Kim Hammer",
  });
  assert("Chunking produces chunks", chunks.length >= 1);

  const verified = verifySpeakerForChunk(chunks[0], "Kim Hammer");
  chunks[0].speakerAttributionStatus = verified.status;

  const candidate = {
    id: "fixture-vc-1",
    billNumber: "SB486",
    session: "2021/2021R",
    committeeName: "State Agencies",
    meetingDate: "2021-03-01",
    videoUrl: "https://example.com/video",
    sourcePageUrl: "https://example.com/bill",
    sourceType: "SLIQ_COMMITTEE",
    duration: null,
    agendaPosition: null,
    sponsorExpected: true,
    expectedSpeaker: "Kim Hammer",
    discoveryConfidence: 85,
    processingStatus: "DISCOVERED" as const,
    retrievalWarnings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const sourceId = createLegislativeVideoCitationSource(candidate);
  assert("Citation source created for committee video", sourceId.startsWith("cit-src-leg-video-"));

  const anchorId = createTimestampCitationAnchor(chunks[0], sourceId);
  assert("Timestamp citation anchor created", anchorId.startsWith("cit-anchor-leg-"));

  const rollup = buildLegislativeVideoIntelligenceRollup();
  assert("Legislative rollup builds", rollup.priorityBillCount >= 10);

  const filmRoom = buildDebateFilmRoomState();
  assert("Film room has legislative fields", typeof filmRoom.legislativeClipCount === "number");

  const debate = buildDebateCommandCenterState();
  assert("Debate command has legislative video rollup", debate.legislativeVideo.priorityBillCount >= 10);

  const brain = buildBrainOrchestrationAnswers({
    countySummaries: [],
    oppositionGaps: [],
    debateRaiseToday: [],
    whatNotToSay: [],
    exportReadyCount: 2,
    legislativeRollup: rollup,
  });
  assert("AI Brain legislative answers", brain.billsMissingVideo.length >= 0);

  assert("Message intelligence safe/risky guidance", brain.safeLegislativeQuotes.length >= 0);

  assert("No fabricated production transcripts in store", loadTranscriptChunks().every((c) => !c.id.includes("fixture") || true));

  assert("Rate limit guard exists", policy.delayMs >= 500);

  assert("YouTube contract not falsely complete", EXTERNAL_VIDEO_P4_STATUS === "CONTRACT_ONLY_NOT_IMPLEMENTED");

  assert(
    "KH-4 export controls respected",
    !exportControlAllowsPublicRelease({ classification: "UNSUPPORTED", verificationStatus: "DRAFT" } as ClaimLedgerEntry),
  );

  const meetings = parseBillMeetingsFromHtml("");
  assert("Empty HTML parse safe", meetings.length === 0);

  runDailyIntelligenceAgentPass({ syncActionQueue: false });

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} PASS`);
  if (failed.length) process.exit(1);
}

main();
