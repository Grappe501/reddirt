import fs from "node:fs";
import path from "node:path";

export type HammerBillRow = {
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  title: string;
  topicCategory: string[];
  hammerRole: string;
  status: string;
  finalDisposition: string;
  affectedOfficeOrActor: string[];
  affectedGroups: string[];
  keyProvisions: string[];
  secretaryOfStateDutyImpact: string;
  countyAdministrationImpact: string;
  ballotAccessImpact: string;
  directDemocracyImpact: string;
  voterAccessImpact: string;
  enforcementImpact: string;
  sourceLinks: string[];
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  notes: string[];
  /** KH-0B plain-English bridge field (optional until curated). */
  plainEnglishSummary?: string;
  /** KH-0B package linkage (e.g. 2021 integrity foundation). */
  legislativePackageId?: string;
};

type BillIndexFile = { generatedAt: string; rows: HammerBillRow[] };
type ThemeMatrixFile = { generatedAt: string; themes: Record<string, string[]> };
type TimelineFile = {
  generatedAt: string;
  rows: Array<{
    year: string;
    billOrAct: string;
    whatChanged: string;
    hammerRole: string;
    impactCategory: string[];
    sourceConfidence: "LOW" | "MEDIUM" | "HIGH";
  }>;
};

export type ClaimRow = {
  claim: string;
  assessment: "supported" | "partially supported" | "unsupported" | "needs more research";
  sourceNeeded: string;
  saferWording: string;
};

export type DebateDrillCard = {
  billNumber: string;
  prompt: string;
  answer30: string;
  answer60: string;
  rebuttalPivot: string;
  bridgeLine: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
};

const ROOT = process.cwd();

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8")) as T;
}

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function normalizeAssessment(input: string): ClaimRow["assessment"] {
  const v = input.toLowerCase();
  if (v.includes("partially")) return "partially supported";
  if (v.includes("unsupported")) return "unsupported";
  if (v.includes("needs more research")) return "needs more research";
  return "supported";
}

function parseClaimsReview(markdown: string): ClaimRow[] {
  const lines = markdown.split(/\r?\n/);
  const rows: ClaimRow[] = [];
  for (const line of lines) {
    if (!line.startsWith("|")) continue;
    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cols.length !== 4) continue;
    if (cols[0].toLowerCase() === "claim") continue;
    if (cols[0].startsWith("---")) continue;
    rows.push({
      claim: cols[0],
      assessment: normalizeAssessment(cols[1]),
      sourceNeeded: cols[2],
      saferWording: cols[3],
    });
  }
  return rows;
}

function sectionBullets(markdown: string, heading: string): string[] {
  const marker = `## ${heading}`;
  const start = markdown.indexOf(marker);
  if (start < 0) return [];
  const tail = markdown.slice(start + marker.length);
  const nextHeading = tail.indexOf("\n## ");
  const body = nextHeading >= 0 ? tail.slice(0, nextHeading) : tail;
  return body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim());
}

/** Netlify launch hub — JSON only (no large markdown reads). */
export function loadKimHammerWorkbenchHubSummary() {
  const index = readJson<BillIndexFile>("data/opposition/kim-hammer-election-record-bill-index.json");
  const themes = readJson<ThemeMatrixFile>("data/opposition/kim-hammer-election-record-theme-matrix.json");

  const totalBills = index.rows.length;
  const enactedActs = index.rows.filter((row) => Boolean(row.actNumber)).length;
  const confidenceHigh = index.rows.filter((row) => row.confidenceLevel === "HIGH").length;
  const researchConfidenceScore = Math.round((confidenceHigh / Math.max(totalBills, 1)) * 100);
  const highConfidenceThemes = Object.entries(themes.themes)
    .filter(([, bills]) => bills.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)
    .map(([theme, bills]) => ({ theme, billCount: bills.length }));

  const strongestDebateAnchors = ["SB250", "HB1457", "SB291", "SB584", "HB1707"].map((billNumber) =>
    index.rows.find((row) => row.billNumber === billNumber),
  ).filter(Boolean) as HammerBillRow[];

  const topQuestions = [
    "How do you protect election integrity without creating barriers to participation?",
    "Which election-law changes best represent your governing philosophy for Secretary of State?",
    "How would you support county clerks if mandates increase staffing pressure?",
  ];

  const debateDrillQueue: DebateDrillCard[] = strongestDebateAnchors.map((bill, idx) => ({
    billNumber: bill.billNumber,
    prompt: topQuestions[idx] ?? "What should voters know about this bill?",
    answer30: `Arkleg records show ${bill.billNumber} became Act ${bill.actNumber ?? "UNKNOWN"}.`,
    answer60: `The record shows ${bill.billNumber} (${bill.sessionYear}) enacted as Act ${bill.actNumber ?? "UNKNOWN"}.`,
    rebuttalPivot: "Agree on integrity goals, then distinguish methods and county burden evidence.",
    bridgeLine: "This office should call balls and strikes: transparent rules, county support, and broad public trust.",
    risk: bill.confidenceLevel === "HIGH" ? "LOW" : "MEDIUM",
  }));

  return {
    generatedAt: index.generatedAt,
    bills: index.rows,
    totalBills,
    enactedActs,
    researchConfidenceScore,
    highConfidenceThemes,
    strongestDebateAnchors,
    topContrastThemes: [
      "direct_democracy_ballot_initiatives",
      "county_election_administration",
      "election_enforcement",
    ],
    topQuestions,
    debateDrillQueue,
    claimBuckets: {
      supported: [] as ClaimRow[],
      partial: [] as ClaimRow[],
      needsResearch: [] as ClaimRow[],
      unsupported: [] as ClaimRow[],
    },
    riskClaims: [
      "Avoid motive claims without primary sources.",
      "Avoid overstating county cost impacts without clerk documentation.",
      "Use bill numbers and act numbers from the index before citing outcomes.",
    ],
    safeLanguage: [] as string[],
    recommendedNextPass: [
      "Open debate prep for the full 14-section briefing.",
      "Review claims queue before using lines in public settings.",
    ],
  };
}

