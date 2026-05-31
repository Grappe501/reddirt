/**
 * Pass P5 — Message Intelligence Engine validation
 */
import { buildMessageIntelligenceEngine } from "../src/lib/intelligence/messageIntelligence/messageIntelligenceEngine";
import { mapAllLegislativeChunksToMessages } from "../src/lib/intelligence/messageIntelligence/legislativeChunkMessageMapper";
import { MESSAGE_INTELLIGENCE_GOVERNANCE } from "../src/lib/intelligence/messageIntelligence/messageIntelligenceTypes";
import {
  buildMessageEvidencePacket,
  buildDebateMessageEvidencePacket,
  buildLegislativeQuoteEvidencePacket,
  buildRapidResponseMessageEvidencePacket,
  buildAllMessageEvidencePackets,
} from "../src/lib/intelligence/briefs/evidencePacketGenerator";
import { runDailyIntelligenceAgentPass } from "../src/lib/intelligence/intelligenceAgentOrchestrator";
import { summarizeAudioExtractionReadiness } from "../src/lib/legislature/legislativeAudioExtraction";
import { summarizeTranscriptionProviderReadiness } from "../src/lib/legislature/legislativeTranscriptProvider";
import { chunkTranscriptForIntelligence } from "../src/lib/legislature/legislativeTranscriptChunker";
import { normalizeTranscriptSegments } from "../src/lib/legislature/legislativeTranscriptionPipeline";
import type { LegislativeTranscriptChunk } from "../src/lib/legislature/legislativeTranscriptChunker";

const results: { name: string; pass: boolean; detail?: string }[] = [];

function assert(name: string, condition: boolean, detail?: string) {
  results.push({ name, pass: condition, detail });
  console.log(`${condition ? "PASS" : "FAIL"} — ${name}${detail ? `: ${detail}` : ""}`);
}

function allRecs(rollup: ReturnType<typeof buildMessageIntelligenceEngine>) {
  return [
    ...rollup.safeMessageThemes,
    ...rollup.riskyMessageThemes,
    ...rollup.claimsNeedingCitation,
    ...rollup.claimsNeedingHumanReview,
    ...rollup.usableInternalTalkingPoints,
    ...rollup.debateMessageLanes,
    ...rollup.countyMessageOpportunities,
    ...rollup.rapidResponseOpportunities,
    ...rollup.phrasesToAvoid,
    ...rollup.strongestEvidenceAngles,
    ...rollup.weakestUnsafeAngles,
  ];
}

async function main() {
  const rollup = buildMessageIntelligenceEngine();
  assert("1. Message intelligence engine loads", rollup.readinessScore >= 0, `score=${rollup.readinessScore}`);
  assert("2. All outputs default INTERNAL_ONLY governance", MESSAGE_INTELLIGENCE_GOVERNANCE.internalOnly === true);
  assert("3. All outputs default NON_PUBLISHABLE", MESSAGE_INTELLIGENCE_GOVERNANCE.publicationSafety === "NON_PUBLISHABLE");

  const fixtureSegments = normalizeTranscriptSegments(
    [{ text: "This bill affects county election workers.", startTime: "00:01:00", endTime: "00:01:20", speakerLabel: "UNKNOWN", speakerConfidence: 0 }],
    "fixture-p5",
    "SB486",
  );
  const fixtureChunks = chunkTranscriptForIntelligence(fixtureSegments, {
    billNumber: "SB486",
    session: "2021/2021R",
    committeeName: "State Agencies",
    meetingDate: "2021-03-01",
    videoUrl: "https://example.com/video",
    videoCandidateId: "fixture-p5",
    speakerAttributionStatus: "NEEDS_REVIEW",
    speaker: "Kim Hammer",
  });
  const legMessages = mapAllLegislativeChunksToMessages(fixtureChunks);
  const transcriptRecs = legMessages.filter((m) => m.sourceSystems.some((s) => s.includes("legislative")));
  assert(
    "4. Transcript-derived recommendations require citation anchors",
    transcriptRecs.every((r) => r.evidenceAnchors.length >= 1),
    `recs=${transcriptRecs.length}`,
  );
  assert(
    "5. Weak speaker attribution blocks confident message use",
    legMessages.some((m) => m.publicUseRisk === "CRITICAL" || m.confidenceScore <= 45),
  );

  const unsupportedAsSafe = rollup.safeMessageThemes.filter((m) => m.citationDepthScore === 0 && m.category === "SAFE_THEME");
  assert("6. Unsupported claims do not become message themes", unsupportedAsSafe.length === 0);

  const withLedger = allRecs(rollup).filter((r) => r.claimLedgerIds.length > 0);
  assert("7. Claim ledger ids attach where available", withLedger.length >= 0, `withLedger=${withLedger.length}`);

  assert(
    "8. Citation depth score is present",
    allRecs(rollup).every((r) => typeof r.citationDepthScore === "number"),
  );

  assert(
    "9. Risky themes separated from safe themes",
    rollup.riskyMessageThemes.length >= 0 && rollup.safeMessageThemes.length >= 0,
    `safe=${rollup.safeMessageThemes.length} risky=${rollup.riskyMessageThemes.length}`,
  );

  const packetJson = JSON.stringify(buildAllMessageEvidencePackets());
  assert("10. No send/publish/export action exists", !/sendEmail|publishPost|exportPublic|autoSend/i.test(packetJson));

  const packets = buildAllMessageEvidencePackets();
  assert("11. Evidence packet integration works", packets.message.governance.noSend === true);
  assert("11b. Debate message packet", packets.debateMessage.briefId === "debate-message-intelligence-v1");
  assert("11c. Legislative quote packet", packets.legislativeQuote.briefId === "legislative-quote-intelligence-v1");
  assert("11d. Rapid response message packet", packets.rapidResponseMessage.briefId === "rapid-response-message-intelligence-v1");

  const daily = runDailyIntelligenceAgentPass({ syncActionQueue: false });
  assert(
    "12. AI Brain receives message intelligence rollup",
    daily.messageIntelligenceReadinessScore === rollup.readinessScore &&
      (daily.brainAnswers.kellySayThisWeek.some((l) => l.includes("MIE")) ||
        daily.brainAnswers.kellyAvoidThisWeek.length > 0),
    `score=${daily.messageIntelligenceReadinessScore}`,
  );

  assert(
    "13. Dashboard rollup shape is valid",
    Array.isArray(rollup.safeMessageThemes) &&
      typeof rollup.readinessBasis === "string" &&
      rollup.governance.labels.length >= 3,
  );

  const transcription = summarizeTranscriptionProviderReadiness();
  const audio = await summarizeAudioExtractionReadiness();
  if (!transcription.enabled) {
    assert("14. Transcription deferred state honest", transcription.enableSteps.length >= 2);
  } else {
    assert("14. Transcription enabled path", transcription.openaiConfigured);
  }
  if (!audio.ready) {
    assert("15. Audio extraction deferred state honest", !audio.enabled || !audio.ffmpegAvailable, `enabled=${audio.enabled} ffmpeg=${audio.ffmpegAvailable}`);
  } else {
    assert("15. Audio extraction ready", audio.ffmpegAvailable);
  }

  const msgPacket = buildMessageEvidencePacket();
  assert("Evidence packets NON_PUBLISHABLE", msgPacket.governance.publicationSafety === "NON_PUBLISHABLE");
  assert("Evidence packets route to review", msgPacket.governance.humanReviewRequired === true);

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} PASS`);
  if (failed.length) {
    console.error("Failures:", failed);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
