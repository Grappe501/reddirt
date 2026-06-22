/**
 * Kelly-facing opposition brief — export-ready Hammer lines, top rebuttals, Pakko respect frames.
 */
import { OPPOSITION_RESEARCH_RELEASE_VERSION } from "@/lib/election-plan/opposition-research-release";
import {
  EP_DEBATE_PREP_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_OPPOSITION_DEBATE_NIGHT_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
  epOpponentBioHref,
  epOppositionResearchModuleHref,
} from "@/lib/election-plan/debate-prep-links";
import { getOpponentBio } from "@/lib/election-plan/opponentBioDrillDown";
import { loadMichaelPackoCandidateDossier } from "@/lib/intelligence/v4/loadOpponentCandidateDossier";
import { loadMichaelPackoQuotes } from "@/lib/intelligence/opponents/loadMichaelPackoQuotes";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";

export type OppositionExportLine = {
  id: string;
  topic: string;
  claim: string;
  kellyUse: string;
};

export type OppositionHammerRebuttal = {
  topic: string;
  likelyHammerArgument: string;
  kellyResponseFrame: string;
  bridgeLine: string;
  answer30: string;
  avoid: string;
};

export type OppositionPakkoRespectLine = {
  id: string;
  topic: string;
  quoteText: string;
  kellyResponseFrame: string;
  doNotMisquote?: string | null;
};

export type OppositionReadingPath = {
  id: string;
  label: string;
  minutes: number;
  href: string;
  audience: "kelly" | "staff";
  steps: string[];
};

export type OppositionResearchCandidateBrief = {
  releaseVersion: string;
  kellyOneLiner: string;
  threeWayGeometry: string;
  exportReadyLines: OppositionExportLine[];
  topHammerRebuttals: OppositionHammerRebuttal[];
  pakkoRespectLines: OppositionPakkoRespectLine[];
  pakkoExecutiveSummary: string;
  hammerDoNotSay: string[];
  pakkoDoNotSay: string[];
  hammerMemoryLines: string[];
  pakkoMemoryLines: string[];
  readingPaths: OppositionReadingPath[];
  stats: {
    exportReadyClaimCount: number;
    hammerBillCount: number;
    pakkoQuoteCount: number;
    reviewNeededClaimCount: number;
  };
};

const HAMMER_KELLY_USE: Record<string, string> = {
  "pdeb-001-election-integrity-record":
    "Acknowledge security goal — pivot to SOS administrator job: county ledger, training calendar, clerk hotline.",
  "pdeb-003-debate-question-patterns":
    "Expect election confidence + voter access + business services — prep 30s answers in each bucket before stage.",
};

