import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import { runDailyIntelligenceAgentPass } from "@/lib/intelligence/intelligenceAgentOrchestrator";
import type { GovernedBrief } from "./governedBriefTypes";
import { extractClaimCandidatesFromBrief } from "./claimClassification";
import type {
  EvidencePacket,
  EvidencePacketCitationAnchor,
  EvidencePacketGenerationContext,
  EvidencePacketResearchGap,
  EvidencePacketSource,
} from "./evidencePacketTypes";
import {
  clampEvidenceConfidence,
  defaultEvidencePacketGovernance,
} from "./evidencePacketTypes";
import { generateCountyBriefBundle } from "./countyPublicBriefGenerator";
import {
  generateDebatePrepBrief,
  generateOppositionDebateBriefPack,
  generateOppositionResearchBrief,
  generateRapidResponsePrepBrief,
} from "./oppositionDebateBriefGenerator";
import {
  generateWeeklyIntelligenceGovernedBrief,
} from "./weeklyIntelligenceBrief";
import { buildMessageIntelligenceEngine } from "@/lib/intelligence/messageIntelligence/messageIntelligenceEngine";
import type { MessageIntelligenceRollup } from "@/lib/intelligence/messageIntelligence/messageIntelligenceTypes";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";

function buildPacketId(briefId: string): string {
  return `ep-${briefId}-${Date.now().toString(36)}`;
}

function anchorsFromBrief(brief: GovernedBrief): EvidencePacketCitationAnchor[] {
  return brief.sourceAnchors.map((anchor, i) => ({
    anchorId: `${brief.briefId}-src-${i}`,
    label: anchor,
    sourceSystem: anchor.includes("/") ? "file" : "registry",
    requiredForPublicUse: true,
  }));
}

function sourcesFromBrief(brief: GovernedBrief): EvidencePacketSource[] {
  return brief.sourceAnchors.map((anchor, i) => ({
    sourceId: `${brief.briefId}-sys-${i}`,
    system: brief.generatedBy,
    anchor,
    description: `Source anchor from ${brief.briefType}`,
    confidence: brief.verifiedClaims.length > 0 ? "MEDIUM" : "LOW",
    staleRisk: brief.status === "NEEDS_RESEARCH",
  }));
}

function gapsFromBrief(brief: GovernedBrief): EvidencePacketResearchGap[] {
  return brief.researchGaps.map((gap, i) => ({
    gapId: `${brief.briefId}-gap-${i}`,
    description: gap,
    severity: gap.toLowerCase().includes("shell") || gap.includes("0/7") ? "CRITICAL" : "HIGH",
    blocksPublicUse: gap.includes("shell") || gap.includes("Canonical") || gap.includes("0/7"),
  }));
}

function computeRiskLevel(
  brief: GovernedBrief,
  ctx: EvidencePacketGenerationContext,
): EvidencePacket["riskLevel"] {
  if (ctx.shellCounty) return "CRITICAL";
  if (ctx.oppositionArchiveThin && brief.briefType === "opposition_research") return "HIGH";
  if ((ctx.debateClipCount ?? 0) < 2 && brief.briefType === "debate_prep") return "HIGH";
  if (brief.riskWarnings.some((w) => w.includes("HIGH RISK"))) return "HIGH";
  if (brief.confidenceScore < 40) return "HIGH";
  if (brief.confidenceScore < 60) return "MEDIUM";
  return "LOW";
}

function computeConfidence(brief: GovernedBrief, ctx: EvidencePacketGenerationContext): number {
  let score = brief.confidenceScore;
  if (ctx.shellCounty) score -= 25;
  if (!ctx.canonicalGoalVerified && brief.briefType.includes("county")) score -= 15;
  if (ctx.oppositionArchiveThin) score -= 10;
  if ((ctx.debateClipCount ?? 0) < 2) score -= 8;
  if ((ctx.exportReadyClaimCount ?? 0) < 2) score -= 5;
  if (brief.sourceAnchors.length === 0) score -= 20;
  return clampEvidenceConfidence(score);
}

