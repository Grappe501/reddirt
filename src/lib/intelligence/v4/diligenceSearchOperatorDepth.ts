/**
 * Phase 2 — Operator prose for each diligence search row.
 * Pre-filled instructions even when result is NOT_SEARCHED.
 */
import type { OpponentDiligenceLogFile } from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

export type DiligenceSearchOperatorGuide = {
  entryId: string;
  subjectId: OpponentDiligenceLogFile["subjectId"];
  headline: string;
  howToRun: string[];
  whatToLog: string;
  counselTrigger: string;
  incompletePivot: string;
  fieldBookSlug: string;
  relatedRoute?: { href: string; label: string };
};

const SEARCH_IDS = [
  "courtconnect-civil",
  "courtconnect-criminal",
  "ucc-liens",
  "business-entity",
  "property-tax",
] as const;

function guideKey(subjectId: OpponentDiligenceLogFile["subjectId"], entryId: string): string {
  return `${subjectId}:${entryId}`;
}

const GUIDES: Record<string, DiligenceSearchOperatorGuide> = {};

function addGuide(g: DiligenceSearchOperatorGuide) {
  GUIDES[guideKey(g.subjectId, g.entryId)] = g;
}

const CIVIL_HOW = [
  "Open Arkansas CourtConnect (AOC) at the state judiciary portal. Search by full legal name plus common variants (maiden, middle initial, LLC officer listings).",
  "Run all-county civil, probate, and domestic-relations dockets. Screenshot or export case numbers only — do not paste party narratives into public notes.",
  "If multiple hits: log each case number in the notes field with disposition (open/closed). Mark IN_PROGRESS until all counties checked.",
];

const CRIMINAL_HOW = [
  "Same CourtConnect session — switch to criminal docket search. Search full name across all counties where the candidate has lived or registered a business.",
  "Log case numbers and disposition only. Do not speculate on relevance in notes — factual status + counsel flag if any open matter.",
  "If zero hits after all counties: mark CLEAN, add initials, set dateSearched to today (ISO date in log).",
];

const UCC_HOW = [
  "Arkansas Secretary of State UCC filing search — search individual name and any known business entities (Forevermost, campaign LLCs, related DBAs).",
  "Document filing numbers and secured-party names factually. Farm/equipment liens are common — they are not automatically attack lines.",
  "Cross-link public brief modules in notes when the filing ties to a verified campaign narrative (e.g. small-business survival frame).",
];

const ENTITY_HOW = [
  "Arkansas SOS business entity search — verify good standing for each LLC/corp tied to the subject. Note agent, status, and dissolution dates.",
  "Whisper campaigns often cite 'inactive' entities — confirm against SOS primary record before any response.",
  "Log entity file numbers in notes. Mark HIT_REQUIRES_COUNSEL if status is not good standing or if foreign registration gaps appear.",
];

const PROPERTY_HOW = [
  "County assessor portals for Faulkner and any county with campaign-relevant parcels (residence, business property). Check tax delinquency and lien status.",
  "Campaign-relevant parcels only — do not log unrelated family property or PII beyond what counsel approves.",
  "If delinquency exists: counsel review mandatory before any debate-stage line. Never cite parcel IDs on air.",
];

const KELLY_INCOMPLETE = "I am running to run the Secretary of State's office for every voter.";
const HAMMER_INCOMPLETE = "Use verified legislative record and public statements — not court speculation.";
const PAKKO_INCOMPLETE = "Acknowledge reform goals; pivot to SOS implementation. No personal attack until contrast gate open.";

