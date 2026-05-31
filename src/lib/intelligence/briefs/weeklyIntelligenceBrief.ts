import type { DailyIntelligencePacket } from "@/lib/intelligence/intelligenceAgentOrchestrator";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import { summarizeCampaignIntelligenceState } from "@/lib/intelligence/intelligenceBrainCoordinator";
import type { GovernedBrief, WeeklyIntelligencePacket } from "./governedBriefTypes";
import { clampBriefConfidence, defaultGovernedBriefFields } from "./governedBriefTypes";
import { generateAllCountyBriefBundles, summarizeCountyPublicBriefReadiness } from "./countyPublicBriefGenerator";

export function buildWeeklyIntelligencePacket(
  dailyPacket: DailyIntelligencePacket,
  repoRoot?: string,
): WeeklyIntelligencePacket {
  const evidence = loadKimHammerEvidenceIndex(repoRoot);
  const debate = buildDebateCommandCenterState();
  const countyBundles = generateAllCountyBriefBundles();
  const countyRollup = summarizeCountyPublicBriefReadiness(countyBundles);
  const overall = debate.readinessScores.find((s) => s.id === "overall");

  const debateMovement = debate.readinessScores
    .filter((s) => s.id !== "overall")
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((s) => `${s.label}: ${s.score}/100 (${s.scoreConfidence}) — ${s.raiseScoreToday[0] ?? "drill"}`);

  return {
    packetId: `weekly-${dailyPacket.runId}`,
    generatedAt: new Date().toISOString(),
    generatedBy: "intelligenceAgentOrchestrator + weeklyIntelligenceBrief.v1",
    status: "live",
    publicationSafety: "NON_PUBLISHABLE",
    humanReviewRequired: true,
    sourceSystemsUsed: [
      "NSI-7 brain coordinator",
      "NSI-12 LLM review queue",
      "NSI-14 scenario simulation",
      "NSI-15 human action queue",
      "NSI-16 command center",
      "NSI-17 institutional memory",
      "KH-4 evidence index",
      "County public brief generator",
      "Debate command center",
    ],
    topIntelligencePriorities: dailyPacket.topPriorities.map((p) => `${p.title}: ${p.summary}`),
    countyRisks: [
      `${countyRollup.SHELL_ONLY}/75 counties SHELL_ONLY for public briefs`,
      `${countyRollup.PUBLIC_BRIEF_READY} counties PUBLIC_BRIEF_READY (expect 0 until evidence supports)`,
      ...dailyPacket.countyWorkbenchPriorities.map((p) => p.summary),
    ],
    debateReadinessMovement: [
      `Overall: ${overall?.score ?? dailyPacket.debateReadinessOverall}/100 — ${overall?.whyThisScore ?? "computed"}`,
      ...debateMovement,
      debate.filmRoom.archiveHonestyNote,
    ],
    oppositionResearchGaps: [
      ...Object.entries(evidence.metrics.taskStatusCounts)
        .filter(([k]) => k !== "COMPLETE")
        .map(([k, v]) => `Retrieval task ${k}: ${v}`),
      ...dailyPacket.researchGapsToClose.slice(0, 5),
    ],
    recommendedHumanActions: [
      ...dailyPacket.humanActionsNeeded,
      ...dailyPacket.next24HourActions,
    ],
    unresolvedClaimRisks: [
      `${evidence.metrics.reviewNeededClaims} claims need review`,
      `${evidence.metrics.blockedClaims} blocked claims`,
      ...dailyPacket.risksAndGovernanceWarnings.slice(0, 4),
    ],
    messagingOpportunities: dailyPacket.draftingOpportunities.map(
      (d) => `${d} — INTERNAL ONLY until review`,
    ),
    governanceWarnings: [
      ...dailyPacket.governanceWarnings,
      "NOT_PUBLIC_CONTENT — weekly packet is internal operator artifact",
      "No auto-send · No auto-publish · No goal mutation",
    ],
    notVerifiedNeedsHumanReview: [
      "All county registration goals unless verified in CountyCampaignStats admin",
      "All opposition claims unless export-ready + citation locker approved",
      "All debate messaging until candidate prep sign-off",
      "Proxy vote targets are NOT registration goals",
      ...dailyPacket.researchGapsToClose.slice(0, 3).map((g) => `Unverified: ${g}`),
    ],
    confidenceSummary: dailyPacket.confidenceSummary,
    relatedHrefs: [
      "/admin/intelligence",
      "/admin/intelligence/command-center",
      "/admin/intelligence/morning-brief",
      "/admin/intelligence/llm-review-queue",
      "/admin/intelligence/kim-hammer/evidence-command",
      "/admin/intelligence/debate-command",
    ],
  };
}