function buildCorePacket(
  brief: GovernedBrief,
  ctx: EvidencePacketGenerationContext,
  overrides?: Partial<Pick<EvidencePacket, "county" | "opponent" | "subject">>,
): EvidencePacket {
  const candidates = extractClaimCandidatesFromBrief(brief);
  const verified = candidates.filter((c) => c.tierHint === "verified");
  const inferred = candidates.filter((c) => c.tierHint === "inferred" || c.tierHint === "unverified");

  const unsupportedWarnings = [
    ...brief.riskWarnings,
    ...(brief.sourceAnchors.length === 0 ? ["No source anchors on brief — evidence packet sparse"] : []),
    ...(ctx.shellCounty ? ["SHELL_ONLY county — limited evidence for messaging"] : []),
    ...(ctx.canonicalGoalVerified === false ? ["Canonical registration goal unverified"] : []),
  ];

  const operatorInstructions = [
    ...brief.humanReviewChecklist,
    "Use only evidence in this packet — do not invent facts",
    "Route all LLM output to review queue — NON_PUBLISHABLE until human approval",
    "Verify every claim in claim ledger before internal or public adaptation",
  ];

  return {
    id: buildPacketId(brief.briefId),
    briefId: brief.briefId,
    briefType: brief.briefType,
    title: brief.title,
    subject: overrides?.subject ?? brief.title,
    county: overrides?.county ?? brief.tags.find((t) => t.endsWith("-county")) ?? null,
    opponent: overrides?.opponent ?? (brief.briefType === "opposition_research" ? "kim-hammer" : null),
    topicTags: brief.tags,
    intendedUse: brief.intendedUse,
    generatedAt: new Date().toISOString(),
    generatedBy: "evidencePacketGenerator.v1",
    sourceSystems: [brief.generatedBy, ...brief.sourceAnchors.slice(0, 3)],
    evidenceSummary: brief.evidenceSummary,
    sourceAnchors: anchorsFromBrief(brief),
    sources: sourcesFromBrief(brief),
    verifiedClaimCandidates: verified,
    inferredClaimCandidates: inferred,
    unsupportedClaimWarnings: unsupportedWarnings,
    researchGaps: gapsFromBrief(brief),
    governance: defaultEvidencePacketGovernance(),
    confidenceScore: computeConfidence(brief, ctx),
    riskLevel: computeRiskLevel(brief, ctx),
    operatorInstructions,
    generationContext: ctx,
  };
}

function oppositionContext(): EvidencePacketGenerationContext {
  const evidence = loadKimHammerEvidenceIndex();
  const debate = buildDebateCommandCenterState();
  return {
    oppositionArchiveThin:
      evidence.metrics.retrievalTasks > 0 &&
      (evidence.metrics.taskStatusCounts.COMPLETE ?? 0) === 0,
    debateClipCount: debate.filmRoom.directClipCount,
    exportReadyClaimCount: evidence.metrics.exportReadyClaims,
  };
}

export function buildEvidencePacketForBrief(
  brief: GovernedBrief,
  context?: EvidencePacketGenerationContext,
): EvidencePacket {
  const ctx = { ...oppositionContext(), ...context };
  return buildCorePacket(brief, ctx);
}

export function buildCountyEvidencePacket(countySlug: string): EvidencePacket | null {
  const registrySlug = countySlug.endsWith("-county") ? countySlug : `${countySlug}-county`;
  const bundle = generateCountyBriefBundle(registrySlug);
  if (!bundle) return null;

  const ctx: EvidencePacketGenerationContext = {
    countyReadiness: bundle.publicBriefReadiness,
    shellCounty: bundle.publicBriefReadiness === "SHELL_ONLY",
    canonicalGoalVerified: bundle.publicMessagingBrief.verifiedClaims.some((c) =>
      c.claim.includes("Canonical registration goal"),
    ),
    ...oppositionContext(),
  };

  return buildCorePacket(bundle.publicMessagingBrief, ctx, {
    county: registrySlug,
    subject: `${bundle.countyName} county messaging intelligence`,
  });
}

export function buildOppositionEvidencePacket(opponentId = "kim-hammer"): EvidencePacket {
  const brief = generateOppositionResearchBrief();
  const ctx: EvidencePacketGenerationContext = {
    oppositionArchiveThin: true,
    ...oppositionContext(),
  };
  return buildCorePacket(brief, ctx, { opponent: opponentId, subject: "Kim Hammer opposition research" });
}

export function buildDebateEvidencePacket(): EvidencePacket {
  const brief = generateDebatePrepBrief();
  const debate = buildDebateCommandCenterState();
  const ctx: EvidencePacketGenerationContext = {
    debateClipCount: debate.filmRoom.directClipCount,
    ...oppositionContext(),
  };
  return buildCorePacket(brief, ctx, { subject: "Debate preparation intelligence" });
}

