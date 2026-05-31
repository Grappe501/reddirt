import { loadClaimLedger } from "@/lib/intelligence/claims/claimLedgerStore";
import { summarizeClaimLedger } from "@/lib/intelligence/claims/claimLedgerSummary";
import { generateOppositionDebateBriefPack } from "@/lib/intelligence/briefs/oppositionDebateBriefGenerator";
import { loadOppositionArchiveRollup } from "@/lib/opposition/oppositionBriefConfidence";
import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import { loadTranscriptChunks } from "@/lib/legislature/legislativeClaimIngest";
import { buildLegislativeVideoIntelligenceRollup } from "@/lib/legislature/legislativeVideoIntelligenceRollup";
import { mapAllLegislativeChunksToMessages } from "./legislativeChunkMessageMapper";
import type { MessageIntelligenceRollup, MessageRecommendation } from "./messageIntelligenceTypes";
import { MESSAGE_INTELLIGENCE_GOVERNANCE } from "./messageIntelligenceTypes";
import { generateAllCountyBriefBundles, summarizeCountyPublicBriefReadiness } from "@/lib/intelligence/briefs/countyPublicBriefGenerator";

function fromBriefVerified(
  claim: string,
  anchors: string[],
  idx: number,
): MessageRecommendation {
  return {
    id: `mie-brief-v-${idx}`,
    category: "SAFE_THEME",
    text: `[INTERNAL — verify before use] ${claim.slice(0, 160)}`,
    evidenceAnchors: anchors,
    claimLedgerIds: [],
    citationDepthScore: 55,
    confidenceScore: 65,
    reviewStatus: "NEEDS_REVIEW",
    publicUseRisk: "MEDIUM",
    recommendedHumanAction: "Citation locker + human review before any adaptation",
    sourceSystems: ["governedBrief"],
  };
}

function computeReadinessScore(input: {
  exportReady: number;
  archiveConfidence: number;
  chunkCount: number;
  citationGaps: number;
  unsupportedCount: number;
  countyReady: number;
}): { score: number; basis: string } {
  let score = 35;
  score += Math.min(input.exportReady * 5, 15);
  score += Math.min(input.archiveConfidence * 0.15, 12);
  score += Math.min(input.chunkCount * 4, 16);
  score += Math.min(input.countyReady * 2, 10);
  score -= Math.min(input.citationGaps * 3, 15);
  score -= Math.min(input.unsupportedCount * 4, 12);
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    basis: `exportReady=${input.exportReady}; archiveConf=${input.archiveConfidence}; chunks=${input.chunkCount}; citationGaps=${input.citationGaps}`,
  };
}

