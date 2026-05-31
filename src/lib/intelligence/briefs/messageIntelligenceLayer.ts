import type { GovernedBrief, MessageIntelligenceGuidance } from "./governedBriefTypes";
import { GOVERNED_BRIEF_DEFAULT_LABELS } from "./governedBriefTypes";

/** Turns brief evidence into safe message guidance — not public copy. */
export function buildMessageIntelligenceFromBrief(brief: GovernedBrief): MessageIntelligenceGuidance {
  return {
    briefId: brief.briefId,
    safeMessageThemes: brief.verifiedClaims
      .filter((c) => c.tier === "verified")
      .slice(0, 5)
      .map((c) => `[INTERNAL] ${c.claim.slice(0, 120)} — verify before use`),
    riskyMessageThemes: [
      ...brief.inferredClaims.slice(0, 3).map((c) => `[RISKY/INFERRED] ${c.claim}`),
      ...brief.unverifiedClaims.slice(0, 3).map((c) => `[UNVERIFIED] ${c.claim}`),
    ],
    claimsNeedingVerification: brief.unverifiedClaims.map((c) => c.claim),
    fieldOrganizerQuestions: [
      "What local validators can confirm this county narrative?",
      "What registration goal is set in admin for this county?",
      "What events are scheduled in the next 14 days?",
    ],
    debateQuestions: brief.briefType === "debate_prep"
      ? ["Which bill anchors have act-text verification?", "What is our 30s answer for integrity framing?"]
      : [],
    countyListeningPrompts: brief.briefType.startsWith("county")
      ? [
          "What are county clerks hearing from election workers?",
          "What local issues matter most to volunteers here?",
        ]
      : [],
    emailSocialAnglesInternalOnly: brief.recommendedMessaging.map(
      (m) => `[INTERNAL ONLY — NOT FOR PUBLISH] ${m}`,
    ),
    governanceLabels: [...GOVERNED_BRIEF_DEFAULT_LABELS],
  };
}

export type BrainOrchestrationAnswers = {
  whatCanWeSaySafely: string[];
  knownButNotPublic: string[];
  suspectNeedProof: string[];
  countiesClosestToPublicBrief: string[];
  countiesDangerousToMessage: string[];
  debatePrepToday: string[];
  researchClosesGapsFastest: string[];
  kellySayThisWeek: string[];
  kellyAvoidThisWeek: string[];
  strongestOppositionEvidence: string[];
  unsafeOppositionLines: string[];
  topRetrievalTaskToClose: string[];
  debatePrepBlockedBySources: string[];
  safeInternalClaims: string[];
  claimsNeedingMoreProof: string[];
  whatDidHammerSayAboutBill: string[];
  strongestLegislativeQuote: string[];
  safeLegislativeQuotes: string[];
  quotesNeedingReview: string[];
  billsWithTranscriptCoverage: string[];
  billsMissingVideo: string[];
  repeatingPolicyThemes: string[];
  debateUsefulLegislativeIntel: string[];
  countyMessagingLegislativeIntel: string[];
  tooRiskyLegislativeQuotes: string[];
};

