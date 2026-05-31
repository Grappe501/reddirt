import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { loadOppositionArchiveRollup } from "@/lib/opposition/oppositionBriefConfidence";
import { buildDebateCommandCenterState } from "@/lib/opposition/debateCommandCenter";
import type { GovernedBrief, GovernedClaimRecord } from "./governedBriefTypes";
import { clampBriefConfidence, defaultGovernedBriefFields } from "./governedBriefTypes";

function claimFromExport(claim: string, anchors: string[]): GovernedClaimRecord {
  return { claim, tier: "verified", sourceAnchors: anchors };
}

function claimInferred(claim: string, anchors: string[]): GovernedClaimRecord {
  return { claim, tier: "inferred", sourceAnchors: anchors };
}

export function generateOppositionResearchBrief(): GovernedBrief {
  const evidence = loadKimHammerEvidenceIndex();
  const workbench = loadKimHammerWorkbench();
  const kh3 = loadKimHammerKh3Workbench();
  const archive = loadOppositionArchiveRollup();
  const base = defaultGovernedBriefFields("oppositionDebateBriefGenerator.v1");

  const verified: GovernedClaimRecord[] = evidence.exportReadyClaims.slice(0, 5).map((c) =>
    claimFromExport(c.text || c.claim || c.id, [
      ...(c.supportingEvidence?.map((e) => e.url).filter(Boolean) ?? ["evidence-index"]),
    ]),
  );
  verified.push(
    claimFromExport(`${workbench.totalBills} bills indexed in election record packet`, [
      "kim-hammer-election-record-bill-index.json",
    ]),
  );

  const unverified: GovernedClaimRecord[] = evidence.reviewNeededClaims.slice(0, 5).map((c) => ({
    claim: c.text || c.claim || c.id,
    tier: "unverified" as const,
    sourceAnchors: c.supportingEvidence?.map((e) => e.url).filter(Boolean) ?? ["claim-graph"],
  }));

  const inferred: GovernedClaimRecord[] = kh3.summary.topOpenGaps.slice(0, 6).map((g) =>
    claimInferred(g, ["kim-hammer-intelligence-gaps.json"]),
  );

  return {
    ...base,
    briefId: "opposition-kim-hammer-v1",
    title: "Kim Hammer Opposition Research Brief (INTERNAL)",
    briefType: "opposition_research",
    tags: ["kim-hammer", "opposition", "KH-0", "KH-4"],
    audience: "Research + debate prep + comms leads",
    intendedUse: "Internal opposition analysis — NOT public release",
    evidenceSummary: [
      `${evidence.metrics.exportReadyClaims} export-ready claims of ${evidence.metrics.totalClaims}`,
      `${archive.sourceCount} opposition archive sources; ${archive.usableQuoteCount}/${archive.directQuoteCount} usable quotes`,
      `${archive.directClipCount} direct opponent clips; ${archive.authoredWritingCount} authored writings`,
      `${archive.retrievalTasksComplete}/${archive.retrievalTasksTotal} retrieval tasks closed (${archive.retrievalTasksPartial} partial)`,
      `${workbench.claimBuckets.needsResearch.length} claims need research`,
    ],
    verifiedClaims: verified,
    unverifiedClaims: unverified,
    inferredClaims: inferred,
    researchGaps: [
      ...kh3.debateArchive.openGaps,
      ...kh3.authoredWritings.openGaps.slice(0, 2),
      `${archive.retrievalTasksComplete}/${archive.retrievalTasksTotal} retrieval tasks COMPLETE — do not claim research closure`,
      ...archive.nextHumanRetrievalActions.slice(0, 2),
    ],
    recommendedMessaging: [
      "Internally: contrast SOS service philosophy using export-ready claims only",
      "Public: do not use until claim review + export control clearance",
    ],
    riskWarnings: [
      archive.filmRoomGapNote,
      "NOT_PUBLISHABLE — opposition content requires KH-4 export workflow",
      ...workbench.riskClaims.slice(0, 3),
    ],
    humanReviewChecklist: [
      "Citation locker entry for every claim used externally",
      "Legal review for controversy-adjacent frames",
      "No motive inference without RESEARCH_QUESTION tier",
    ],
    sourceAnchors: [
      "opposition-archive-items.json",
      "kim-hammer-evidence-index",
      "kim-hammer-election-record-bill-index.json",
      "kim-hammer-kh4-claim-graph.json",
      "kim-hammer-intelligence-gaps.json",
    ],
    confidenceScore: clampBriefConfidence(archive.oppositionBriefConfidenceEstimate),
    confidenceBasis: archive.confidenceBasis,
  };
}

