/**
 * Index-driven bill operator playbooks — curates remaining bills from KH-0B bill index.
 * Manual anchors in debateBillOperatorPlaybooks.ts take precedence.
 */
import fs from "node:fs";
import path from "node:path";
import type { BillOperatorPlaybook, PlaybookStep, TrapSetup } from "@/lib/intelligence/v4/debateOperatorPlaybookTypes";

type IndexRow = {
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  title: string;
  topicCategory?: string[];
  hammerRole?: string;
  plainEnglishSummary?: string;
  keyProvisions?: string[];
  legislativePackageId?: string | null;
  confidenceLevel?: string;
};

let indexCache: IndexRow[] | null = null;

function loadIndexRows(): IndexRow[] {
  if (indexCache) return indexCache;
  const abs = path.join(process.cwd(), "data/opposition/kim-hammer-election-record-bill-index.json");
  const raw = JSON.parse(fs.readFileSync(abs, "utf8")) as { rows: IndexRow[] };
  indexCache = raw.rows;
  return indexCache;
}

function primaryTheme(row: IndexRow): string {
  const cats = row.topicCategory ?? [];
  if (cats.some((c) => c.includes("petition") || c.includes("direct_democracy"))) return "petition";
  if (cats.some((c) => c.includes("enforcement"))) return "enforcement";
  if (cats.some((c) => c.includes("county_election"))) return "county";
  if (cats.some((c) => c.includes("absentee"))) return "absentee";
  if (cats.some((c) => c.includes("write_ins") || c.includes("ballot_access"))) return "access";
  if (cats.some((c) => c.includes("voting_equipment") || c.includes("paper_ballot"))) return "equipment";
  if (cats.some((c) => c.includes("secretary_of_state"))) return "sos";
  return "general";
}

function whatDetail(row: IndexRow): string {
  const summary =
    row.plainEnglishSummary ??
    row.keyProvisions?.[0] ??
    row.title.replace(/^TO /i, "").slice(0, 200);
  const act = row.actNumber ? ` (Act ${row.actNumber})` : "";
  const role = row.hammerRole === "co-sponsor" ? " — Hammer co-sponsor" : "";
  return `${row.billNumber}${act}: ${summary}${role}. Verify enrolled act on Arkleg before stage cite.`;
}

function countyImpact(row: IndexRow, theme: string): string {
  switch (theme) {
    case "petition":
      return "Tighter petition rules land on volunteer circulators and county verification staff — not abstract Capitol virtue.";
    case "enforcement":
      return "Expanded enforcement chills participation — clerks and prosecutors interpret new standards unevenly across 75 counties.";
    case "county":
      return "Precinct, board, or polling-site changes are felt at the kitchen table — clerks implement, voters notice.";
    case "absentee":
      return "Absentee workflow changes affect elderly voters, rural mail routes, and understaffed clerk teams.";
    case "access":
      return "Removing lawful candidacy paths tells voters their choices do not matter — clerks reprogram ballots and retrain.";
    case "equipment":
      return "Ballot-handling mandates shift operational burden to county election workers without guaranteed training dollars.";
    case "sos":
      return "SOS-duty changes signal who bears compliance cost — counties and candidates absorb new filing burdens.";
    default:
      return "Rule changes land on county election workers and voters learning new procedures — verify funding followed the mandate.";
  }
}

function trapFor(row: IndexRow, theme: string): TrapSetup {
  const act = row.actNumber ? `Act ${row.actNumber}` : row.billNumber;
  const baitByTheme: Record<string, string> = {
    petition: `'We tightened petitions to stop fraud.'`,
    enforcement: `'We need harsh penalties or elections are not safe.'`,
    county: `'We made voting more efficient for counties.'`,
    absentee: `'We secured absentee voting.'`,
    access: `'We cleaned up the ballot.'`,
    equipment: `'We passed the ballot security act.'`,
    sos: `'We brought transparency to the Secretary of State's office.'`,
    general: `'I'm proud of ${row.billNumber}.'`,
  };
  const questionByTheme: Record<string, string> = {
    petition: `What specific Arkansas fraud cases justified ${row.billNumber} before ${act}?`,
    enforcement: `How many election-fraud convictions occurred the year before ${row.billNumber}?`,
    county: `Under ${act}, who pays when a rural precinct loses its polling site?`,
    absentee: `What training did county clerks receive before ${act} changed absentee procedures?`,
    access: `Which voters gained power when access paths changed under ${row.billNumber}?`,
    equipment: `What funding accompanied ${act} for county ballot-handling training?`,
    sos: `Which county clerks got implementation support when ${row.billNumber} changed SOS duties?`,
    general: `What did ${row.billNumber} change for county clerks in the first election after passage?`,
  };
  return {
    name: `${theme} accountability`,
    baitLineYouWantFromOpponent: baitByTheme[theme] ?? baitByTheme.general,
    moderatorOrKellySetupQuestion: questionByTheme[theme] ?? questionByTheme.general,
    kellyPivotWhenHeBites: "If vague: pivot to SOS implementation support, verified act text, and county partnership.",
    whyItWorks: "Moves from slogan to operational accountability — Kelly wins on service frame.",
  };
}

