/**
 * Governed brief governance validation — no publishable defaults, shell counties blocked.
 */
import { composeGovernedBriefRegistry } from "../src/lib/intelligence/briefs/briefRegistry";
import {
  generateAllCountyBriefBundles,
  summarizeCountyPublicBriefReadiness,
} from "../src/lib/intelligence/briefs/countyPublicBriefGenerator";
import { composeIntelligenceCommandCenter } from "../src/lib/intelligence/commandCenter/intelligenceCommandCenter";
import { getLlmBriefDraftContract, buildLlmBriefDraftRequest } from "../src/lib/intelligence/briefs/llmBriefDraftContracts";
import { GOVERNED_BRIEF_DEFAULT_LABELS } from "../src/lib/intelligence/briefs/governedBriefTypes";

function main() {
  const registry = composeGovernedBriefRegistry({ syncActionQueue: false });
  const bundles = generateAllCountyBriefBundles();
  const rollup = summarizeCountyPublicBriefReadiness(bundles);
  const snapshot = composeIntelligenceCommandCenter();
  const llm = getLlmBriefDraftContract();

  const allBriefs = [
    registry.oppositionDebate.opposition,
    registry.oppositionDebate.debatePrep,
    registry.oppositionDebate.rapidResponse,
    registry.candidateMessageBrief,
    registry.weeklyIntelligenceBrief,
    ...bundles.map((b) => b.publicMessagingBrief),
  ];

  const checks: Array<[string, boolean]> = [
    ["75 counties classified", bundles.length === 75],
    ["0 PUBLIC_BRIEF_READY unless evidence supports", rollup.PUBLIC_BRIEF_READY === 0],
    ["shell counties cannot be PUBLIC_BRIEF_READY", !bundles.some((b) => b.publicBriefReadiness === "PUBLIC_BRIEF_READY" && b.publicMessagingBrief.tags.includes("SHELL_ONLY"))],
    ["NSI-16 weekly packet live", snapshot.weeklyPacket.status === "live"],
    ["weekly packet has priorities", (snapshot.weeklyPacket.topIntelligencePriorities?.length ?? 0) >= 1],
    ["no placeholder weekly message only", snapshot.weeklyPacket.status !== "placeholder"],
    ["all briefs NOT_PUBLISHABLE", allBriefs.every((b) => b.publishabilityStatus === "NOT_PUBLISHABLE")],
    ["all briefs DRAFT_INTERNAL or NEEDS_RESEARCH", allBriefs.every((b) => b.status === "DRAFT_INTERNAL" || b.status === "NEEDS_RESEARCH")],
    ["governance labels present", allBriefs.every((b) => GOVERNED_BRIEF_DEFAULT_LABELS.every((l) => b.governanceLabels.includes(l)))],
    ["LLM live disabled by default", llm.liveLlmEnabled === false],
    ["LLM no publish gate", llm.noPublishGate === true],
    ["LLM no send gate", llm.noSendGate === true],
    ["LLM draft routes to queue", buildLlmBriefDraftRequest(allBriefs[0]).routeToQueue === "/admin/intelligence/llm-review-queue"],
    ["unsupported claims flagged in opposition", registry.oppositionDebate.opposition.researchGaps.some((g) => g.includes("retrieval") || g.includes("0/7"))],
    ["brain answers populated", registry.brainAnswers.whatCanWeSaySafely.length >= 1],
    ["message intelligence guidance", registry.messageGuidance.length >= 1],
    ["top research gaps", registry.topResearchGapsBlockingPublicMessaging.length >= 5],
  ];

  console.log("Governed brief governance validation");
  let fail = 0;
  for (const [label, ok] of checks) {
    console.log(`  ${ok ? "OK" : "FAIL"} — ${label}`);
    if (!ok) fail++;
  }

  if (fail > 0) {
    console.error(`FAIL — ${fail} check(s)`);
    process.exit(1);
  }
  console.log("OK — governed brief governance");
}

main();
