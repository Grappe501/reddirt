/**
 * INTEL-BRIEF-1B + INTEL-BRIEF-2 — Build Kim Hammer SOS-relevance source report + candidate briefs
 * from arkleg dry-run exports only (no DB, no live ingest, no scraping).
 *
 * Usage (from RedDirt/): npx tsx scripts/build-kim-hammer-brief-packet.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");

type GridBill = {
  billNumber: string;
  title: string;
  session: string;
  role: string;
  officialBillUrl: string;
};

type Categorized = GridBill & { categories: string[] };

type NotableBill = {
  billNumber: string;
  title: string;
  session: string;
  role: string;
  category: string;
  sourceUrl: string;
  whyItMatters: string;
  confidence: "title_metadata_only" | "source_verified";
};

const norm = (t: string) => t.toUpperCase();

function matchesDirectDemocracy(title: string): boolean {
  const t = norm(title);
  return (
    /\bBALLOT\b/.test(t) ||
    /\bINITIATIVE\b/.test(t) ||
    /\bPETITION\b/.test(t) ||
    /\bREFEREND/.test(t) ||
    /\bRECOUNT\b/.test(t) ||
    /\bSIGNATURE\b/.test(t) ||
    /\bCONSTITUTIONAL AMENDMENT\b/.test(t) ||
    /\bPROPOSED AMENDMENT\b/.test(t) ||
    /\bPOPULAR NAME\b/.test(t) ||
    /\bBALLOT TITLE\b/.test(t) ||
    /\bINITIATED ACT\b/.test(t) ||
    /\bLOCAL OPTION ELECTION\b/.test(t)
  );
}

function matchesSosElectionAuthority(title: string): boolean {
  const t = norm(title);
  return (
    /\bSECRETARY OF STATE\b/.test(t) ||
    /\bSTATE BOARD OF ELECTION\b/.test(t) ||
    /\bELECTION COMMISSION\b/.test(t) ||
    /\bELECTION COMMISSIONERS\b/.test(t) ||
    /\bCANDIDATE FILING\b/.test(t) ||
    /\bFILING.*CANDIDATE\b/.test(t) ||
    /\bVOTER REGISTRATION\b/.test(t) ||
    /\bELECTION ADMINISTRATION\b/.test(t) ||
    /\bCANVASS/.test(t) ||
    /\bELECTION LAW\b/.test(t) ||
    /\bATTORNEY GENERAL.*BALLOT/.test(t) ||
    /\bBALLOT TITLE.*ATTORNEY GENERAL\b/.test(t)
  );
}

function matchesCountyElectionAdmin(title: string): boolean {
  const t = norm(title);
  return (
    /\bCOUNTY CLERK\b/.test(t) ||
    /\bCOUNTY ELECTION\b/.test(t) ||
    /\bLOCAL ELECTION\b/.test(t) ||
    /\bPRECINCT\b/.test(t) ||
    /\bPOLL WORKER\b/.test(t) ||
    /\bABSENTEE\b/.test(t) ||
    /\bEARLY VOTING\b/.test(t) ||
    /\bPOLLING PLACE\b/.test(t) ||
    /\bCOUNTY BOARD OF ELECTION\b/.test(t)
  );
}

function matchesVotingSystems(title: string): boolean {
  const t = norm(title);
  return (
    /\bVOTING MACHINE\b/.test(t) ||
    /\bVOTING SYSTEM\b/.test(t) ||
    /\bTABULATION\b/.test(t) ||
    /\bBALLOT SYSTEM\b/.test(t) ||
    /\bELECTION EQUIPMENT\b/.test(t) ||
    /\bELECTRONIC VOTING\b/.test(t) ||
    /\bPAPER BALLOT\b/.test(t) ||
    /\bELECTION.*AUDIT\b/.test(t) ||
    /\bAUDIT.*ELECTION\b/.test(t)
  );
}

function matchesPublicEducation(title: string): boolean {
  const t = norm(title);
  if (/TO RECOGNIZE|TO COMMEND|TO HONOR/.test(t)) return false;
  return (
    /\bDEPARTMENT OF EDUCATION\b/.test(t) ||
    /\bSCHOOL BOARD\b/.test(t) ||
    /\bCURRICULUM\b/.test(t) ||
    /\bPUBLIC SCHOOL\b/.test(t) ||
    /\bTEACHER\b/.test(t) ||
    /\bHIGHER EDUCATION\b/.test(t) ||
    /TO AMEND.*\bEDUCATION\b/.test(t) ||
    /CONCERNING.*\bEDUCATION\b/.test(t)
  );
}

function matchesElectionFinance(title: string): boolean {
  const t = norm(title);
  return (
    /\bELECTION FUNDING\b/.test(t) ||
    /\bELECTION.*REIMBURSEMENT\b/.test(t) ||
    /\bREIMBURSEMENT.*ELECTION\b/.test(t) ||
    /\bAPPROPRIATION.*ELECTION\b/.test(t) ||
    /\bELECTION.*APPROPRIATION\b/.test(t) ||
    /\bGRANT.*ELECTION\b/.test(t)
  );
}

function matchesCapitolGrounds(title: string): boolean {
  const t = norm(title);
  return (
    /\bSTATE CAPITOL\b/.test(t) ||
    /\bCAPITOL BUILDING\b/.test(t) ||
    /\bCAPITOL GROUNDS\b/.test(t) ||
    /\bCAPITOL POLICE\b/.test(t) ||
    /\bSTATE BUILDINGS\b/.test(t) ||
    /\bSTATE FACILITIES\b/.test(t) ||
    /\bSECRETARY OF STATE.*CAPITOL\b/.test(t) ||
    /\bCAPITOL.*SECRETARY OF STATE\b/.test(t)
  );
}

function matchesBusinessServices(title: string): boolean {
  const t = norm(title);
  return (
    /\bCORPORATION/.test(t) ||
    /\bLIMITED LIABILITY COMPANY\b/.test(t) ||
    /\bLLC\b/.test(t) ||
    /\bREGISTERED AGENT\b/.test(t) ||
    /\bANNUAL REPORT\b/.test(t) ||
    /\bFRANCHISE TAX\b/.test(t) ||
    /\bTRADEMARK\b/.test(t) ||
    /\bTRADE NAME\b/.test(t) ||
    /\bASSUMED NAME\b/.test(t) ||
    /\bUNIFORM COMMERCIAL CODE\b/.test(t) ||
    /\bUCC\b/.test(t) ||
    /\bNOTARY\b/.test(t) ||
    /\bAPOSTILLE\b/.test(t) ||
    /\bCHARITABLE ORGANIZATION\b/.test(t) ||
    /\bBUSINESS FILING\b/.test(t) ||
    /\bSECRETARY OF STATE.*FILING\b/.test(t) ||
    /\bFILING.*SECRETARY OF STATE\b/.test(t)
  );
}

function matchesRecordsArchives(title: string): boolean {
  const t = norm(title);
  if (/TO RECOGNIZE|TO COMMEND|TO HONOR/.test(t)) return false;
  return (
    /\bSTATE RECORDS\b/.test(t) ||
    /\bSTATE ARCHIVES\b/.test(t) ||
    /\bADMINISTRATIVE RULES\b/.test(t) ||
    /\bRULEMAKING\b/.test(t) ||
    /\bSTATE SEAL\b/.test(t) ||
    /\bOFFICIAL ACTS\b/.test(t)
  );
}

function categorize(b: GridBill): Categorized {
  const cats: string[] = [];
  const { title } = b;
  if (matchesDirectDemocracy(title)) cats.push("directDemocracy");
  if (matchesSosElectionAuthority(title)) cats.push("sosElectionAuthority");
  if (matchesCountyElectionAdmin(title)) cats.push("countyElectionAdmin");
  if (matchesVotingSystems(title)) cats.push("votingSystems");
  if (matchesPublicEducation(title)) cats.push("publicEducation");
  if (matchesElectionFinance(title)) cats.push("electionFinance");
  if (matchesCapitolGrounds(title)) cats.push("capitolBuildingGroundsManagement");
  if (matchesBusinessServices(title)) cats.push("businessServicesCorporationsFilings");
  if (matchesRecordsArchives(title)) cats.push("recordsArchivesAdministrativeDuties");
  return { ...b, categories: cats };
}

function stableKey(b: GridBill): string {
  return `${b.session}|${b.billNumber}|${b.role}`;
}

function main() {
  const allPath = path.join(REPO, "data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json");
  if (!fs.existsSync(allPath)) {
    console.error("[brief] Missing", allPath, "— run: npm run ingest:arkleg-opposition -- --dry-run --write-summary");
    process.exit(1);
  }

  const allRaw = JSON.parse(fs.readFileSync(allPath, "utf8")) as {
    bills?: GridBill[];
    entityName?: string;
    member?: string;
    generatedAt?: string;
  };
  const bills = allRaw.bills ?? [];
  const candidateName = allRaw.entityName ?? "Kim Hammer";

  const categorized = bills.map(categorize);
  const relevant = categorized.filter((b) => b.categories.length > 0);
  const uniqueRelevant = new Map<string, Categorized>();
  for (const b of relevant) uniqueRelevant.set(stableKey(b), b);

  const byCat = {
    directDemocracy: [] as GridBill[],
    sosElectionAuthority: [] as GridBill[],
    countyElectionAdmin: [] as GridBill[],
    votingSystems: [] as GridBill[],
    publicEducation: [] as GridBill[],
    electionFinance: [] as GridBill[],
    capitolBuildingGroundsManagement: [] as GridBill[],
    businessServicesCorporationsFilings: [] as GridBill[],
    recordsArchivesAdministrativeDuties: [] as GridBill[],
  };

  const pushCat = (arr: GridBill[], b: Categorized, key: keyof typeof byCat) => {
    if (b.categories.includes(key)) {
      arr.push({
        billNumber: b.billNumber,
        title: b.title,
        session: b.session,
        role: b.role,
        officialBillUrl: b.officialBillUrl,
      });
    }
  };

  for (const b of uniqueRelevant.values()) {
    pushCat(byCat.directDemocracy, b, "directDemocracy");
    pushCat(byCat.sosElectionAuthority, b, "sosElectionAuthority");
    pushCat(byCat.countyElectionAdmin, b, "countyElectionAdmin");
    pushCat(byCat.votingSystems, b, "votingSystems");
    pushCat(byCat.publicEducation, b, "publicEducation");
    pushCat(byCat.electionFinance, b, "electionFinance");
    pushCat(byCat.capitolBuildingGroundsManagement, b, "capitolBuildingGroundsManagement");
    pushCat(byCat.businessServicesCorporationsFilings, b, "businessServicesCorporationsFilings");
    pushCat(byCat.recordsArchivesAdministrativeDuties, b, "recordsArchivesAdministrativeDuties");
  }

  const sessions = [...new Set(bills.map((b) => b.session))].sort();

  const topFindings: string[] = [
    `Arkleg legislator bill grid lists ${bills.length} unique bill-role rows for ${candidateName} (sessions present in export: ${sessions.length}; keyword filter matched ${uniqueRelevant.size} rows touching at least one SOS-relevance bucket).`,
    `Direct democracy / ballot-process titles appear on ${byCat.directDemocracy.length} grid rows — review official bill text before any public citation.`,
    `Rows whose titles reference Secretary of State, election boards, canvass, or voter registration: ${byCat.sosElectionAuthority.length}.`,
    `County / local election administration keywords: ${byCat.countyElectionAdmin.length} rows.`,
    `Voting systems / tabulation / audit keywords: ${byCat.votingSystems.length} rows.`,
    `Business services / corporate filing keywords: ${byCat.businessServicesCorporationsFilings.length} rows.`,
    `Public education (excluding ceremonial resolutions): ${byCat.publicEducation.length} rows.`,
  ];

  const patterns: { label: string; billNumbers: string[] }[] = [];
  const nums = (rows: GridBill[]) => [...new Set(rows.map((r) => r.billNumber))].slice(0, 40);

  if (byCat.directDemocracy.length >= 3) {
    patterns.push({
      label: "Repeated legislative attention to ballot initiatives, petitions, referendum, or ballot-title process",
      billNumbers: nums(byCat.directDemocracy),
    });
  }
  if (byCat.sosElectionAuthority.length >= 3) {
    patterns.push({
      label: "Multiple bills referencing Secretary of State, election commissions/boards, canvass, or voter registration",
      billNumbers: nums(byCat.sosElectionAuthority),
    });
  }
  if (byCat.countyElectionAdmin.length >= 3) {
    patterns.push({
      label: "Recurring county / local election administration topics (clerks, precincts, absentee, early voting)",
      billNumbers: nums(byCat.countyElectionAdmin),
    });
  }
  if (byCat.businessServicesCorporationsFilings.length >= 3) {
    patterns.push({
      label: "Recurring business-entity / filing / UCC / notary-class topics that overlap traditional SOS business services",
      billNumbers: nums(byCat.businessServicesCorporationsFilings),
    });
  }
  if (byCat.publicEducation.length >= 3) {
    patterns.push({
      label: "Education-policy bills (non-ceremonial title matches only)",
      billNumbers: nums(byCat.publicEducation),
    });
  }
  if (byCat.votingSystems.length >= 2) {
    patterns.push({
      label: "Election infrastructure / voting system / audit language in titles",
      billNumbers: nums(byCat.votingSystems),
    });
  }

  const potentialConcerns: string[] = [
    "Title-only classification can miss nuance; opposing readings of the same bill are possible until bill text is reviewed.",
    "Ceremonial resolutions were filtered out of the education bucket where the pattern matched; other buckets may still include low-substance titles — spot-check before use.",
    "Do not attribute motive or electoral strategy from titles alone.",
  ];

  function whyMatters(category: string): string {
    const m: Record<string, string> = {
      directDemocracy:
        "Touches ballot access, initiatives, or referendum process — areas that intersect with how voters place measures on the ballot.",
      sosElectionAuthority:
        "References offices or processes that align with Secretary of State election-administration duties — verify scope on the official bill page.",
      countyElectionAdmin:
        "Touches county-level election operations — relevant to how the SOS role coordinates with county clerks and local election officials.",
      votingSystems:
        "Touches equipment, tabulation, or audit concepts — verify whether impact is procedural or substantive.",
      publicEducation:
        "Education policy — not a core SOS statutory cluster, but may matter for voter Q&A if raised.",
      electionFinance:
        "Funding or reimbursement tied to elections — verify appropriation details on the official bill page.",
      capitolBuildingGroundsManagement:
        "Capitol / state-facility themes — some SOS portfolios include capitol-related duties; confirm with official sources.",
      businessServicesCorporationsFilings:
        "Corporate or commercial filing themes — traditional SOS business-services lane; verify bill substance.",
      recordsArchivesAdministrativeDuties:
        "Records, rules, or administrative-publication themes — may overlap general government administration.",
    };
    return m[category] ?? "Overlaps an SOS-relevance bucket from the briefing keyword set — human review required.";
  }

  const notableSet = new Map<string, NotableBill>();
  const addNotable = (b: GridBill, category: string) => {
    const k = stableKey(b);
    if (notableSet.has(k)) return;
    notableSet.set(k, {
      billNumber: b.billNumber,
      title: b.title,
      session: b.session,
      role: b.role,
      category,
      sourceUrl: b.officialBillUrl,
      whyItMatters: whyMatters(category),
      confidence: "title_metadata_only",
    });
  };

  for (const b of byCat.directDemocracy) addNotable(b, "directDemocracy");
  for (const b of byCat.sosElectionAuthority) addNotable(b, "sosElectionAuthority");
  for (const b of byCat.countyElectionAdmin) addNotable(b, "countyElectionAdmin");
  for (const b of byCat.votingSystems) addNotable(b, "votingSystems");
  for (const b of byCat.businessServicesCorporationsFilings) addNotable(b, "businessServicesCorporationsFilings");
  for (const b of byCat.capitolBuildingGroundsManagement) addNotable(b, "capitolBuildingGroundsManagement");
  for (const b of byCat.publicEducation) addNotable(b, "publicEducation");
  for (const b of byCat.electionFinance) addNotable(b, "electionFinance");
  for (const b of byCat.recordsArchivesAdministrativeDuties) addNotable(b, "recordsArchivesAdministrativeDuties");

  const notableBills = [...notableSet.values()].slice(0, 48);

  const sourceReport = {
    candidate: candidateName,
    summary: {
      totalBillsAnalyzed: bills.length,
      relevantBillsFound: uniqueRelevant.size,
      sourceUsed: "data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json (+ optional arkleg-review-shortlist.json for cross-check)",
      generatedAt: new Date().toISOString(),
    },
    categories: byCat,
    topFindings,
    patterns,
    notableBills,
    potentialConcerns,
    bio: {
      roles: [
        "Identified in export as Arkansas legislator with bill grid spanning multiple biennia (see session list in summary).",
        "Public-facing chamber/title (e.g., Senator) should be confirmed on the official Arkansas Senate / SOS candidate filing page before external use.",
      ],
      tenure: `Bill-grid export includes sessions: ${sessions.slice(0, 8).join(", ")}${sessions.length > 8 ? ", …" : ""} — verify dates and district on official sources.`,
      knownFocusAreas: [
        ...patterns.map((p) => p.label),
        "Full grid includes many ceremonial resolutions; SOS-relevance scan is title-keyword-based only.",
      ],
      sourceNotes: [
        "Arkansas Legislature arkleg.state.ar.us legislator detail / bill grid (exported via ingest:arkleg-opposition dry-run).",
        "No Senate biography text ingested in this packet; add official bio URL to worksheet if needed.",
      ],
    },
  };

  const genDir = path.join(REPO, "data/intelligence/generated");
  const briefsDir = path.join(REPO, "docs/briefs");
  fs.mkdirSync(genDir, { recursive: true });
  fs.mkdirSync(briefsDir, { recursive: true });

  const jsonPath = path.join(genDir, "kim-hammer-sos-brief-source-report.json");
  fs.writeFileSync(jsonPath, JSON.stringify(sourceReport, null, 2), "utf8");
  console.log("[brief] wrote", jsonPath);

  const sourceMdPath = path.join(REPO, "docs/kim-hammer-sos-brief-source-report.md");
  fs.writeFileSync(sourceMdPath, renderSourceMd(sourceReport), "utf8");
  console.log("[brief] wrote", sourceMdPath);

  const tonightPath = path.join(briefsDir, "kim-hammer-candidate-brief-tonight.md");
  fs.writeFileSync(tonightPath, renderTonightBrief(sourceReport), "utf8");
  console.log("[brief] wrote", tonightPath);

  const talkPath = path.join(briefsDir, "kim-hammer-one-page-talk-sheet.md");
  fs.writeFileSync(talkPath, renderTalkSheet(sourceReport), "utf8");
  console.log("[brief] wrote", talkPath);

  const handoff = {
    packet: "INTEL-BRIEF-2",
    generatedAt: new Date().toISOString(),
    sourceFilesUsed: [
      "data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json",
      "data/intelligence/generated/kim-hammer-sos-brief-source-report.json",
      "docs/kim-hammer-sos-brief-source-report.md",
      "docs/arkleg-intelligence-verification-worksheet.md",
      "data/intelligence/generated/arkleg-review-shortlist.json",
    ],
    topFindings: sourceReport.topFindings,
    watchlistCounts: {
      directDemocracy: byCat.directDemocracy.length,
      sosElectionAuthority: byCat.sosElectionAuthority.length,
      countyElectionAdmin: byCat.countyElectionAdmin.length,
      votingSystems: byCat.votingSystems.length,
      publicEducation: byCat.publicEducation.length,
      electionFinance: byCat.electionFinance.length,
      capitolBuildingGroundsManagement: byCat.capitolBuildingGroundsManagement.length,
      businessServicesCorporationsFilings: byCat.businessServicesCorporationsFilings.length,
      recordsArchivesAdministrativeDuties: byCat.recordsArchivesAdministrativeDuties.length,
      totalGridRows: bills.length,
      rowsMatchingAnyCategory: uniqueRelevant.size,
    },
    verificationWarnings: [
      "All bill substance here is from arkleg grid titles + URLs only — not verified bill text.",
      "Complete docs/arkleg-intelligence-verification-worksheet.md before any public or paid use.",
      "Do not imply motive, corruption, or bad faith from titles alone.",
      "INTEL-BRIEF-2 briefs are internal campaign preparation — not for external publishing without compliance review.",
    ],
    recommendedNextResearch: [
      "Open each high-priority officialBillUrl and confirm short title, sponsors, and final disposition.",
      "Cross-check SOS candidate filing and official biography for office and district.",
      "Add committee / floor video citations only after timestamp verification.",
    ],
  };
  const handoffPath = path.join(genDir, "kim-hammer-brief-handoff.json");
  fs.writeFileSync(handoffPath, JSON.stringify(handoff, null, 2), "utf8");
  console.log("[brief] wrote", handoffPath);
}

function renderSourceMd(s: {
  candidate: string;
  summary: { totalBillsAnalyzed: number; relevantBillsFound: number; sourceUsed: string; generatedAt: string };
  categories: Record<string, GridBill[]>;
  topFindings: string[];
  patterns: { label: string; billNumbers: string[] }[];
  notableBills: NotableBill[];
  bio: { roles: string[]; tenure: string };
}): string {
  const lines: string[] = [
    "# Kim Hammer — SOS-relevance source report (INTEL-BRIEF-1B)",
    "",
    "**Internal use only.** Title/metadata from arkleg grid only. **Requires human verification** before public citation.",
    "",
    "## Summary",
    "",
    `- **Candidate:** ${s.candidate}`,
    `- **Total grid rows analyzed:** ${s.summary.totalBillsAnalyzed}`,
    `- **Rows matching ≥1 SOS-relevance bucket:** ${s.summary.relevantBillsFound}`,
    `- **Source:** ${s.summary.sourceUsed}`,
    `- **Generated:** ${s.summary.generatedAt}`,
    "",
    "## Category counts",
    "",
    "| Category | Rows |",
    "|----------|------|",
  ];
  const c = s.categories;
  lines.push(`| Direct democracy | ${c.directDemocracy.length} |`);
  lines.push(`| SOS / election authority | ${c.sosElectionAuthority.length} |`);
  lines.push(`| County / local election admin | ${c.countyElectionAdmin.length} |`);
  lines.push(`| Voting systems | ${c.votingSystems.length} |`);
  lines.push(`| Public education | ${c.publicEducation.length} |`);
  lines.push(`| Election finance | ${c.electionFinance.length} |`);
  lines.push(`| Capitol / grounds / management | ${c.capitolBuildingGroundsManagement.length} |`);
  lines.push(`| Business services / filings | ${c.businessServicesCorporationsFilings.length} |`);
  lines.push(`| Records / archives / admin | ${c.recordsArchivesAdministrativeDuties.length} |`);
  lines.push("", "## Top findings", "");
  for (const f of s.topFindings) lines.push(`- ${f}`);
  lines.push("", "## Patterns", "");
  for (const p of s.patterns) {
    lines.push(`- **${p.label}**`);
    lines.push(`  - Bills: ${p.billNumbers.join(", ")}`);
  }
  lines.push("", "## Notable bills (sample)", "");
  for (const n of s.notableBills.slice(0, 25)) {
    lines.push(`- **${n.billNumber}** (${n.session}) — ${n.role}`);
    lines.push(`  - ${n.title}`);
    lines.push(`  - [Official URL](${n.sourceUrl})`);
    lines.push(`  - *Why flagged:* ${n.whyItMatters}`);
    lines.push(`  - *Confidence:* ${n.confidence}`);
    lines.push("");
  }
  lines.push("## Bio (provisional)", "");
  for (const r of s.bio.roles) lines.push(`- ${r}`);
  lines.push("", `**Tenure note:** ${s.bio.tenure}`, "");
  return lines.join("\n");
}

function renderTonightBrief(s: {
  candidate: string;
  summary: { totalBillsAnalyzed: number; relevantBillsFound: number };
  categories: Record<string, GridBill[]>;
  topFindings: string[];
  patterns: { label: string; billNumbers: string[] }[];
  notableBills: NotableBill[];
  bio: { roles: string[]; tenure: string; sourceNotes: string[] };
}): string {
  const c = s.categories;
  const execBullets = [
    `Legislative grid for **${s.candidate}** contains **${s.summary.totalBillsAnalyzed}** unique bill-role rows in the arkleg export; **${s.summary.relevantBillsFound}** match at least one SOS-relevance keyword bucket (title-only scan).`,
    "Overlaps are strongest around **election administration**, **ballot/initiative process**, and **county election operations** — exact counts are in the source JSON.",
    "Traditional **business-services** keywords (entities, UCC, notary, etc.) appear on multiple rows; verify each bill’s actual effect on the official page.",
    "**Public education** hits are restricted to non-ceremonial title patterns; still confirm text before citing.",
    "Nothing here proves how he would act as Secretary of State; it is a **preparation map** for questions and follow-up research.",
    "All use requires **human verification** (see worksheet) before public or paid messaging.",
    "Source: arkleg dry-run export only — no database pulls in this packet.",
  ];

  const lines: string[] = [
    `# Candidate briefing — ${s.candidate} (tonight’s talk prep)`,
    "",
    "**INTEL-BRIEF-2 — Internal campaign use only.** Not for external distribution. Do not drop human-verification warnings.",
    "",
    "## 1. Executive Summary",
    "",
    ...execBullets.map((b) => `- ${b}`),
    "",
    "## 2. Short Bio",
    "",
    ...s.bio.roles.map((r) => `- ${r}`),
    "",
    `**Tenure / sessions (from grid export):** ${s.bio.tenure}`,
    "",
    "**Needs verification:** exact district, current chamber title, and any SOS filing should be taken from **official Arkansas Senate / Secretary of State candidate** pages, not from this brief.",
    "",
    "## 3. Why This Matters for Secretary of State",
    "",
    "The Secretary of State’s visible duties include **elections and election law implementation**, **business and commercial filings**, and **capitol / state-facility responsibilities** in Arkansas’s structure. Legislation touching **ballot measures**, **county election operations**, **voter registration / canvass**, or **business entity filings** is **not** proof of how a candidate would run the office, but it helps the campaign **map what questions are fair** and **what deserves fact-checking**.",
    "",
    "## 4. Key Legislative Watchlist",
    "",
    "### Direct democracy / ballot initiatives",
    ...watchlistSection(c.directDemocracy),
    "### SOS / election authority",
    ...watchlistSection(c.sosElectionAuthority),
    "### County clerks / local election administration",
    ...watchlistSection(c.countyElectionAdmin),
    "### Voting systems / election infrastructure",
    ...watchlistSection(c.votingSystems),
    "### Business services / corporate filings",
    ...watchlistSection(c.businessServicesCorporationsFilings),
    "### State Capitol / grounds / management",
    ...watchlistSection(c.capitolBuildingGroundsManagement),
    "### Public education",
    ...watchlistSection(c.publicEducation),
    "",
    "## 5. Public Education Notes",
    "",
    c.publicEducation.length
      ? `**${c.publicEducation.length}** non-ceremonial title matches. Sample: ${c.publicEducation
          .slice(0, 5)
          .map((b) => b.billNumber)
          .join(", ")}. Confirm bill text before citing.`
      : "_No non-ceremonial education rows matched the briefing filter._",
    "",
    "## 6. Key Patterns",
    "",
    ...s.patterns.map((p) => [`- **${p.label}**`, `  - Supporting bills: ${p.billNumbers.join(", ")}`, ""]).flat(),
    "",
    "## 7. Questions Kelly Can Raise Tonight",
    "",
    "- When a legislator has sponsored multiple bills touching **election administration** or the **ballot measure process**, what specific standards would he apply as Secretary of State—especially where statute gives the office discretion?",
    "- How would he ensure **county clerks and local election officials** get clear, consistent guidance—particularly on **new or amended** election procedures?",
    "- For **business filings and commercial records**, how would he balance efficient service with **fraud prevention and transparency**?",
    "- What is his approach to **voter-facing education** and **confidence in elections** without undermining lawful access?",
    "- Where voters care about **ballot titles and petition rules**, how would he interpret the office’s role **neutrally and lawfully**?",
    "",
    "## 8. Suggested Framing",
    "",
    "- Keep focus on **the office’s duties**, not personal attacks.",
    "- Prefer **questions** over assertions when bill text has not been verified.",
    "- Pair any bill reference with **official URL** internally; externally only after verification.",
    "",
    "## 9. Verification Notes",
    "",
    "- Complete **[`docs/arkleg-intelligence-verification-worksheet.md`](../arkleg-intelligence-verification-worksheet.md)** for any bill you plan to cite.",
    "- Grid **titles** can differ from final enrolled language; **confirm** on the bill detail page.",
    "- Do not claim **intent** (why a bill was filed) from titles alone.",
    "",
    "---",
    "",
    `*Source JSON: \`data/intelligence/generated/kim-hammer-sos-brief-source-report.json\` — generated ${new Date().toISOString()}*`,
  ];
  return lines.join("\n");
}

function watchlistSection(rows: GridBill[]): string[] {
  if (!rows.length) return ["_None matched filter._", ""];
  const out: string[] = [];
  for (const b of rows.slice(0, 35)) {
    out.push(`- **${b.billNumber}** · ${b.session} · *${b.role}*`);
    out.push(`  - ${b.title}`);
    out.push(`  - Official: ${b.officialBillUrl}`);
    out.push(`  - **Why it matters:** See category introduction above; title suggests overlap with SOS-relevant themes — **verify** substance.`);
    out.push(`  - **Confidence:** title_metadata_only · **Verification:** NEEDS_HUMAN_VERIFICATION`);
    out.push("");
  }
  if (rows.length > 35) out.push(`_…and ${rows.length - 35} more in source JSON._`, "");
  return out;
}

function renderTalkSheet(s: {
  summary: { relevantBillsFound: number; totalBillsAnalyzed: number };
  categories: Record<string, GridBill[]>;
  patterns: { label: string; billNumbers: string[] }[];
}): string {
  const c = s.categories;
  return [
    "# Kim Hammer — one-page talk sheet",
    "",
    "**Internal only.** Verified talking points require worksheet sign-off.",
    "",
    "## 5 key points",
    "",
    `1. **Scale:** ${s.summary.totalBillsAnalyzed} unique bill-role rows on his arkleg grid; **${s.summary.relevantBillsFound}** hit SOS-relevance title keywords.`,
    `2. **Election / ballot process:** ${c.directDemocracy.length} rows flagged for direct-democracy / ballot-process language — worth asking how he’d administer those areas as SOS.`,
    `3. **Election authority language:** ${c.sosElectionAuthority.length} rows reference SOS / boards / canvass / registration themes (confirm each bill).`,
    `4. **County operations:** ${c.countyElectionAdmin.length} rows touch county / local election admin keywords.`,
    `5. **Business filings lane:** ${c.businessServicesCorporationsFilings.length} rows match business-services keyword patterns — relevant to a traditional SOS portfolio.`,
    "",
    "## 5 questions",
    "",
    "- What is your standard for **neutral administration** of election law when the legislature is divided on **ballot access**?",
    "- How would you support **county clerks** implementing complex election changes?",
    "- What is your plan for **business filing** modernization while protecting against fraud?",
    "- How do you separate **policy preferences** from **ministerial duties** the SOS must perform?",
    "- What is your approach to **public trust** in elections after serving in a body that frequently amends election statutes?",
    "",
    "## 5 phrases (accountable tone)",
    "",
    "- “Voters deserve clarity on how you’ll run an office that touches **every county’s elections**.”",
    "- “The Secretary of State’s job is **faithful execution of law**, not picking winners on ballot wording.”",
    "- “If you’ve sponsored bills in this space, help us understand how that experience shapes your **administration**, not just your politics.”",
    "- “Business owners need **speed and integrity** from the filings division—what’s your metric for both?”",
    "- “We’re not guessing motives—we’re asking how you’ll **apply** the statutes you helped write.”",
    "",
    "## 3 things to avoid saying until verified",
    "",
    "- Any claim that a specific bill **did** something in the real world without citing **enrolled text / final status**.",
    "- Any **motive** claim (“he wanted to…”) based on titles alone.",
    "- Any **personal** or **defamatory** characterization — keep it on **office duties**.",
    "",
  ].join("\n");
}

main();