export function buildRapidResponseEvidencePacket(topicOrOpponent = "kim-hammer"): EvidencePacket {
  const brief = generateRapidResponsePrepBrief();
  return buildCorePacket(brief, oppositionContext(), {
    opponent: topicOrOpponent,
    subject: "Rapid response readiness",
  });
}

export function buildWeeklyIntelligenceEvidencePacket(repoRoot?: string): EvidencePacket {
  const daily = runDailyIntelligenceAgentPass({ repoRoot, syncActionQueue: false });
  const brief = generateWeeklyIntelligenceGovernedBrief(daily, repoRoot);
  return buildCorePacket(brief, {
    ...oppositionContext(),
    orchestratorRunId: daily.runId,
  }, { subject: "Weekly intelligence synthesis" });
}

export function resolveBriefById(briefId: string, repoRoot?: string): GovernedBrief | null {
  const pack = generateOppositionDebateBriefPack();
  const daily = runDailyIntelligenceAgentPass({ repoRoot, syncActionQueue: false });
  const known: GovernedBrief[] = [
    pack.opposition,
    pack.debatePrep,
    pack.rapidResponse,
    generateWeeklyIntelligenceGovernedBrief(daily, repoRoot),
  ];

  const countyMatch = briefId.match(/^county-pub-(.+)$/);
  if (countyMatch) {
    const bundle = generateCountyBriefBundle(`${countyMatch[1]}-county`);
    return bundle?.publicMessagingBrief ?? null;
  }

  return known.find((b) => b.briefId === briefId) ?? null;
}

export function buildEvidencePacketByBriefId(
  briefId: string,
  repoRoot?: string,
): EvidencePacket | null {
  if (briefId === "opposition-kim-hammer-v1") return buildOppositionEvidencePacket();
  if (briefId === "debate-prep-v1") return buildDebateEvidencePacket();
  if (briefId === "rapid-response-prep-v1") return buildRapidResponseEvidencePacket();
  if (briefId === "message-intelligence-v1") return buildMessageEvidencePacket(repoRoot);
  if (briefId === "debate-message-intelligence-v1") return buildDebateMessageEvidencePacket(repoRoot);
  if (briefId === "legislative-quote-intelligence-v1") return buildLegislativeQuoteEvidencePacket(repoRoot);
  if (briefId === "rapid-response-message-intelligence-v1") return buildRapidResponseMessageEvidencePacket(repoRoot);
  if (briefId.startsWith("county-pub-")) {
    const short = briefId.replace("county-pub-", "");
    return buildCountyEvidencePacket(`${short}-county`);
  }

  const brief = resolveBriefById(briefId, repoRoot);
  if (!brief) return null;
  return buildEvidencePacketForBrief(brief);
}

function messageIntelToEvidencePacket(
  rollup: MessageIntelligenceRollup,
  briefId: string,
  briefType: string,
  title: string,
  subject: string,
  recommendations: MessageIntelligenceRollup["safeMessageThemes"],
): EvidencePacket {
  const ctx = oppositionContext();
  const verified = recommendations
    .filter((r) => r.citationDepthScore >= 40)
    .slice(0, 8)
    .map((r, i) => ({
      claimId: r.id,
      claimText: r.text,
      tierHint: "verified" as const,
      sourceAnchorIds: r.evidenceAnchors,
    }));
  const inferred = recommendations
    .filter((r) => r.citationDepthScore < 40)
    .slice(0, 8)
    .map((r) => ({
      claimId: r.id,
      claimText: r.text,
      tierHint: "inferred" as const,
      sourceAnchorIds: r.evidenceAnchors,
    }));

  return {
    id: buildPacketId(briefId),
    briefId,
    briefType,
    title,
    subject,
    county: null,
    opponent: "kim-hammer",
    topicTags: ["message-intelligence", "internal-only"],
    intendedUse: "INTERNAL_STRATEGY_REVIEW",
    generatedAt: new Date().toISOString(),
    generatedBy: "messageIntelligenceEngine.v1",
    sourceSystems: ["messageIntelligenceEngine", "claimLedger", "legislativeTranscript"],
    evidenceSummary: [
      `Message intelligence rollup — readiness ${rollup.readinessScore}/100`,
      `${recommendations.length} recommendations — all NON_PUBLISHABLE`,
    ],
    sourceAnchors: recommendations.flatMap((r) =>
      r.evidenceAnchors.slice(0, 2).map((a, i) => ({
        anchorId: `${r.id}-anchor-${i}`,
        label: a,
        sourceSystem: r.sourceSystems[0] ?? "messageIntelligence",
        requiredForPublicUse: true,
      })),
    ).slice(0, 12),
    sources: recommendations.slice(0, 5).map((r, i) => ({
      sourceId: `${briefId}-src-${i}`,
      system: r.sourceSystems.join(","),
      anchor: r.evidenceAnchors[0] ?? "internal",
      description: r.recommendedHumanAction,
      confidence: r.confidenceScore >= 60 ? "MEDIUM" : "LOW",
      staleRisk: r.reviewStatus === "NEEDS_REVIEW",
    })),
    verifiedClaimCandidates: verified,
    inferredClaimCandidates: inferred,
    unsupportedClaimWarnings: rollup.weakestUnsafeAngles.map((r) => r.text).slice(0, 6),
    researchGaps: rollup.claimsNeedingCitation.map((r, i) => ({
      gapId: `${briefId}-gap-${i}`,
      description: r.text,
      severity: "HIGH" as const,
      blocksPublicUse: true,
    })),
    governance: defaultEvidencePacketGovernance(),
    confidenceScore: clampEvidenceConfidence(rollup.readinessScore),
    riskLevel: rollup.riskyMessageThemes.length > 3 ? "HIGH" : "MEDIUM",
    operatorInstructions: [
      "Message intelligence evidence — NOT final public copy",
      "Route all LLM output to review queue only",
      "Verify claim ledger ids before any adaptation",
      ...rollup.governance.labels.map((l) => l),
    ],
    generationContext: ctx,
  };
}

