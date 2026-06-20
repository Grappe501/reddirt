/**
 * Enrolled act sections — full statutory text from Arkleg PDFs + debate analysis.
 */
import fs from "node:fs";
import path from "node:path";

import type { V3BillNarrative } from "@/lib/intelligence/v3/debateIntelligenceV3Types";

export type BillEnrolledSectionRaw = {
  sectionNumber: number;
  heading: string;
  statutoryText: string;
};

export type BillEnrolledSectionAnalysis = BillEnrolledSectionRaw & {
  plainEnglish: string;
  kellyFrame: string;
  hammerLikelyClaim: string;
  countyImpact: string;
  debateMove: string;
  claimsGate: string;
};

export type BillEnrolledActRecord = {
  billNumber: string;
  actNumber: string;
  sessionFolder: string;
  arklegActPdfUrl: string;
  extractionStatus: string;
  sections: BillEnrolledSectionAnalysis[];
};

type EnrolledSectionsFile = {
  bills: Array<{
    billNumber: string;
    actNumber: string;
    sessionFolder: string;
    arklegActPdfUrl: string;
    extractionStatus: string;
    sections: BillEnrolledSectionRaw[];
  }>;
};

let cache: Map<string, BillEnrolledActRecord> | null = null;

function loadRawByBill(): Map<string, BillEnrolledActRecord> {
  if (cache) return cache;
  const abs = path.join(process.cwd(), "data/opposition/kim-hammer-bill-enrolled-sections.json");
  try {
    const file = JSON.parse(fs.readFileSync(abs, "utf8")) as EnrolledSectionsFile;
    cache = new Map(
      file.bills.map((b) => [
        b.billNumber.toUpperCase(),
        {
          ...b,
          sections: b.sections.map((s) => ({
            ...s,
            plainEnglish: "",
            kellyFrame: "",
            hammerLikelyClaim: "",
            countyImpact: "",
            debateMove: "",
            claimsGate: "",
          })),
        },
      ]),
    );
  } catch {
    cache = new Map();
  }
  return cache;
}

function firstSentence(text: string, max = 220): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^(.{40,}?[.!?])(?:\s|$)/);
  const base = match?.[1] ?? cleaned.slice(0, max);
  return base.length > max ? `${base.slice(0, max - 1)}…` : base;
}

function detectThemes(text: string): string[] {
  const lower = text.toLowerCase();
  const themes: string[] = [];
  if (/petition|canvass|initiative|referendum|ballot title/.test(lower)) themes.push("petition");
  if (/absentee|mail[- ]?in|designated bearer/.test(lower)) themes.push("absentee");
  if (/precinct|polling|vote center|polling site/.test(lower)) themes.push("geography");
  if (/foia|public record|freedom of information|ballot.*inspect/.test(lower)) themes.push("transparency");
  if (/misdemeanor|felony|penalt|criminal|offense/.test(lower)) themes.push("enforcement");
  if (/county clerk|county board|election commissioner|poll worker/.test(lower)) themes.push("county");
  if (/secretary of state|state board of election/.test(lower)) themes.push("sos");
  if (/paper ballot|tabulat|voting equipment|marking/.test(lower)) themes.push("equipment");
  if (/poll watcher|election monitor/.test(lower)) themes.push("observers");
  if (/hotline|complaint/.test(lower)) themes.push("complaints");
  return themes;
}