function buildFromRow(row: IndexRow): Omit<BillOperatorPlaybook, "billNumber" | "isCurated"> {
  const theme = primaryTheme(row);
  const actNum = row.actNumber;
  const actLabel = actNum ? `Act ${actNum}` : "act number needs verification";
  const headline = row.title
    .replace(/^TO /i, "")
    .replace(/^AN ACT TO /i, "")
    .replace(/^CONCERNING /i, "")
    .slice(0, 100);
  const impact = countyImpact(row, theme);
  const in2021 = row.legislativePackageId === "kh0b-2021-integrity-foundation";

  const steps: PlaybookStep[] = [
    { step: 1, dimension: "WHAT", detail: whatDetail(row) },
    {
      step: 2,
      dimension: "WHEN",
      detail: in2021
        ? `When Hammer cites the 2021 integrity package without naming ${actLabel} implementation.`
        : `When Hammer or moderator names ${row.billNumber} or bundles ${theme} bills without county detail.`,
    },
    {
      step: 3,
      dimension: "WHERE",
      detail: "Debate stage, county clerk forums, editorial boards — verify act text before cite.",
    },
    { step: 4, dimension: "WHY", detail: impact },
    {
      step: 5,
      dimension: "HOW",
      detail: `${actLabel} anchor → county burden question → Kelly SOS service bridge (funding, guidance, lead time).`,
    },
    { step: 6, dimension: "WHO", detail: "County election officials and voters — not opponent motives." },
  ];

  return {
    actNumber: actNum,
    headline,
    recordItemLabel: actNum ? `${row.billNumber} → ${actLabel}` : row.billNumber,
    steps,
    debateUse: {
      bringUpWhen: `Hammer cites ${row.billNumber}${actNum ? ` / ${actLabel}` : ""} as proof he secured elections.`,
      openingLine: `I agree we need clear, trusted election rules — the question is whether counties got support to implement ${actLabel}.`,
      actAnchor: actNum
        ? `${row.billNumber} became ${actLabel} in the ${row.sessionYear} session — verify on Arkleg.`
        : `Verify enrollment for ${row.billNumber} before citing act numbers on stage.`,
      countyOrVoterImpact: impact,
      kellyBridge: "Secretary of State publishes rules and partners with clerks — security and accessibility together.",
      rebuttalIfHeCounters: "Welcome the security goal; ask for funding line and SOS guidance tied to this act.",
      doNotSay: ["Stolen election framing", "Fraud without sourced proof", "Personal motive attacks"],
    },
    socialMediaUse: {
      platforms: ["Facebook", "X"],
      postFormat: `${row.billNumber} + ${actLabel} + one county-impact sentence + Arkleg link.`,
      threadOutline: [
        in2021 ? "2021 integrity package continuity" : `${row.billNumber} record item`,
        `${actLabel} link`,
        "County burden",
        "Kelly SOS frame",
      ],
      graphicCaption: `${actLabel}: who implements?`,
      claimsGateReminder: `Confidence ${row.confidenceLevel ?? "MEDIUM"} — verify enrolled act before boost.`,
    },
    peopleImpactFrame: impact,
    trapSetup: trapFor(row, theme),
    kellyDifference: `Kelly offers implementation partnership; Hammer's record shows rule changes under ${row.billNumber} — verify matching county support.`,
  };
}

/** Bills with hand-written playbooks in debateBillOperatorPlaybooks.ts */
export const MANUAL_CURATED_BILL_NUMBERS = new Set([
  "SB250",
  "HB1457",
  "SB291",
  "SB584",
  "HB1707",
  "SB486",
  "SB487",
  "SB488",
  "SB582",
  "SB643",
  "SB644",
]);

let indexCuratedCache: Record<string, Omit<BillOperatorPlaybook, "billNumber" | "isCurated">> | null = null;

export function buildIndexCuratedPlaybooks(): Record<string, Omit<BillOperatorPlaybook, "billNumber" | "isCurated">> {
  if (indexCuratedCache) return indexCuratedCache;
  const out: Record<string, Omit<BillOperatorPlaybook, "billNumber" | "isCurated">> = {};
  for (const row of loadIndexRows()) {
    const upper = row.billNumber.toUpperCase();
    if (MANUAL_CURATED_BILL_NUMBERS.has(upper)) continue;
    out[upper] = buildFromRow(row);
  }
  indexCuratedCache = out;
  return out;
}

export function listIndexCuratedBillNumbers(): string[] {
  return Object.keys(buildIndexCuratedPlaybooks());
}