export function buildMessageEvidencePacket(repoRoot?: string, rollupIn?: MessageIntelligenceRollup): EvidencePacket {
  const rollup = rollupIn ?? buildMessageIntelligenceEngine(repoRoot);
  return messageIntelToEvidencePacket(
    rollup,
    "message-intelligence-v1",
    "candidate_message",
    "Message Intelligence Engine 1.0",
    "Internal message themes and citation guidance",
    [...rollup.safeMessageThemes, ...rollup.strongestEvidenceAngles],
  );
}

export function buildDebateMessageEvidencePacket(repoRoot?: string, rollupIn?: MessageIntelligenceRollup): EvidencePacket {
  const rollup = rollupIn ?? buildMessageIntelligenceEngine(repoRoot);
  return messageIntelToEvidencePacket(
    rollup,
    "debate-message-intelligence-v1",
    "debate_prep",
    "Debate message intelligence",
    "Transcript-backed debate lanes — internal review only",
    rollup.debateMessageLanes,
  );
}

export function buildLegislativeQuoteEvidencePacket(repoRoot?: string, rollupIn?: MessageIntelligenceRollup): EvidencePacket {
  const rollup = rollupIn ?? buildMessageIntelligenceEngine(repoRoot);
  const leg = buildLegislativeVideoIntelligenceRollup(repoRoot);
  const packet = messageIntelToEvidencePacket(
    rollup,
    "legislative-quote-intelligence-v1",
    "debate_prep",
    "Legislative quote intelligence",
    "Committee video quotes — HUMAN_REVIEW_REQUIRED",
    rollup.usableInternalTalkingPoints,
  );
  packet.researchGaps.push({
    gapId: "leg-quote-speaker-review",
    description: `${leg.quotesNeedingReview.length} quotes need speaker verification`,
    severity: "CRITICAL",
    blocksPublicUse: true,
  });
  return packet;
}

export function buildRapidResponseMessageEvidencePacket(repoRoot?: string, rollupIn?: MessageIntelligenceRollup): EvidencePacket {
  const rollup = rollupIn ?? buildMessageIntelligenceEngine(repoRoot);
  return messageIntelToEvidencePacket(
    rollup,
    "rapid-response-message-intelligence-v1",
    "rapid_response_prep",
    "Rapid response message intelligence",
    "Internal RR watch themes — no auto-send",
    rollup.rapidResponseOpportunities,
  );
}

export function buildAllMessageEvidencePackets(repoRoot?: string) {
  const rollup = buildMessageIntelligenceEngine(repoRoot);
  return {
    message: buildMessageEvidencePacket(repoRoot, rollup),
    debateMessage: buildDebateMessageEvidencePacket(repoRoot, rollup),
    legislativeQuote: buildLegislativeQuoteEvidencePacket(repoRoot, rollup),
    rapidResponseMessage: buildRapidResponseMessageEvidencePacket(repoRoot, rollup),
    rollup,
  };
}
