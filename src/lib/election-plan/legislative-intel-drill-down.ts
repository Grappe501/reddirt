/**
 * Kelly-facing legislative intelligence — 2021 integrity package & 2025 direct democracy cluster.
 * Sourced from opposition research JSON + Arkleg enrollment records (verify before stage).
 */
import {
  INTEGRITY_2021_PACKAGE_DEPTH,
  PETITION_2025_CLUSTER_DEPTH,
} from "@/lib/intelligence/v4/integrityPackageDepth";
import { loadKimHammerIntegrityFoundation2021 } from "@/lib/opposition/kimHammerLegislativeNarratives";
import {
  EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF,
  epLegislativeIntel2021Href,
  epLegislativeIntel2025Href,
  epOppositionResearchModuleHref,
  epTrapLaneHref,
} from "@/lib/election-plan/debate-prep-links";

export type LegislativeIntelBillCard = {
  billNumber: string;
  actNumber: string;
  theme: string;
  clerkImpact: string;
  arklegUrl?: string;
};

export type LegislativeIntelPage = {
  id: string;
  pageSummary: string;
  title: string;
  subtitle: string;
  plainEnglish: string;
  narrativePoints: string[];
  bills: LegislativeIntelBillCard[];
  hammerLikelySays: string;
  kellyPivot: string;
  practiceLines: string[];
  debateQuestion: string;
  whenToUse: string;
  doNotSay: string[];
  relatedHrefs: Array<{ href: string; label: string }>;
};

export function getLegislativeIntel2021Page(): LegislativeIntelPage {
  const pkg = INTEGRITY_2021_PACKAGE_DEPTH;
  const detail = loadKimHammerIntegrityFoundation2021();

  const bills: LegislativeIntelBillCard[] = pkg.billAnchors.map((b, i) => ({
    billNumber: b.billNumber,
    actNumber: String(b.actNumber),
    theme: b.theme,
    clerkImpact: b.clerkImpact,
    arklegUrl: b.arklegUrl,
  }));

  return {
    id: "2021-integrity",
    pageSummary:
      "Hammer sponsored six major election bills in 2021 — before the 2025 petition fights. Your answer: secure elections yes, but counties need funding and lead time to implement what legislators pass.",
    title: "2021 election integrity package",
    subtitle: "Acts 727–729, 973–974, 1051 · Kim Hammer primary sponsor",
    plainEnglish: pkg.plainEnglishSummary,
    narrativePoints: pkg.narrativeArc,
    bills,
    hammerLikelySays: pkg.debateTrap.baitLine,
    kellyPivot: pkg.debateTrap.kellyPivot,
    practiceLines: [
      "I want secure elections too — the question is whether counties got support when those rules changed.",
      "Integrity without implementation is an unfunded mandate on our clerks.",
      pkg.kellyMessageHelp,
      `Setup question: ${pkg.debateTrap.setupQuestion}`,
    ],
    debateQuestion: pkg.debateTrap.setupQuestion,
    whenToUse: detail.strategicBriefing.whenToUse.join(" "),
    doNotSay: [
      pkg.whenNotToUse,
      ...(Array.isArray(detail.strategicBriefing.whenNotToUse)
        ? detail.strategicBriefing.whenNotToUse
        : [detail.strategicBriefing.whenNotToUse]),
      "Stolen election framing",
      "Fraud without evidence",
    ].filter(Boolean) as string[],
    relatedHrefs: [
      { href: epLegislativeIntel2025Href(), label: "2025 direct democracy bills" },
      { href: epTrapLaneHref("2021-vs-2025-pivot"), label: "Trap lane · 2021 vs 2025" },
      { href: epOppositionResearchModuleHref("integrity-foundation-2021"), label: "Full opposition dossier" },
      { href: `${EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF}/2021-integrity-package`, label: "Election law study" },
    ],
  };
}

export function getLegislativeIntel2025Page(): LegislativeIntelPage {
  const cluster = PETITION_2025_CLUSTER_DEPTH;

  const bills: LegislativeIntelBillCard[] = cluster.billAnchors.map((b) => ({
    billNumber: b.billNumber,
    actNumber: b.actNumber ?? "verify",
    theme: b.theme,
    clerkImpact: "Adds petition-process steps counties and ballot committees must administer.",
  }));

  return {
    id: "2025-direct-democracy",
    pageSummary:
      "Hammer's 2025 bills add friction to ballot initiatives — not a fresh start, but a continuation of his 2021 election-law architecture. Honor Arkansas direct democracy; contrast legislator stacking rules vs SOS helping counties implement fairly.",
    title: "2025 direct democracy / petition bills",
    subtitle: "Acts 218, 240, 241, 274, 768 · petition & initiative cluster",
    plainEnglish: cluster.plainEnglishSummary,
    narrativePoints: [
      cluster.hammerExpectedFrame,
      cluster.kellyOffensiveLead,
      cluster.packoAngle,
      "Continuity from 2021 enforcement and county-control bills — not a one-year pivot.",
      "SOS role: certify on deadline, publish clear ballot language, treat every petitioner the same.",
    ],
    bills,
    hammerLikelySays: cluster.hammerExpectedFrame,
    kellyPivot: cluster.kellyOffensiveLead,
    practiceLines: [
      cluster.kellyOffensiveLead,
      "Arkansas voters cherish ballot measures — I'll protect lawful signatures with transparent rules, not slogans.",
      "You sponsored six election bills in 2021 and another petition package in 2025 — what changed for county clerks besides more paperwork?",
      "Courts resolve fights; the Secretary of State administers the process in daylight.",
    ],
    debateQuestion:
      "Senator, you sponsored a major election package in 2021 and petition bills in 2025 — what changed for a county clerk between those two moments?",
    whenToUse: "Direct democracy questions, petition access, ballot title disputes, Hammer 'fraud prevention' framing.",
    doNotSay: [
      "Anti-petition or anti-democracy framing",
      "Claim specific fraud counts without sourced data",
      "Act numbers on stage without Arkleg verification",
    ],
    relatedHrefs: [
      { href: epLegislativeIntel2021Href(), label: "2021 integrity package" },
      { href: epTrapLaneHref("2021-vs-2025-pivot"), label: "Trap lane · 2021 vs 2025" },
      { href: epOppositionResearchModuleHref("direct-democracy"), label: "Opposition dossier" },
      { href: `${EP_FORUM_LAB_ELECTION_LAW_STUDY_HREF}/2025-direct-democracy-cluster`, label: "Election law study" },
    ],
  };
}

export function listLegislativeIntelPages(): LegislativeIntelPage[] {
  return [getLegislativeIntel2021Page(), getLegislativeIntel2025Page()];
}