export function loadKimHammerWorkbench() {
  const index = readJson<BillIndexFile>("data/opposition/kim-hammer-election-record-bill-index.json");
  const themes = readJson<ThemeMatrixFile>("data/opposition/kim-hammer-election-record-theme-matrix.json");
  const timeline = readJson<TimelineFile>("data/opposition/kim-hammer-election-record-timeline.json");
  const dossier = readText("docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md");
  const claimsMd = readText("docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md");
  const guidance = readText("docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md");
  const buildReport = readText("docs/opposition/KIM_HAMMER_ELECTION_RECORD_BUILD_REPORT.md");
  const claims = parseClaimsReview(claimsMd);

  const totalBills = index.rows.length;
  const enactedActs = index.rows.filter((row) => Boolean(row.actNumber)).length;
  const confidenceHigh = index.rows.filter((row) => row.confidenceLevel === "HIGH").length;
  const researchConfidenceScore = Math.round((confidenceHigh / Math.max(totalBills, 1)) * 100);
  const highConfidenceThemes = Object.entries(themes.themes)
    .filter(([, bills]) => bills.length > 0)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 6)
    .map(([theme, bills]) => ({ theme, billCount: bills.length }));

  const strongestDebateAnchors = ["SB250", "HB1457", "SB291", "SB584", "HB1707"].map((billNumber) =>
    index.rows.find((row) => row.billNumber === billNumber),
  ).filter(Boolean) as HammerBillRow[];

  const topContrastThemes = [
    "direct_democracy_ballot_initiatives",
    "county_election_administration",
    "election_enforcement",
    "voting_equipment_paper_ballots",
    "secretary_of_state_duties",
  ];

  const topQuestions = [
    "How do you protect election integrity without creating barriers to participation?",
    "Which election-law changes best represent your governing philosophy for Secretary of State?",
    "How would you support county clerks if mandates increase staffing pressure?",
    "What would you do differently on citizen initiative and petition rules?",
    "How do you keep this office above cultural politics while enforcing election law?",
  ];

  const debateDrillQueue: DebateDrillCard[] = strongestDebateAnchors.map((bill, idx) => ({
    billNumber: bill.billNumber,
    prompt: topQuestions[idx] ?? "What should voters know about this bill?",
    answer30: `Arkleg records show ${bill.billNumber} became Act ${bill.actNumber ?? "UNKNOWN"}. The key question is whether implementation builds trust, transparency, and participation.`,
    answer60: `The record shows ${bill.billNumber} (${bill.sessionYear}) enacted as Act ${bill.actNumber ?? "UNKNOWN"}. We can acknowledge election-integrity goals while asking whether the practical effect supports counties and preserves voter confidence and access. Further county implementation evidence should stay source-backed.`,
    rebuttalPivot: "Agree on integrity goals, then distinguish methods and county burden evidence.",
    bridgeLine: "This office should call balls and strikes: transparent rules, county support, and broad public trust.",
    risk: bill.confidenceLevel === "HIGH" ? "LOW" : "MEDIUM",
  }));

  const riskClaims = sectionBullets(guidance, "Risky Claims To Avoid");
  const safeLanguage = sectionBullets(guidance, "Safe Language");
  const reportQuestions = sectionBullets(guidance, "Questions Voters/Reporters May Ask");
  const countyOfficialConcerns = sectionBullets(guidance, "County Official Concerns To Verify");
  const directDemocracyConcerns = sectionBullets(guidance, "Direct Democracy Advocate Critiques To Verify");
  const supporterRationale = sectionBullets(guidance, "Hammer/Supporter Rationale To Include For Balance");
  const recommendedNextPass = sectionBullets(buildReport, "Recommended Next Research Pass");

  const claimBuckets = {
    supported: claims.filter((row) => row.assessment === "supported"),
    partial: claims.filter((row) => row.assessment === "partially supported"),
    needsResearch: claims.filter((row) => row.assessment === "needs more research"),
    unsupported: claims.filter((row) => row.assessment === "unsupported"),
  };

  return {
    generatedAt: index.generatedAt,
    bills: index.rows,
    themes: themes.themes,
    timeline: timeline.rows,
    claims,
    claimBuckets,
    totalBills,
    enactedActs,
    researchConfidenceScore,
    highConfidenceThemes,
    strongestDebateAnchors,
    topContrastThemes,
    topQuestions,
    debateDrillQueue,
    riskClaims,
    safeLanguage,
    reportQuestions,
    countyOfficialConcerns,
    directDemocracyConcerns,
    supporterRationale,
    recommendedNextPass,
    dossier,
    guidance,
  };
}

export function findKimHammerBill(billNumber: string): HammerBillRow | null {
  const data = loadKimHammerWorkbench();
  return data.bills.find((row) => row.billNumber.toUpperCase() === billNumber.toUpperCase()) ?? null;
}

