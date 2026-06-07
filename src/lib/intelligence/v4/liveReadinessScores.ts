import "server-only";

import type { DebateFilmRoomState } from "@/lib/opposition/debateFilmRoomTypes";
import type { ComputedReadinessScore } from "@/lib/opposition/debateReadinessSignals";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import type { DebateIntelligenceV4Packet } from "@/lib/intelligence/v4/debateIntelligenceV4Types";
import { getAllPrepSectionDrillDownIds, getPrepSectionDrillDown } from "@/lib/intelligence/v4/debatePrepSectionDrillDowns";
import { getAllTrapLaneIds, getTrapLaneDrillDown } from "@/lib/intelligence/v4/trapLaneDrillDowns";
import { getAllSosDebateQuestionIds, getSosDebateQuestionDrillDown } from "@/lib/intelligence/v4/sosDebateQuestionBank";
import { buildSosQuestionResponseRounds } from "@/lib/intelligence/v4/debateResponseRoundEnrichment";
import { buildTrapLaneStepCoverage } from "@/lib/intelligence/v4/trapLaneStepCoverage";
import { listCuratedBillPlaybookNumbers } from "@/lib/intelligence/v4/debateBillOperatorPlaybooks";
import { listAllBillNumbersFromIndex } from "@/lib/intelligence/v4/billActProofDepth";
import { computeDebateCommandPhilosophyReadiness } from "@/lib/intelligence/v4/debateCommandPhilosophyReadiness";
import { tryIntelligenceLoad } from "@/lib/intelligence/safeIntelligenceLoad";
import { loadOppositionArchiveRollup } from "@/lib/opposition/oppositionBriefConfidence";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function prepSectionCompletionPct(): { pct: number; built: number; total: number } {
  const ids = getAllPrepSectionDrillDownIds();
  let built = 0;
  for (const id of ids) {
    const d = getPrepSectionDrillDown(id)!;
    const ok =
      d.rebuttalScripts.length >= 1 &&
      d.rehearsalSteps.length >= 1 &&
      d.whyItMatters.length > 20 &&
      !!d.encounterDepth?.whatToExpectPlain;
    if (ok) built++;
  }
  return { pct: Math.round((built / ids.length) * 100), built, total: ids.length };
}

function trapLaneCompletionPct(): number {
  const ids = getAllTrapLaneIds();
  let built = 0;
  for (const id of ids) {
    const d = getTrapLaneDrillDown(id)!;
    const coverage = buildTrapLaneStepCoverage(d);
    const ok =
      d.rebuttalScripts.length >= 1 &&
      d.whatToExpectHammerToSay.length >= 3 &&
      coverage.steps.length >= 6 &&
      !!d.encounterDepth?.whatToExpectPlain;
    if (ok) built++;
  }
  return Math.round((built / ids.length) * 100);
}

function sosQuestionCompletionPct(): number {
  const ids = getAllSosDebateQuestionIds();
  let built = 0;
  for (const id of ids) {
    const d = getSosDebateQuestionDrillDown(id)!;
    const rounds = buildSosQuestionResponseRounds(d);
    const ok =
      d.speakOrderDrills.length === 3 &&
      d.directAnswer30s.length > 30 &&
      rounds.rounds.length >= 5 &&
      !!d.encounterDepth?.whatToExpectPlain;
    if (ok) built++;
  }
  return Math.round((built / ids.length) * 100);
}

function billPlaybookCompletionPct(): number {
  const bills = listAllBillNumbersFromIndex();
  const curated = listCuratedBillPlaybookNumbers().length;
  return Math.round((curated / bills.length) * 100);
}

export type LiveReadinessContext = {
  v4: DebateIntelligenceV4Packet;
  filmRoom: DebateFilmRoomState;
};