export function buildMessageIntelligenceEngine(
  repoRoot: string = process.cwd(),
): MessageIntelligenceRollup {
  const briefPack = generateOppositionDebateBriefPack();
  const archive = loadOppositionArchiveRollup(repoRoot);
  const legislative = buildLegislativeVideoIntelligenceRollup(repoRoot);
  const debate = buildDebateCommandCenterState();
  const ledger = loadClaimLedger(repoRoot);
  const ledgerSummary = summarizeClaimLedger(repoRoot);
  const chunks = loadTranscriptChunks(repoRoot);
  const countyRollup = summarizeCountyPublicBriefReadiness(generateAllCountyBriefBundles());

  const legMessages = mapAllLegislativeChunksToMessages(chunks);

  const safeMessageThemes: MessageRecommendation[] = [
    ...briefPack.opposition.verifiedClaims.slice(0, 4).map((c, i) =>
      fromBriefVerified(c.claim, c.sourceAnchors, i),
    ),
    ...legMessages.filter((m) => m.category === "SAFE_THEME" || (m.category === "TALKING_POINT" && m.confidenceScore >= 55)),
  ];

  const riskyMessageThemes: MessageRecommendation[] = [
    ...briefPack.opposition.inferredClaims.slice(0, 3).map((c, i) => ({
      id: `mie-inferred-${i}`,
      category: "RISKY_THEME" as const,
      text: `[INFERRED — RISKY] ${c.claim.slice(0, 160)}`,
      evidenceAnchors: c.sourceAnchors,
      claimLedgerIds: [],
      citationDepthScore: 25,
      confidenceScore: 30,
      reviewStatus: "NEEDS_REVIEW" as const,
      publicUseRisk: "HIGH" as const,
      recommendedHumanAction: "Do not use in messaging without verification",
      sourceSystems: ["governedBrief"],
    })),
    ...legMessages.filter((m) => m.category === "RISKY_THEME" || m.category === "WEAK_ANGLE"),
  ];

  const claimsNeedingCitation = ledger.entries
    .filter((e) => e.citationAnchorIds.length === 0 && e.classification !== "UNSUPPORTED")
    .slice(0, 8)
    .map((e, i) => ({
      id: `mie-cite-gap-${i}`,
      category: "WEAK_ANGLE" as const,
      text: e.claimText.slice(0, 140),
      evidenceAnchors: e.supportingSourceIds,
      claimLedgerIds: [e.id],
      citationDepthScore: 0,
      confidenceScore: e.confidenceScore,
      reviewStatus: "NEEDS_REVIEW" as const,
      publicUseRisk: e.publicUseRisk,
      recommendedHumanAction: "Add citation anchor before message use",
      sourceSystems: ["claimLedger"],
    }));

  const claimsNeedingHumanReview = ledger.entries
    .filter((e) => e.verificationStatus === "DRAFT" || e.verificationStatus === "NEEDS_REVIEW")
    .slice(0, 8)
    .map((e, i) => ({
      id: `mie-review-${i}`,
      category: "WEAK_ANGLE" as const,
      text: e.claimText.slice(0, 140),
      evidenceAnchors: e.citationAnchorIds,
      claimLedgerIds: [e.id],
      citationDepthScore: e.citationAnchorIds.length ? 40 : 0,
      confidenceScore: e.confidenceScore,
      reviewStatus: "NEEDS_REVIEW" as const,
      publicUseRisk: e.publicUseRisk,
      recommendedHumanAction: e.recommendedHumanAction,
      sourceSystems: ["claimLedger"],
    }));

  const readiness = computeReadinessScore({
    exportReady: ledgerSummary.verifiedClaims,
    archiveConfidence: archive.oppositionBriefConfidenceEstimate,
    chunkCount: chunks.length,
    citationGaps: claimsNeedingCitation.length,
    unsupportedCount: ledgerSummary.unsupportedClaims,
    countyReady: countyRollup.PUBLIC_BRIEF_READY ?? 0,
  });

  return {
    generatedAt: new Date().toISOString(),
    readinessScore: readiness.score,
    readinessBasis: readiness.basis,
    safeMessageThemes,
    riskyMessageThemes,
    claimsNeedingCitation,
    claimsNeedingHumanReview,
    usableInternalTalkingPoints: legMessages.filter((m) => m.category === "TALKING_POINT").slice(0, 8),
    debateMessageLanes: [
      ...legMessages.filter((m) => m.category === "DEBATE_LANE"),
      ...briefPack.debatePrep.verifiedClaims.slice(0, 3).map((c, i) => fromBriefVerified(c.claim, c.sourceAnchors, 100 + i)),
    ],
    countyMessageOpportunities: legMessages.filter((m) => m.category === "COUNTY_OPPORTUNITY").slice(0, 6),
    rapidResponseOpportunities: briefPack.rapidResponse.verifiedClaims.slice(0, 3).map((c, i) => ({
      id: `mie-rr-${i}`,
      category: "RAPID_RESPONSE" as const,
      text: `[INTERNAL RR WATCH] ${c.claim.slice(0, 120)}`,
      evidenceAnchors: c.sourceAnchors,
      claimLedgerIds: [],
      citationDepthScore: 45,
      confidenceScore: 40,
      reviewStatus: "NEEDS_REVIEW" as const,
      publicUseRisk: "HIGH" as const,
      recommendedHumanAction: "Comms lead review — no auto-send",
      sourceSystems: ["rapidResponseBrief"],
    })),
    phrasesToAvoid: [
      ...legMessages.filter((m) => m.category === "AVOID_PHRASE"),
      ...debate.opposition.riskClaims.slice(0, 4).map((r, i) => ({
        id: `mie-avoid-${i}`,
        category: "AVOID_PHRASE" as const,
        text: r,
        evidenceAnchors: ["kimHammerWorkbench"],
        claimLedgerIds: [],
        citationDepthScore: 80,
        confidenceScore: 85,
        reviewStatus: "HUMAN_VERIFIED" as const,
        publicUseRisk: "CRITICAL" as const,
        recommendedHumanAction: "Do-not-say list",
        sourceSystems: ["debateCommand"],
      })),
    ],
    strongestEvidenceAngles: [
      ...archive.topUsableEvidence.slice(0, 4).map((e, i) => ({
        id: `mie-evidence-${i}`,
        category: "EVIDENCE_ANGLE" as const,
        text: e,
        evidenceAnchors: ["oppositionArchive"],
        claimLedgerIds: [],
        citationDepthScore: 65,
        confidenceScore: archive.oppositionBriefConfidenceEstimate,
        reviewStatus: "NEEDS_REVIEW" as const,
        publicUseRisk: "MEDIUM" as const,
        recommendedHumanAction: "Verify citation before internal strategy",
        sourceSystems: ["oppositionArchive"],
      })),
      ...legMessages.filter((m) => m.category === "EVIDENCE_ANGLE"),
    ],
    weakestUnsafeAngles: [
      ...archive.topUnusableClaims.slice(0, 4).map((c, i) => ({
        id: `mie-unsafe-${i}`,
        category: "WEAK_ANGLE" as const,
        text: c,
        evidenceAnchors: [],
        claimLedgerIds: [],
        citationDepthScore: 0,
        confidenceScore: 20,
        reviewStatus: "NEEDS_REVIEW" as const,
        publicUseRisk: "CRITICAL" as const,
        recommendedHumanAction: "Unsupported — block from messaging",
        sourceSystems: ["claimLedger"],
      })),
      ...legMessages.filter((m) => m.publicUseRisk === "CRITICAL"),
    ],
    governance: MESSAGE_INTELLIGENCE_GOVERNANCE,
  };
}
