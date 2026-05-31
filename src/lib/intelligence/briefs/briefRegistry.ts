import { generateAllCountyBriefBundles, summarizeCountyPublicBriefReadiness } from "./countyPublicBriefGenerator";
import { generateOppositionDebateBriefPack } from "./oppositionDebateBriefGenerator";
import { buildWeeklyIntelligencePacket, generateCandidateMessageBrief, generateWeeklyIntelligenceGovernedBrief } from "./weeklyIntelligenceBrief";
import { buildMessageIntelligenceFromBrief, buildBrainOrchestrationAnswers } from "./messageIntelligenceLayer";
import { runDailyIntelligenceAgentPass } from "@/lib/intelligence/intelligenceAgentOrchestrator";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import type { GovernedBrief, MessageIntelligenceGuidance, WeeklyIntelligencePacket } from "./governedBriefTypes";
import { getLlmBriefDraftContract } from "./llmBriefDraftContracts";

export type GovernedBriefRegistry = {
  generatedAt: string;
  countyBundles: ReturnType<typeof generateAllCountyBriefBundles>;
  countyPublicBriefRollup: ReturnType<typeof summarizeCountyPublicBriefReadiness>;
  oppositionDebate: ReturnType<typeof generateOppositionDebateBriefPack>;
  weeklyPacket: WeeklyIntelligencePacket;
  dailyPacket: ReturnType<typeof runDailyIntelligenceAgentPass>;
  messageGuidance: MessageIntelligenceGuidance[];
  brainAnswers: ReturnType<typeof buildBrainOrchestrationAnswers>;
  llmContract: ReturnType<typeof getLlmBriefDraftContract>;
  topResearchGapsBlockingPublicMessaging: string[];
  candidateMessageBrief: GovernedBrief;
  weeklyIntelligenceBrief: GovernedBrief;
};

export function composeGovernedBriefRegistry(options?: {
  repoRoot?: string;
  syncActionQueue?: boolean;
}): GovernedBriefRegistry {
  const dailyPacket = runDailyIntelligenceAgentPass({
    repoRoot: options?.repoRoot,
    syncActionQueue: options?.syncActionQueue ?? false,
  });
  const countyBundles = generateAllCountyBriefBundles();
  const oppositionDebate = generateOppositionDebateBriefPack();
  const weeklyPacket = buildWeeklyIntelligencePacket(dailyPacket, options?.repoRoot);
  const evidence = loadKimHammerEvidenceIndex(options?.repoRoot);
  const debate = buildDebateCommandCenterState();
  const brain = summarizeCampaignIntelligenceState(options?.repoRoot);
  const overall = debate.readinessScores.find((s) => s.id === "overall");

  const keyBriefs: GovernedBrief[] = [
    oppositionDebate.opposition,
    oppositionDebate.debatePrep,
    oppositionDebate.rapidResponse,
    ...countyBundles.slice(0, 6).map((b) => b.publicMessagingBrief),
  ];

  const messageGuidance = keyBriefs.map(buildMessageIntelligenceFromBrief);

  const brainAnswers = buildBrainOrchestrationAnswers({
    countySummaries: countyBundles.map((b) => ({
      name: b.countyName,
      readiness: b.publicBriefReadiness,
    })),
    oppositionGaps: weeklyPacket.oppositionResearchGaps,
    debateRaiseToday: overall?.raiseScoreToday ?? [],
    whatNotToSay: brain.whatNotToSayToday,
    exportReadyCount: evidence.metrics.exportReadyClaims,
  });

  const topResearchGapsBlockingPublicMessaging = [
    ...weeklyPacket.oppositionResearchGaps,
    ...weeklyPacket.notVerifiedNeedsHumanReview,
    `${countyBundles.filter((b) => b.publicBriefReadiness === "SHELL_ONLY").length} shell counties block public messaging`,
  ].slice(0, 10);

  return {
    generatedAt: new Date().toISOString(),
    countyBundles,
    countyPublicBriefRollup: summarizeCountyPublicBriefReadiness(countyBundles),
    oppositionDebate,
    weeklyPacket,
    dailyPacket,
    messageGuidance,
    brainAnswers,
    llmContract: getLlmBriefDraftContract(),
    topResearchGapsBlockingPublicMessaging,
    candidateMessageBrief: generateCandidateMessageBrief(dailyPacket),
    weeklyIntelligenceBrief: generateWeeklyIntelligenceGovernedBrief(dailyPacket, options?.repoRoot),
  };
}