export function generateWeeklyIntelligenceGovernedBrief(
  dailyPacket: DailyIntelligencePacket,
  repoRoot?: string,
): GovernedBrief {
  const weekly = buildWeeklyIntelligencePacket(dailyPacket, repoRoot);
  const base = defaultGovernedBriefFields("weeklyIntelligenceBrief.v1");

  return {
    ...base,
    briefId: weekly.packetId,
    title: "Weekly Intelligence Brief (INTERNAL)",
    briefType: "weekly_intelligence",
    tags: ["weekly", "NSI-16", "intelligence"],
    audience: "Leadership + operator team",
    intendedUse: "Weekly internal intelligence synthesis — not public release",
    evidenceSummary: [
      ...weekly.topIntelligencePriorities.slice(0, 5),
      weekly.confidenceSummary,
    ],
    verifiedClaims: weekly.topIntelligencePriorities.slice(0, 3).map((claim) => ({
      claim,
      tier: "verified" as const,
      sourceAnchors: weekly.sourceSystemsUsed,
    })),
    unverifiedClaims: weekly.notVerifiedNeedsHumanReview.slice(0, 5).map((claim) => ({
      claim,
      tier: "unverified" as const,
      sourceAnchors: ["orchestrator-audit"],
    })),
    inferredClaims: weekly.messagingOpportunities.slice(0, 3).map((claim) => ({
      claim,
      tier: "inferred" as const,
      sourceAnchors: ["message-intelligence-layer"],
    })),
    researchGaps: weekly.oppositionResearchGaps,
    recommendedMessaging: weekly.messagingOpportunities,
    riskWarnings: weekly.governanceWarnings,
    humanReviewChecklist: [
      "Verify every county risk against source systems",
      "Confirm opposition gaps before messaging",
      "No public adaptation without comms sign-off",
    ],
    sourceAnchors: weekly.sourceSystemsUsed,
    confidenceScore: clampBriefConfidence(50),
    confidenceBasis: weekly.confidenceSummary,
  };
}

export function generateCandidateMessageBrief(dailyPacket: DailyIntelligencePacket): GovernedBrief {
  const brain = summarizeCampaignIntelligenceState();
  const base = defaultGovernedBriefFields("weeklyIntelligenceBrief.v1");

  return {
    ...base,
    briefId: `candidate-message-${dailyPacket.runId}`,
    title: "Candidate Message Brief (INTERNAL)",
    briefType: "candidate_message",
    tags: ["Kelly", "messaging", "candidate"],
    audience: "Candidate + comms + debate prep",
    intendedUse: "Internal message guidance — not public copy",
    evidenceSummary: [
      dailyPacket.confidenceSummary,
      `${dailyPacket.brainAnswers.whatCanWeSaySafely.length} safe internal themes identified`,
    ],
    verifiedClaims: dailyPacket.brainAnswers.whatCanWeSaySafely.map((claim) => ({
      claim,
      tier: "verified" as const,
      sourceAnchors: ["intelligenceAgentOrchestrator"],
    })),
    unverifiedClaims: dailyPacket.brainAnswers.suspectNeedProof.map((claim) => ({
      claim,
      tier: "unverified" as const,
      sourceAnchors: ["research-gaps"],
    })),
    inferredClaims: dailyPacket.brainAnswers.kellySayThisWeek.map((claim) => ({
      claim,
      tier: "inferred" as const,
      sourceAnchors: ["brain-orchestration"],
    })),
    researchGaps: dailyPacket.topResearchGapsBlockingPublicMessaging,
    recommendedMessaging: dailyPacket.brainAnswers.kellySayThisWeek,
    riskWarnings: [
      ...dailyPacket.brainAnswers.kellyAvoidThisWeek,
      ...brain.whatNotToSayToday.slice(0, 3),
      "NOT_PUBLISHABLE — candidate copy requires human approval",
    ],
    humanReviewChecklist: [
      "Candidate prep sign-off",
      "Citation check for every factual claim",
      "What-not-to-say review",
    ],
    sourceAnchors: ["intelligenceBrainCoordinator", "intelligenceAgentOrchestrator"],
    confidenceScore: clampBriefConfidence(dailyPacket.messageIntelligenceReadinessScore),
    confidenceBasis: "Orchestrator message intelligence score",
  };
}