export function loadOppositionResearchCandidateBrief(): OppositionResearchCandidateBrief {
  const evidence = loadKimHammerEvidenceIndex();
  const kh2 = loadKimHammerKh2Workbench();
  const hammerElection = loadKimHammerWorkbench();
  const pakkoQuotes = loadMichaelPackoQuotes();
  const pakkoDossier = loadMichaelPackoCandidateDossier();
  const hammerBio = getOpponentBio("kim-hammer")!;
  const pakkoBio = getOpponentBio("michael-packo")!;

  const exportReadyLines: OppositionExportLine[] = evidence.exportReadyClaims.map((c) => ({
    id: c.id,
    topic: c.topic ?? c.id,
    claim: c.claim ?? c.text ?? "",
    kellyUse: HAMMER_KELLY_USE[c.id] ?? "Staff-verified line — use bridge to administrator frame, not pile-on.",
  }));

  const topHammerRebuttals: OppositionHammerRebuttal[] = kh2.debateProfile.entries.map((e) => ({
    topic: e.topic.replaceAll("_", " "),
    likelyHammerArgument: e.likelyHammerArgument,
    kellyResponseFrame: e.kellyResponseFrame,
    bridgeLine: e.bridgeLine,
    answer30: e.answer30,
    avoid: e.riskyPhrasingToAvoid,
  }));

  for (const r of kh2.rebuttalPrep.rebuttals.slice(0, 5)) {
    if (topHammerRebuttals.length >= 5) break;
    topHammerRebuttals.push({
      topic: r.prompt,
      likelyHammerArgument: r.contrastMethod,
      kellyResponseFrame: r.agreeWhereValid,
      bridgeLine: r.kellyBridge,
      answer30: `${r.agreeWhereValid} ${r.kellyBridge}`,
      avoid: "Unverified bill stats or motive attacks — check claims ledger.",
    });
  }

  const pakkoRespectLines: OppositionPakkoRespectLine[] = pakkoQuotes.quotes.map((q) => ({
    id: q.id,
    topic: q.topic.replaceAll("_", " "),
    quoteText: q.quoteText,
    kellyResponseFrame: q.kellyResponseFrame ?? "Respect reform instinct — add county implementation detail Kelly owns.",
    doNotMisquote: q.doNotMisquote,
  }));

  const readingPaths: OppositionReadingPath[] = [
    {
      id: "debate-night",
      label: "Debate night card",
      minutes: 5,
      href: EP_OPPOSITION_DEBATE_NIGHT_HREF,
      audience: "kelly",
      steps: [
        "Read export-ready lines + top 3 Hammer rebuttals",
        "Memorize one Pakko respect line",
        "Scan do-not-say list",
      ],
    },
    {
      id: "bios-lock",
      label: "Opponent bios — memory lines",
      minutes: 15,
      href: EP_OPPONENT_BIOS_HREF,
      audience: "kelly",
      steps: [
        "Hammer memory lines (5 min)",
        "Pakko memory lines + respect pivot (5 min)",
        "Three-way rules — no pile-on (5 min)",
      ],
    },
    {
      id: "hammer-deep",
      label: "Hammer dossier skim",
      minutes: 30,
      href: epOpponentBioHref("kim-hammer"),
      audience: "kelly",
      steps: [
        "Command mode + debate tells",
        "Dossier sections marked HIGH debate use",
        "Optional: debate profile module for full rebuttal bank",
      ],
    },
    {
      id: "staff-packet",
      label: "Staff research packet",
      minutes: 45,
      href: EP_OPPOSITION_RESEARCH_HREF,
      audience: "staff",
      steps: [
        "Claims ledger — verify before Kelly rehearses new lines",
        "Bill index + 2025 direct democracy cluster",
        "Pakko quotes + contrast gate",
      ],
    },
    {
      id: "debate-prep",
      label: "Debate prep hub",
      minutes: 0,
      href: EP_DEBATE_PREP_HREF,
      audience: "kelly",
      steps: ["Return to Day 2–7 pathways after opposition skim"],
    },
  ];

  return {
    releaseVersion: OPPOSITION_RESEARCH_RELEASE_VERSION,
    kellyOneLiner:
      "Hammer wrote the bills — Kelly runs the office clerks depend on. Pakko wants reform — Kelly adds implementation. Export-ready lines only; everything else stays internal until staff verifies.",
    threeWayGeometry:
      "Three-way rule: respect Pakko on stage (never ask him to vote for Kelly); contrast Hammer on administrator vs author without attacking rural GOP voters; Kelly owns direct democracy, transparency, and clerk-service implementation.",
    exportReadyLines,
    topHammerRebuttals,
    pakkoRespectLines,
    pakkoExecutiveSummary: pakkoDossier.executiveSummary,
    hammerDoNotSay: hammerBio.doNotSay.slice(0, 8),
    pakkoDoNotSay: pakkoBio.doNotSay.slice(0, 8),
    hammerMemoryLines: hammerBio.memoryLines.map((m) => m.text),
    pakkoMemoryLines: pakkoBio.memoryLines.map((m) => m.text),
    readingPaths,
    stats: {
      exportReadyClaimCount: evidence.metrics.exportReadyClaims,
      hammerBillCount: hammerElection.bills.length,
      pakkoQuoteCount: pakkoQuotes.quotes.length,
      reviewNeededClaimCount: evidence.metrics.reviewNeededClaims,
    },
  };
}