export function generateDebatePrepBrief(): GovernedBrief {
  const debate = buildDebateCommandCenterState();
  const kh3 = loadKimHammerKh3Workbench();
  const base = defaultGovernedBriefFields("oppositionDebateBriefGenerator.v1");
  const overall = debate.readinessScores.find((s) => s.id === "overall");

  return {
    ...base,
    briefId: "debate-prep-v1",
    title: "Debate Prep Brief (INTERNAL)",
    briefType: "debate_prep",
    tags: ["debate", "prep", "Kelly"],
    audience: "Candidate prep + debate coaches",
    intendedUse: "Daily debate preparation — INTERNAL ONLY",
    evidenceSummary: [
      `Overall readiness: ${overall?.score ?? "—"}/100 (${overall?.scoreConfidence ?? "LOW"})`,
      `${debate.filmRoom.directClipCount} direct opponent clips`,
      `${kh3.kh2.rebuttalPrep.rebuttals.length} rebuttal scripts in corpus`,
      `${debate.opposition.debateDrillQueue.length} drill cards from bill anchors`,
    ],
    verifiedClaims: debate.readinessScores.slice(0, 4).map((s) => ({
      claim: `${s.label}: ${s.score}/100 — ${s.whyThisScore}`,
      tier: "verified" as const,
      sourceAnchors: s.computedFrom,
    })),
    unverifiedClaims: debate.filmRoom.coverageGaps.map((g) => ({
      claim: g,
      tier: "unverified" as const,
      sourceAnchors: ["debateFilmRoom"],
    })),
    inferredClaims: kh3.kh2.likelyArguments.arguments.slice(0, 3).map((a) => ({
      claim: a.argument,
      tier: "inferred" as const,
      sourceAnchors: a.sourceAnchors ?? ["likely-arguments"],
    })),
    researchGaps: debate.filmRoom.coverageGaps,
    recommendedMessaging: debate.messagePillars.map((p) => `Pillar: ${p} — human review before debate use`),
    riskWarnings: [
      ...debate.opposition.riskClaims.slice(0, 4),
      "All debate answers INTERNAL until comms/candidate prep sign-off",
    ],
    humanReviewChecklist: [
      "Run what-not-to-say review",
      "Verify act numbers on bill anchors",
      "30s/60s compression drill before live event",
    ],
    sourceAnchors: ["debateCommandCenter", "debateReadinessSignals", "kim-hammer-debate-profile.json"],
    confidenceScore: clampBriefConfidence(overall?.score ?? 45),
    confidenceBasis: overall?.whyThisScore ?? "Computed debate readiness",
  };
}

export function generateRapidResponsePrepBrief(): GovernedBrief {
  const evidence = loadKimHammerEvidenceIndex();
  const kh3 = loadKimHammerKh3Workbench();
  const base = defaultGovernedBriefFields("oppositionDebateBriefGenerator.v1");

  return {
    ...base,
    briefId: "rapid-response-prep-v1",
    title: "Rapid Response Readiness Brief (INTERNAL)",
    briefType: "rapid_response_prep",
    tags: ["rapid-response", "media"],
    audience: "Comms + rapid response desk",
    intendedUse: "Monitor and draft internal response lanes — no auto-send",
    evidenceSummary: [
      `${kh3.rapidResponseAppendix.evidenceLocker.length} evidence locker assets`,
      `${evidence.metrics.blockedClaims} blocked claims`,
      "No live comms workflow — intake queue signals only",
    ],
    verifiedClaims: kh3.rapidResponseAppendix.evidenceLocker.slice(0, 3).map((a) => ({
      claim: a.asset,
      tier: "verified" as const,
      sourceAnchors: ["kim-hammer-kh3-rapid-response-appendix.json"],
    })),
    unverifiedClaims: [],
    inferredClaims: [
      {
        claim: "Media rapid response readiness tied to intake backlog — not automated",
        tier: "inferred",
        sourceAnchors: ["publicMediaIntake"],
      },
    ],
    researchGaps: ["Live comms send path blocked by design", "Quote verification rules in rapid-response appendix"],
    recommendedMessaging: ["INTERNAL watchlist only — route drafts to LLM review queue"],
    riskWarnings: [
      "NO AUTO-SEND — all response language human-reviewed",
      "Blocked claims must not appear in rapid response drafts",
    ],
    humanReviewChecklist: ["Comms lead approval", "Citation locker check", "Legal for controversy frames"],
    sourceAnchors: ["kim-hammer-kh3-rapid-response-appendix.json", "llm-draft-review-queue.json"],
    confidenceScore: clampBriefConfidence(40),
    confidenceBasis: "Appendix exists; live workflow deferred",
  };
}

export function generateOppositionDebateBriefPack() {
  return {
    opposition: generateOppositionResearchBrief(),
    debatePrep: generateDebatePrepBrief(),
    rapidResponse: generateRapidResponsePrepBrief(),
  };
}