function enrichSection(
  section: BillEnrolledSectionRaw,
  narrative: V3BillNarrative | undefined,
  actNumber: string,
): BillEnrolledSectionAnalysis {
  const themes = detectThemes(`${section.heading} ${section.statutoryText}`);
  const cite = section.heading.match(/Arkansas Code §[^,]+/)?.[0] ?? `Section ${section.sectionNumber}`;

  const plainEnglish = (() => {
    if (themes.includes("enforcement")) {
      return `This section adds or tightens criminal or civil penalties tied to election conduct (${cite}). Read who is barred, what triggers a violation, and whether poll workers must enforce new boundaries.`;
    }
    if (themes.includes("petition")) {
      return `This section changes initiative or referendum petition rules (${cite}) — typically adding steps canvassers or counties must follow before signatures count.`;
    }
    if (themes.includes("absentee")) {
      return `This section alters absentee ballot application or return deadlines and methods (${cite}). Clerks reprogram workflows; voters face new cutoffs.`;
    }
    if (themes.includes("transparency")) {
      return `This section limits or conditions public access to election records (${cite}). Transparency advocates and clerks interpret FOIA scope differently.`;
    }
    if (themes.includes("geography")) {
      return `This section governs where voting happens — precincts, polling sites, or vote centers (${cite}). Site changes affect rural drive time and clerk logistics.`;
    }
    if (themes.includes("county")) {
      return `This section assigns new duties to county clerks, election boards, or poll workers (${cite}) — often without stating funding in the same paragraph.`;
    }
    if (themes.includes("equipment")) {
      return `This section changes ballot handling, marking, or tabulation procedures (${cite}). Counties need equipment training and secure chain-of-custody updates.`;
    }
    return `Statutory change at ${cite}: ${firstSentence(section.statutoryText, 180)}`;
  })();

  const hammerLikelyClaim = (() => {
    if (themes.includes("enforcement")) return "We needed teeth so bad actors face consequences — this protects election integrity.";
    if (themes.includes("petition")) return "Petition fraud is real; these guardrails stop out-of-state operators from gaming the ballot.";
    if (themes.includes("absentee")) return "We secured absentee voting so only lawful voters return ballots.";
    if (themes.includes("transparency")) return "We protected ballot secrecy while still allowing proper oversight.";
    if (themes.includes("geography")) return "Local officials know best where safe, efficient voting should happen.";
    if (themes.includes("equipment")) return "Paper ballots and clear procedures restore confidence after 2020.";
    return narrative?.debateFrames.hammerFrame ?? "I'm proud of this bill — it keeps elections secure.";
  })();

  const countyImpact = (() => {
    if (themes.includes("county") || themes.includes("geography") || themes.includes("absentee")) {
      return narrative?.countyImpactNarrative ?? "County election staff absorb new procedures, training, and voter questions — often without a dedicated state funding line in the same act.";
    }
    if (themes.includes("petition")) {
      return "County clerks and petition sponsors verify additional paperwork; volunteer circulators face new criminal exposure.";
    }
    if (themes.includes("enforcement")) {
      return "Poll workers and prosecutors interpret expanded misdemeanor language — uneven enforcement across 75 counties risks confusion.";
    }
    return "Voters experience this as new rules at the polling place or clerk's office — implementation speed depends on SOS guidance and county budgets.";
  })();

  const kellyFrame =
    narrative?.debateFrames.kellyFrame ??
    "Security and access together — the SOS job is publishing clear rules and funding county implementation.";

  const debateMove = (() => {
    if (themes.includes("county") || themes.includes("absentee") || themes.includes("geography")) {
      return `Ask Hammer: "When Act ${actNumber} took effect, what training dollars and SOS guidance went to county clerks for ${cite}?"`;
    }
    if (themes.includes("petition")) {
      return "Honor lawful petition rights — pivot to SOS administering transparent rules for every county, not stacking friction without implementation support.";
    }
    if (themes.includes("transparency")) {
      return "Transparency means rules voters can read — contrast opacity for the public with clerk confusion about what records can be released.";
    }
    return `Anchor on enrolled text (${cite}), then bridge: author vs administrator — clerks implement what legislators pass.`;
  })();

  const claimsGate =
    themes.includes("enforcement") || themes.includes("petition")
      ? "Do not quote specific penalties, fraud counts, or criminal thresholds on stage until staff verifies this section against enrolled PDF."
      : "Statutory text is from enrolled PDF extract — confirm no amendments before broadcast citation.";

  return {
    ...section,
    plainEnglish,
    kellyFrame,
    hammerLikelyClaim,
    countyImpact,
    debateMove,
    claimsGate,
  };
}

export function loadHammerBillEnrolledAct(
  billNumber: string,
  narrative?: V3BillNarrative,
): BillEnrolledActRecord | null {
  const raw = loadRawByBill().get(billNumber.toUpperCase());
  if (!raw || raw.sections.length === 0) return null;

  return {
    ...raw,
    sections: raw.sections.map((s) =>
      enrichSection(s, narrative, raw.actNumber),
    ),
  };
}

export function listHammerBillsWithEnrolledSections(): string[] {
  return [...loadRawByBill().keys()].sort();
}

export function hasHammerBillEnrolledSections(billNumber: string): boolean {
  const row = loadRawByBill().get(billNumber.toUpperCase());
  return Boolean(row?.sections?.length);
}