for (const entryId of SEARCH_IDS) {
  const civil = entryId === "courtconnect-civil";
  const criminal = entryId === "courtconnect-criminal";
  const ucc = entryId === "ucc-liens";
  const entity = entryId === "business-entity";
  const property = entryId === "property-tax";

  addGuide({
    entryId,
    subjectId: "kelly-grappe",
    headline: civil
      ? "Defensive civil search — Kelly Grappe"
      : criminal
        ? "Defensive criminal search — Kelly Grappe"
        : ucc
          ? "UCC / lien search — Kelly + Forevermost"
          : entity
            ? "Business entity standing — Forevermost"
            : "Property tax — campaign-relevant parcels",
    howToRun: civil ? CIVIL_HOW : criminal ? CRIMINAL_HOW : ucc ? UCC_HOW : entity ? ENTITY_HOW : PROPERTY_HOW,
    whatToLog:
      "Case/file numbers, disposition, date searched, staff initials. Debate stage line only after counselReviewed on hits.",
    counselTrigger: "Any open civil/criminal matter, UCC filing tied to attack narrative, bad entity standing, or tax delinquency.",
    incompletePivot: KELLY_INCOMPLETE,
    fieldBookSlug: "kelly-five-search-checklist",
    relatedRoute: { href: "/admin/intelligence/kelly-debate-coaching", label: "Kelly debate coaching" },
  });

  addGuide({
    entryId,
    subjectId: "kim-hammer",
    headline: civil
      ? "Offensive civil search — Kim Hammer"
      : criminal
        ? "Offensive criminal search — Kim Hammer"
        : ucc
          ? "UCC / lien search — Hammer entities"
          : entity
            ? "Business entity standing — Hammer-linked corps"
            : "Property tax — campaign-relevant parcels",
    howToRun: civil ? CIVIL_HOW : criminal ? CRIMINAL_HOW : ucc ? UCC_HOW : entity ? ENTITY_HOW : PROPERTY_HOW,
    whatToLog:
      "Factual findings only. Pair civil hits with legislative record modules before contrast framing. Optional PACER note if interstate litigation suspected.",
    counselTrigger: "Any filing you would cite on stage or in a contrast ad — counsel must review and approve debateStageLine.",
    incompletePivot: HAMMER_INCOMPLETE,
    fieldBookSlug: "hammer-diligence-checklist",
    relatedRoute: { href: "/admin/intelligence/kim-hammer", label: "Hammer command center" },
  });

  addGuide({
    entryId,
    subjectId: "michael-packo",
    headline: civil
      ? "Contrast civil search — Michael Pakko"
      : criminal
        ? "Contrast criminal search — Michael Pakko"
        : ucc
          ? "UCC / lien search — Pakko entities"
          : entity
            ? "Business entity standing — Pakko-linked corps"
            : "Property tax — campaign-relevant parcels",
    howToRun: civil ? CIVIL_HOW : criminal ? CRIMINAL_HOW : ucc ? UCC_HOW : entity ? ENTITY_HOW : PROPERTY_HOW,
    whatToLog:
      "Same five-search protocol. Contrast gate (PACKO-01/02) is separate — finance/quote ledger must be PARTIAL before attack framing.",
    counselTrigger: "Court hits plus open contrast gate still require counsel on any stage line referencing filings.",
    incompletePivot: PAKKO_INCOMPLETE,
    fieldBookSlug: "pakko-diligence-checklist",
    relatedRoute: { href: "/admin/intelligence/opponents/michael-packo", label: "Pakko command center" },
  });
}

export function getDiligenceSearchOperatorGuide(
  subjectId: OpponentDiligenceLogFile["subjectId"],
  entryId: string,
): DiligenceSearchOperatorGuide | undefined {
  return GUIDES[guideKey(subjectId, entryId)];
}

export function allDiligenceSearchOperatorGuides(): DiligenceSearchOperatorGuide[] {
  return Object.values(GUIDES);
}

export function diligenceOperatorGuideCoveragePct(): number {
  const expected = 3 * SEARCH_IDS.length;
  const withProse = allDiligenceSearchOperatorGuides().filter(
    (g) => g.howToRun.length >= 3 && g.whatToLog.length > 40,
  ).length;
  return Math.round((withProse / expected) * 100);
}