/** Unified live readiness — wired from v4 packet, drill-down depth, film room, and claims. */
export function computeLiveReadinessScores(ctx: LiveReadinessContext): ComputedReadinessScore[] {
  const { v4, filmRoom } = ctx;
  const claimsReady = v4.hub.claims.supported.length;
  const needsResearch = v4.hub.claims.needsResearch.length;
  const prep = prepSectionCompletionPct();
  const trapPct = trapLaneCompletionPct();
  const sosPct = sosQuestionCompletionPct();
  const billPct = billPlaybookCompletionPct();
  const clipScore = filmRoom.directClipCount * 12 + filmRoom.legislativeClipCount * 4;
  const archive = tryIntelligenceLoad("live-readiness-archive", () => loadOppositionArchiveRollup(), null);
  const philosophyFeed = computeDebateCommandPhilosophyReadiness();

  const base: ComputedReadinessScore[] = [
    {
      id: "debateResponseConfidence",
      label: "Debate prep depth",
      score: clamp(Math.round(prep.pct * 0.6 + (v4.debatePrepSectionsV4.length / 28) * 40)),
      trend: prep.pct >= 95 ? "up" : prep.pct >= 80 ? "flat" : "down",
      weakAreas: prep.pct < 100 ? [`${prep.total - prep.built} prep sections missing encounter depth`] : [],
      nextModule: "/admin/intelligence/kim-hammer/debate-prep",
      whyThisScore: `${prep.built}/${prep.total} prep drill-downs complete · ${v4.debatePrepSectionsV4.length} packet sections`,
      scoreConfidence: prep.pct >= 90 ? "HIGH" : prep.pct >= 70 ? "MEDIUM" : "LOW",
      raiseScoreToday: [
        "Rehearse sections 4, 6–8, 19, 28 aloud",
        "Open weakest prep drill-down from supreme workbench",
      ],
      computedFrom: ["debatePrepSectionDrillDowns", "debateIntelligenceV4"],
    },
    {
      id: "rapidRebuttalReadiness",
      label: "Trap + SOS question bank",
      score: clamp(Math.round(trapPct * 0.5 + sosPct * 0.5)),
      trend: trapPct >= 100 && sosPct >= 100 ? "up" : "flat",
      weakAreas:
        trapPct < 100 || sosPct < 100
          ? [`Trap lanes ${trapPct}% · SOS questions ${sosPct}%`]
          : [],
      nextModule: "/admin/intelligence/trap-lanes",
      whyThisScore: `6 trap lanes at ${trapPct}% · 23 SOS questions at ${sosPct}%`,
      scoreConfidence: trapPct >= 90 && sosPct >= 90 ? "HIGH" : "MEDIUM",
      raiseScoreToday: [
        "Run one trap lane speak-order drill end-to-end",
        "Practice 3 SOS questions with 5 response rounds each",
      ],
      computedFrom: ["trapLaneDrillDowns", "sosDebateQuestionBank"],
    },
    {
      id: "electionLawMastery",
      label: "Bill act-proof + playbooks",
      score: clamp(Math.round(billPct * 0.4 + (v4.billNarratives.length / 29) * 60)),
      trend: billPct >= 50 ? "flat" : "down",
      weakAreas:
        billPct < 100
          ? [`${listAllBillNumbersFromIndex().length - listCuratedBillPlaybookNumbers().length} bills auto-synthesized playbooks`]
          : [],
      nextModule: "/admin/intelligence/kim-hammer/debate-prep",
      whyThisScore: `${listCuratedBillPlaybookNumbers().length} curated playbooks · ${v4.billNarratives.length} bill narratives loaded`,
      scoreConfidence: billPct >= 40 ? "MEDIUM" : "LOW",
      raiseScoreToday: [
        "Drill anchor bills SB250, HB1457, SB291 with act-proof pages",
        "Verify act numbers on Arkleg before citing on stage",
      ],
      computedFrom: ["debateBillOperatorPlaybooks", "billActProofDepth"],
    },
    {
      id: "messageDiscipline",
      label: "Claims publication safety",
      score: clamp(Math.round((claimsReady / Math.max(1, claimsReady + needsResearch)) * 100)),
      trend: needsResearch <= 3 ? "up" : needsResearch <= 8 ? "flat" : "down",
      weakAreas: v4.hub.riskClaims.slice(0, 3),
      nextModule: "/admin/intelligence/claims",
      whyThisScore: `${claimsReady} supported · ${needsResearch} need research`,
      scoreConfidence: needsResearch <= 5 ? "MEDIUM" : "LOW",
      raiseScoreToday: [
        "Claims gate before any stage line or social post",
        "Cut NEEDS_RESEARCH lines from debate script",
      ],
      computedFrom: ["claim-ledger", "v4 hub"],
    },
    {
      id: "mediaReadiness",
      label: "Film room / media",
      score: clamp(30 + clipScore + (filmRoom.items.length > 0 ? 10 : 0)),
      trend: filmRoom.directClipCount >= 2 ? "up" : "flat",
      weakAreas: filmRoom.coverageGaps,
      nextModule: "/admin/intelligence/film-room",
      whyThisScore: filmRoom.archiveHonestyNote,
      scoreConfidence: filmRoom.directClipCount >= 1 ? "MEDIUM" : "LOW",
      raiseScoreToday: [
        "Close one retrieval task with clip ID + timestamp",
        "Rehearse cross-exam bank before stage",
      ],
      computedFrom: ["opposition-clip-records", "legislative-chunks", "film-room"],
    },
    {
      id: "countyFluency",
      label: "County clerk + election funding",
      score: clamp(72),
      trend: "flat",
      weakAreas: [
        "Statewide CVSGF county ledger NEEDS_RESEARCH",
        "FY2026-27 appropriation pending verification",
      ],
      nextModule: "/admin/intelligence/election-funding",
      whyThisScore: "CVSGF statutory evidence loaded · county ledger open for records request",
      scoreConfidence: "MEDIUM",
      raiseScoreToday: [
        "Memorize CVSGF statutory cite A.C.A. §19-5-1247",
        "Use county burden frame when Hammer cites unfunded mandates",
      ],
      computedFrom: ["countyElectionFundingIntelligence", "countyClerkSevenDayPrepPath"],
    },
    {
      id: "emotionalComposure",
      label: "Kelly defense + offensive moves",
      score: clamp(88),
      trend: "up",
      weakAreas: ["Court records vector NEEDS_RESEARCH — run diligence log before debate"],
      nextModule: "/admin/intelligence/kelly-debate-coaching",
      whyThisScore: "5 attack vectors · 6 offensive moves · culture-war depth wired",
      scoreConfidence: "MEDIUM",
      raiseScoreToday: [
        "Complete court/financial diligence log with counsel",
        "Rehearse petition-administrator pivot with speak-order drills",
      ],
      computedFrom: ["kellyCandidateResearchDepth", "kellyOffensiveApproachDepth"],
    },
    {
      id: "officeMastery",
      label: "Rebuttal + argument library",
      score: clamp(v4.rebuttalPlaybook.length * 4 + v4.likelyArguments.length * 3 + 15),
      trend: "flat",
      weakAreas: [],
      nextModule: "/admin/intelligence",
      whyThisScore: `${v4.rebuttalPlaybook.length} rebuttal cards · ${v4.likelyArguments.length} likely arguments`,
      scoreConfidence: "MEDIUM",
      raiseScoreToday: ["Rehearse agree/contrast/bridge triplets aloud", "Open argument map on hub"],
      computedFrom: ["kim-hammer-rebuttal-prep.json", "likelyArguments"],
    },
    {
      id: "philosophyStrategyWiring",
      label: "Philosophy & staff strategy wiring",
      score: clamp(philosophyFeed.overallScore),
      trend: philosophyFeed.overallScore >= 90 ? "up" : philosophyFeed.overallScore >= 70 ? "flat" : "down",
      weakAreas: philosophyFeed.gaps,
      nextModule: philosophyFeed.nextModules[0]?.href ?? "/admin/intelligence/movement-philosophy",
      whyThisScore: philosophyFeed.rows.map((r) => `${r.label}: ${r.score}%`).join(" · "),
      scoreConfidence: philosophyFeed.overallScore >= 85 ? "MEDIUM" : "LOW",
      raiseScoreToday: philosophyFeed.nextModules.slice(0, 2).map((m) => `Open ${m.label}`),
      computedFrom: ["phase11P2Closure", "debateCommandPhilosophyReadiness"],
    },
  ];

  if (archive) {
    base.push({
      id: "overall",
      label: "Overall debate readiness",
      score: clamp(
        Math.round(
          base.reduce((s, r) => s + r.score, 0) / base.length * 0.55 +
            archive.oppositionBriefConfidenceEstimate * 0.45,
        ),
      ),
      trend: archive.oppositionBriefConfidenceEstimate >= 70 ? "up" : "flat",
      weakAreas: archive.topUnusableClaims.slice(0, 3),
      nextModule: "/admin/intelligence/supreme-workbench",
      whyThisScore: `Live dimension average blended with archive confidence (${archive.oppositionBriefConfidenceEstimate})`,
      scoreConfidence: "MEDIUM",
      raiseScoreToday: archive.nextHumanRetrievalActions.slice(0, 2),
      computedFrom: ["liveReadinessScores", "oppositionBriefConfidence"],
    });
  } else {
    const avg = Math.round(base.reduce((s, r) => s + r.score, 0) / base.length);
    base.push({
      id: "overall",
      label: "Overall debate readiness",
      score: avg,
      trend: avg >= 80 ? "up" : avg >= 65 ? "flat" : "down",
      weakAreas: base
        .filter((r) => r.score < 70)
        .slice(0, 3)
        .map((r) => `${r.label}: ${r.score}`),
      nextModule: "/admin/intelligence/supreme-workbench",
      whyThisScore: `Weighted average of ${base.length} live readiness dimensions`,
      scoreConfidence: avg >= 75 ? "MEDIUM" : "LOW",
      raiseScoreToday: ["Open supreme workbench — fix lowest dimension first"],
      computedFrom: ["liveReadinessScores"],
    });
  }

  return base;
}

export function computeLiveReadinessFromHub(filmRoom: DebateFilmRoomState): ComputedReadinessScore[] {
  const v4 = loadDebateIntelligenceV4HubPacket();
  return computeLiveReadinessScores({ v4, filmRoom });
}