export function buildBrainOrchestrationAnswers(input: {
  countySummaries: Array<{ name: string; readiness: string }>;
  oppositionGaps: string[];
  debateRaiseToday: string[];
  whatNotToSay: string[];
  exportReadyCount: number;
  archiveRollup?: {
    topUsableEvidence: string[];
    topUnusableClaims: string[];
    nextHumanRetrievalActions: string[];
    filmRoomGapNote: string;
    directClipCount: number;
    retrievalTasksComplete: number;
    retrievalTasksTotal: number;
    usableQuoteCount: number;
  };
  legislativeRollup?: {
    topHammerCommitteeQuotes: string[];
    strongestQuotes: string[];
    quotesNeedingReview: string[];
    billsWithTranscriptCoverage: string[];
    billsMissingVideo: string[];
    policyThemesRepeating: string[];
    debateUsefulChunks: string[];
    countyMessagingUseful: string[];
    tooRiskyToUse: string[];
    chunkCount: number;
  };
  messageIntelligence?: {
    readinessScore: number;
    safeThemes: string[];
    riskyThemes: string[];
    citationGaps: string[];
  };
}): BrainOrchestrationAnswers {
  const closest = input.countySummaries
    .filter((c) => c.readiness === "INTERNAL_MESSAGE_SOURCE_ONLY")
    .slice(0, 5)
    .map((c) => c.name);
  const dangerous = input.countySummaries
    .filter((c) => c.readiness === "SHELL_ONLY")
    .slice(0, 5)
    .map((c) => `${c.name} — shell only, public messaging dangerous`);

  return {
    whatCanWeSaySafely: [
      `${input.exportReadyCount} export-ready opposition claims for INTERNAL use after human review`,
      "Statewide pillars: trust, county support, participation + integrity together",
    ],
    knownButNotPublic: [
      "Bill-index opposition patterns — internal until citation approval",
      "County planning vote proxies — never public as registration goals",
    ],
    suspectNeedProof: input.oppositionGaps.slice(0, 5),
    countiesClosestToPublicBrief: closest.length ? closest : ["None — 0 counties PUBLIC_BRIEF_READY"],
    countiesDangerousToMessage: dangerous.length ? dangerous : ["Most shell counties — treat as dangerous"],
    debatePrepToday: input.debateRaiseToday,
    researchClosesGapsFastest: input.oppositionGaps.slice(0, 3),
    kellySayThisWeek: [
      ...(input.messageIntelligence?.safeThemes.slice(0, 2).map((t) => `[MIE INTERNAL] ${t.slice(0, 100)}`) ?? []),
      "INTERNAL: emphasize transparent SOS service and county election worker support",
      "Use export-ready claims only through review workflow",
    ],
    kellyAvoidThisWeek: [
      ...(input.messageIntelligence?.riskyThemes.slice(0, 2) ?? []),
      ...input.whatNotToSay.slice(0, 5),
    ],
    strongestOppositionEvidence: input.archiveRollup?.topUsableEvidence.length
      ? input.archiveRollup.topUsableEvidence
      : [`${input.exportReadyCount} export-ready claims — verify citations before internal use`],
    unsafeOppositionLines: input.archiveRollup?.topUnusableClaims.length
      ? input.archiveRollup.topUnusableClaims
      : input.oppositionGaps.slice(0, 3),
    topRetrievalTaskToClose: input.archiveRollup?.nextHumanRetrievalActions.length
      ? input.archiveRollup.nextHumanRetrievalActions.slice(0, 1)
      : input.oppositionGaps.slice(0, 1),
    debatePrepBlockedBySources: [
      input.archiveRollup?.filmRoomGapNote ?? "Film room archive status unknown",
      ...(input.archiveRollup && input.archiveRollup.directClipCount < 2
        ? ["Debate prep blocked: insufficient direct opponent clips"]
        : []),
    ],
    safeInternalClaims: input.archiveRollup?.topUsableEvidence.length
      ? input.archiveRollup.topUsableEvidence.map((e) => `[INTERNAL ONLY] ${e}`)
      : [`${input.exportReadyCount} export-ready claims pending human review`],
    claimsNeedingMoreProof: input.archiveRollup?.topUnusableClaims.length
      ? input.archiveRollup.topUnusableClaims
      : input.oppositionGaps.slice(0, 5),
    whatDidHammerSayAboutBill:
      input.legislativeRollup?.billsWithTranscriptCoverage.length
        ? input.legislativeRollup.billsWithTranscriptCoverage.map(
            (b) => `${b}: see legislative transcript chunks — human review required`,
          )
        : ["No bill transcript coverage yet — run legislature:intelligence:run"],
    strongestLegislativeQuote: input.legislativeRollup?.strongestQuotes ?? [],
    safeLegislativeQuotes: input.legislativeRollup?.strongestQuotes.map((q) => `[INTERNAL REVIEW] ${q}`) ?? [],
    quotesNeedingReview: input.legislativeRollup?.quotesNeedingReview ?? [],
    billsWithTranscriptCoverage: input.legislativeRollup?.billsWithTranscriptCoverage ?? [],
    billsMissingVideo: input.legislativeRollup?.billsMissingVideo ?? [],
    repeatingPolicyThemes: input.legislativeRollup?.policyThemesRepeating ?? [],
    debateUsefulLegislativeIntel: input.legislativeRollup?.debateUsefulChunks ?? [],
    countyMessagingLegislativeIntel: input.legislativeRollup?.countyMessagingUseful ?? [],
    tooRiskyLegislativeQuotes: input.legislativeRollup?.tooRiskyToUse ?? [],
  };
}
