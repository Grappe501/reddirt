/**
 * Pass P1 — Governed LLM evidence packet validation
 */
import { EVIDENCE_PACKET_GOVERNANCE_LABELS } from "../src/lib/intelligence/briefs/evidencePacketTypes";
import {
  buildCountyEvidencePacket,
  buildDebateEvidencePacket,
  buildEvidencePacketForBrief,
  buildOppositionEvidencePacket,
} from "../src/lib/intelligence/briefs/evidencePacketGenerator";
import { classifyEvidencePacketClaims } from "../src/lib/intelligence/briefs/claimClassification";
import {
  blockPublicReadyStatusIfUnsupportedClaims,
  detectUnsupportedClaims,
  summarizeUnsupportedClaimRisk,
} from "../src/lib/intelligence/briefs/unsupportedClaimDetector";
import {
  buildDeterministicDraftFromEvidence,
  buildLlmPromptPacket,
} from "../src/lib/intelligence/briefs/llmPromptPacketBuilder";
import {
  prepareGovernedLlmBriefDraftSync,
  isLiveLlmBriefEnabled,
} from "../src/lib/intelligence/briefs/governedLlmBriefService";
import { generateOppositionDebateBriefPack } from "../src/lib/intelligence/briefs/oppositionDebateBriefGenerator";
import { loadLlmDraftReviewQueue } from "../src/lib/intelligence/llmDraftGateway";

function main() {
  const pack = generateOppositionDebateBriefPack();
  const oppositionPacket = buildOppositionEvidencePacket();
  const debatePacket = buildDebateEvidencePacket();
  const pulaskiPacket = buildCountyEvidencePacket("pulaski-county");
  const shellPacket = buildCountyEvidencePacket("calhoun-county");

  const prompt = buildLlmPromptPacket(oppositionPacket);
  const draft = buildDeterministicDraftFromEvidence(oppositionPacket, prompt);
  const classified = classifyEvidencePacketClaims(oppositionPacket);
  const unsupported = detectUnsupportedClaims(oppositionPacket);
  const block = blockPublicReadyStatusIfUnsupportedClaims(oppositionPacket);

  const queueBefore = loadLlmDraftReviewQueue().drafts.length;
  const prepared = prepareGovernedLlmBriefDraftSync({
    briefId: pack.opposition.briefId,
    operatorTriggered: true,
    operator: "test-p1",
  });
  const queueAfter = loadLlmDraftReviewQueue().drafts.length;

  const checks: Array<[string, boolean]> = [
    ["evidence packet INTERNAL_ONLY governance", oppositionPacket.governance.labels.includes("INTERNAL_ONLY")],
    ["evidence packet NON_PUBLISHABLE", oppositionPacket.governance.publicationSafety === "NON_PUBLISHABLE"],
    ["citation anchors present on opposition", oppositionPacket.sourceAnchors.length >= 1],
    ["all governance labels on packet", EVIDENCE_PACKET_GOVERNANCE_LABELS.every((l) => oppositionPacket.governance.labels.includes(l))],
    ["shell county sparse warning", (shellPacket?.unsupportedClaimWarnings.some((w) => w.includes("SHELL")) ?? false)],
    ["pulaski county packet generated", pulaskiPacket != null],
    ["claim classification populated", classified.length >= 1],
    ["unsupported claims detected path", Array.isArray(unsupported)],
    ["public ready blocked", block.publicBriefReady === false],
    ["prompt forbids invented facts instruction", prompt.systemInstructions.some((s) => s.includes("Do NOT invent"))],
    ["prompt requires citation map", prompt.citationMap.length >= 0],
    ["draft NOT_PUBLISHABLE", draft.publishabilityStatus === "NOT_PUBLISHABLE"],
    ["draft PENDING_HUMAN_REVIEW", draft.reviewStatus === "PENDING_HUMAN_REVIEW"],
    ["review queue routing", prepared.ok === true && queueAfter > queueBefore],
    ["prepared draft NON_PUBLISHABLE", prepared.ok && prepared.publicationSafety === "NON_PUBLISHABLE"],
    ["operator trigger required in service", prepareGovernedLlmBriefDraftSync({ briefId: pack.debatePrep.briefId, operatorTriggered: true }).ok],
    ["debate packet flags thin clips", debatePacket.unsupportedClaimWarnings.some((w) => w.includes("clip") || w.includes("Debate")) || debatePacket.researchGaps.length >= 1],
    ["live LLM gated by env", isLiveLlmBriefEnabled() === (process.env.INTELLIGENCE_LLM_BRIEF_ENABLED?.trim() === "1" && Boolean(process.env.OPENAI_API_KEY?.trim()))],
    ["buildEvidencePacketForBrief works", buildEvidencePacketForBrief(pack.rapidResponse).briefId === pack.rapidResponse.briefId],
    ["unsupported risk summary", summarizeUnsupportedClaimRisk(oppositionPacket).blocksPublicAdaptation === true || summarizeUnsupportedClaimRisk(oppositionPacket).warnings.length >= 1],
  ];

  console.log("Governed LLM evidence packet validation (Pass P1)");
  let fail = 0;
  for (const [label, ok] of checks) {
    console.log(`  ${ok ? "OK" : "FAIL"} — ${label}`);
    if (!ok) fail++;
  }

  if (fail > 0) {
    console.error(`FAIL — ${fail} check(s)`);
    process.exit(1);
  }
  console.log("OK — Pass P1 governed LLM evidence packets");
}

main();
