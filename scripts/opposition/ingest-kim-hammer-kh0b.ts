import fs from "node:fs";
import path from "node:path";

type DryrunBill = {
  billNumber: string;
  title: string;
  session: string;
  role: string;
  officialBillUrl: string;
};

type ResearchRow = {
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  title: string;
  topicCategory: string[];
  hammerRole: "sponsor" | "co-sponsor" | "vote" | "public advocate" | "committee role";
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
  confidenceLevel: "HIGH" | "MEDIUM" | "LOW";
  notes: string[];
  plainEnglishSummary?: string;
  legislativePackageId?: string;
};

const ROOT = process.cwd();
const DRYRUN = path.join(ROOT, "data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json");
const INDEX_PATH = path.join(ROOT, "data/opposition/kim-hammer-election-record-bill-index.json");
const THEMES_PATH = path.join(ROOT, "data/opposition/kim-hammer-election-record-theme-matrix.json");
const TIMELINE_PATH = path.join(ROOT, "data/opposition/kim-hammer-election-record-timeline.json");
const CHRONOLOGY_PATH = path.join(
  ROOT,
  "data/opposition/kim-hammer-profile/kim-hammer-kh0b-legislative-chronology.json",
);

/** KH-0B additions: 2021 integrity foundation + missing 2023 election bills. */
const KH0B_BILL_NUMBERS = [
  "SB486",
  "SB487",
  "SB488",
  "SB582",
  "SB643",
  "SB644",
  "SB254",
  "SB258",
  "SB272",
  "SB273",
  "SB292",
] as const;

const ACT_BY_BILL: Record<string, string> = {
  SB486: "728",
  SB487: "729",
  SB488: "727",
  SB582: "1051",
  SB643: "973",
  SB644: "974",
};

const FOUNDATION_2021 = new Set(["SB486", "SB487", "SB488", "SB582", "SB643", "SB644"]);

const PLAIN_ENGLISH: Record<string, string> = {
  SB486:
    "Tightened electioneering rules and misdemeanor penalties tied to voting-related conduct — expands enforcement surface at polling places.",
  SB487:
    "Changed how precinct boundaries, polling sites, and vote centers are established or altered — shifts operational decisions toward county election administration.",
  SB488:
    "Created a public-records exemption around voted ballots under FOIA — reduces public inspectability of certain election materials.",
  SB582:
    "Modified county boards of election commissioners (including oath procedures) — direct county governance and compliance layer.",
  SB643:
    "Amended absentee ballot procedures — affects how mail/absentee voting is administered and verified.",
  SB644:
    "Established election-law violation investigation tools including a hotline — expands complaint and enforcement culture.",
  SB254:
    "2023 session: eliminated write-in candidacies in covered elections and amended related election procedures (Hammer co-sponsor).",
  SB258:
    "2023 session: changed absentee voting methods and prohibited absentee ballot drop boxes (Hammer co-sponsor).",
  SB272:
    "2023 session: created an election integrity review process and expanded SBEC duties around election-law violations (Hammer co-sponsor).",
  SB273:
    "2023 session: amended polling-site and vote-center location rules (Hammer co-sponsor).",
  SB292:
    "2023 session: amended compensation and duties for county boards of election commissioners (Hammer co-sponsor).",
};

function parseRole(role: string): ResearchRow["hammerRole"] {
  const r = role.toLowerCase();
  if (r.includes("primary sponsor")) return "sponsor";
  if (r.includes("cosponsor") || r.includes("co-sponsor")) return "co-sponsor";
  return "committee role";
}

function classifyThemes(title: string): string[] {
  const t = title.toUpperCase();
  const out: string[] = [];
  if (/(INITIATIVE|REFERENDUM|BALLOT TITLE|CANVASSER|PETITION)/.test(t)) {
    out.push("direct_democracy_ballot_initiatives", "petition_gathering");
  }
  if (/(COUNTY CLERK|COUNTY BOARD|ELECTION COMMISSION|PRECINCT|POLLING SITE|VOTE CENTER|COUNTY)/.test(t)) {
    out.push("county_election_administration");
  }
  if (/(VOTER REGISTRATION|SECURE VOTER)/.test(t)) out.push("voter_registration");
  if (/(ABSENTEE|DROP BOX)/.test(t)) out.push("absentee_voting");
  if (/(BALLOT TITLE|CANDIDATE|WRITE-IN|POLL WATCHER|ELECTIONEERING)/.test(t)) out.push("ballot_access");
  if (/(COMPLAINT|VIOLATIONS|STATE BOARD OF ELECTION COMMISSIONERS|ENFORCEMENT|HOTLINE|INVESTIGATION)/.test(t)) {
    out.push("election_enforcement");
  }
  if (/(PAPER BALLOT|TABULAT|VOTING MACHINE|HAND COUNT|BALLOT SECURITY|VOTED BALLOT)/.test(t)) {
    out.push("voting_equipment_paper_ballots");
  }
  if (/(SECRETARY OF STATE)/.test(t)) out.push("secretary_of_state_duties");
  if (/(POLL WATCHER)/.test(t)) out.push("poll_watchers_election_observers");
  if (/(WRITE-IN|WRITE IN)/.test(t)) out.push("write_ins_candidate_access");
  if (/(FREEDOM OF INFORMATION|FOIA|PUBLIC RECORDS)/.test(t)) out.push("transparency_public_records");
  if (out.length === 0) out.push("election_integrity_general");
  return [...new Set(out)];
}

function buildImpacts(themes: string[]) {
  const has = (theme: string) => themes.includes(theme);
  return {
    secretaryOfStateDutyImpact: has("secretary_of_state_duties")
      ? "Directly references Secretary of State filing or election-administration responsibilities."
      : "No direct Secretary of State duty language identified in title-level review.",
    countyAdministrationImpact: has("county_election_administration")
      ? "Likely changes county clerk/election-board procedures; requires county-level implementation review."
      : "No explicit county administration trigger identified in title-level review.",
    ballotAccessImpact: has("ballot_access")
      ? "Touches ballot access mechanics (candidate filings, polling-place rules, electioneering boundaries)."
      : "No direct ballot-access change identified in title-level review.",
    directDemocracyImpact: has("direct_democracy_ballot_initiatives")
      ? "Touches initiative/referendum petition process and/or canvasser requirements."
      : "No direct initiative/referendum process language identified in title-level review.",
    voterAccessImpact: has("absentee_voting")
      ? "Affects absentee/mail voting procedures or drop-box availability."
      : has("write_ins_candidate_access")
        ? "Affects candidate access pathways including write-in options."
        : "No specific voter-access mechanism identified in title-level review.",
    enforcementImpact: has("election_enforcement")
      ? "Expands or modifies complaint, violation, or enforcement timelines/process."
      : "No explicit enforcement-process trigger identified in title-level review.",
  };
}

function isElectionRelated(title: string): boolean {
  return classifyThemes(title).length > 0;
}

function buildRow(bill: DryrunBill): ResearchRow {
  const themes = classifyThemes(bill.title);
  const impacts = buildImpacts(themes);
  const actNumber = ACT_BY_BILL[bill.billNumber] ?? null;
  const enacted = Boolean(actNumber);
  return {
    billNumber: bill.billNumber,
    actNumber,
    sessionYear: bill.session,
    title: bill.title,
    topicCategory: themes,
    hammerRole: parseRole(bill.role),
    status: enacted
      ? `Senate -- Notification that ${bill.billNumber} is now Act ${actNumber}`
      : "Filed; enactment from KH-0B title review.",
    finalDisposition: enacted ? `Enacted as Act ${actNumber}.` : "Disposition requires Arkleg confirmation.",
    affectedOfficeOrActor: [
      "State Board of Election Commissioners",
      "County clerks / county election officials",
      ...(themes.includes("secretary_of_state_duties") ? ["Arkansas Secretary of State"] : []),
    ],
    affectedGroups: ["voters", "candidates", "counties"],
    keyProvisions: [PLAIN_ENGLISH[bill.billNumber] ?? "Title-level summary; confirm enrolled act text."],
    ...impacts,
    sourceLinks: [
      bill.officialBillUrl,
      "data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json",
    ],
    confidenceLevel: enacted ? "HIGH" : "MEDIUM",
    notes: [
      "KH-0B ingest from Arkleg dryrun metadata.",
      "Strategic narrative blocks marked INTERPRETATION until enrolled-act verification.",
    ],
    plainEnglishSummary: PLAIN_ENGLISH[bill.billNumber],
    legislativePackageId: FOUNDATION_2021.has(bill.billNumber)
      ? "kh0b-2021-integrity-foundation"
      : undefined,
  };
}

function mergeThemes(
  themes: Record<string, string[]>,
  rows: ResearchRow[],
): Record<string, string[]> {
  const merged = { ...themes };
  for (const row of rows) {
    for (const theme of row.topicCategory) {
      if (!merged[theme]) merged[theme] = [];
      if (!merged[theme].includes(row.billNumber)) merged[theme].push(row.billNumber);
    }
  }
  for (const key of Object.keys(merged)) {
    merged[key] = [...new Set(merged[key])].sort();
  }
  return merged;
}

function appendTimeline(
  rows: ResearchRow[],
  existing: Array<{
    year: string;
    billOrAct: string;
    whatChanged: string;
    hammerRole: string;
    impactCategory: string[];
    sourceConfidence: "LOW" | "MEDIUM" | "HIGH";
  }>,
) {
  const known = new Set(existing.map((row) => row.billOrAct.split(" ")[0]));
  const additions = rows
    .filter((row) => !known.has(row.billNumber))
    .map((row) => ({
      year: row.sessionYear.split("/")[0] ?? row.sessionYear,
      billOrAct: `${row.billNumber}${row.actNumber ? ` / Act ${row.actNumber}` : ""}`,
      whatChanged: row.title,
      hammerRole: row.hammerRole,
      impactCategory: row.topicCategory,
      sourceConfidence: row.confidenceLevel,
    }));
  return [...additions, ...existing].sort((a, b) => {
    if (a.year !== b.year) return a.year.localeCompare(b.year);
    return a.billOrAct.localeCompare(b.billOrAct);
  });
}

function buildChronology(allBills: DryrunBill[]) {
  const byYear = new Map<string, DryrunBill[]>();
  for (const bill of allBills) {
    const year = bill.session.split("/")[0] ?? bill.session;
    const bucket = byYear.get(year) ?? [];
    bucket.push(bill);
    byYear.set(year, bucket);
  }

  const years = [...byYear.keys()].sort();
  const chronologyYears = years.map((year) => {
    const bills = byYear.get(year) ?? [];
    const electionBills = bills.filter((bill) => isElectionRelated(bill.title));
    const primary = bills.filter((bill) => bill.role.toLowerCase().includes("primary sponsor"));
    const co = bills.filter((bill) => bill.role.toLowerCase().includes("cosponsor"));
    const enactedElection = electionBills
      .filter((bill) => ACT_BY_BILL[bill.billNumber] || bill.session.startsWith("2021"))
      .map((bill) => bill.billNumber);

    let narrativeSummary = `${year}: ${primary.length} primary-sponsored bills in Arkleg dryrun (${electionBills.length} election-related by title filter).`;
    if (year === "2021") {
      narrativeSummary +=
        " Foundational integrity package (SB486–SB488, SB582, SB643–SB644) establishes enforcement, county-administration, transparency, and absentee-process architecture.";
    } else if (year === "2023") {
      narrativeSummary +=
        " Equipment and enforcement emphasis (SB250, HB1457, etc.) plus co-sponsored access/enforcement bills (SB254, SB258, SB272, SB273, SB292).";
    } else if (year === "2025") {
      narrativeSummary +=
        " Petition/package architecture dominates (SB207–211, SB551, SB584, HB1222) — direct democracy friction peak.";
    }

    return {
      year,
      office: Number(year) >= 2019 ? ("State Senate" as const) : ("Unknown" as const),
      primarySponsorCount: primary.length,
      coSponsorCount: co.length,
      electionRelatedSponsorCount: electionBills.length,
      enactedElectionBillNumbers: [...new Set(enactedElection)].sort(),
      narrativeSummary,
      evidenceStatus: "INTERPRETATION" as const,
      linkedPackageIds: year === "2021" ? ["kh0b-2021-integrity-foundation"] : [],
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    subject: "Kim Hammer",
    tenureNote:
      "Arkleg dryrun shows Senate service from 2019 onward; no House Rep rows in current ingest. Chronology uses all dryrun bills with election-title filter for intelligence focus.",
    years: chronologyYears,
    arcHeadline: "2021 foundation → 2023 enforcement/equipment → 2025 petition architecture",
    arcParagraphs: [
      "Before KH-0B the workbench skewed 2025-heavy, making Hammer's record look like a sudden petition crackdown rather than a multi-session architecture.",
      "The 2021 package shows early county-administration, enforcement, absentee, and transparency choices that set the narrative frame Hammer still uses in 2025.",
      "Kelly contrast should emphasize county support, transparent rules, and participation — not election denial — using operational burden evidence where verified.",
    ],
    governanceNotes: [
      "Year summaries are INTERPRETATION from title/metadata until bill-text verification pass.",
      "ChatGPT or secondary narrative blocks are not sources — only Arkleg URLs and enrolled acts.",
    ],
  };
}

function main() {
  const dryrun = JSON.parse(fs.readFileSync(DRYRUN, "utf8")) as { bills: DryrunBill[] };
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8")) as { generatedAt: string; rows: ResearchRow[] };
  const themes = JSON.parse(fs.readFileSync(THEMES_PATH, "utf8")) as {
    generatedAt: string;
    themes: Record<string, string[]>;
    notes: string[];
  };
  const timeline = JSON.parse(fs.readFileSync(TIMELINE_PATH, "utf8")) as {
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

  const dryrunByBill = new Map(
    dryrun.bills.map((bill) => [`${bill.billNumber}:${bill.session}`, bill]),
  );

  const additions: ResearchRow[] = [];
  for (const billNumber of KH0B_BILL_NUMBERS) {
    if (index.rows.some((row) => row.billNumber === billNumber)) continue;
    const session = FOUNDATION_2021.has(billNumber) ? "2021/2021R" : "2023/2023R";
    const bill = dryrunByBill.get(`${billNumber}:${session}`);
    if (!bill) {
      throw new Error(`Missing dryrun bill: ${billNumber} ${session}`);
    }
    additions.push(buildRow(bill));
  }

  if (additions.length === 0) {
    console.log("KH-0B ingest: all target bills already in index.");
  } else {
    index.generatedAt = new Date().toISOString();
    index.rows = [...index.rows, ...additions].sort((a, b) => {
      const yearCmp = a.sessionYear.localeCompare(b.sessionYear);
      if (yearCmp !== 0) return yearCmp;
      return a.billNumber.localeCompare(b.billNumber);
    });
    fs.writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`, "utf8");
    console.log(`KH-0B ingest: added ${additions.length} bills to index.`);
  }

  themes.generatedAt = new Date().toISOString();
  themes.themes = mergeThemes(themes.themes, additions.length ? additions : index.rows.filter((r) => KH0B_BILL_NUMBERS.includes(r.billNumber as (typeof KH0B_BILL_NUMBERS)[number])));
  if (!themes.themes.transparency_public_records) {
    themes.themes.transparency_public_records = ["SB488"];
  }
  if (!themes.themes.election_integrity_general) {
    themes.themes.election_integrity_general = [];
  }
  themes.notes = [
    ...themes.notes.filter((note) => !note.startsWith("KH-0B")),
    "KH-0B added 2021 integrity foundation + 2023 co-sponsored election bills.",
  ];
  fs.writeFileSync(THEMES_PATH, `${JSON.stringify(themes, null, 2)}\n`, "utf8");

  timeline.generatedAt = new Date().toISOString();
  timeline.rows = appendTimeline(
    additions.length ? additions : index.rows.filter((r) => KH0B_BILL_NUMBERS.includes(r.billNumber as (typeof KH0B_BILL_NUMBERS)[number])),
    timeline.rows,
  );
  fs.writeFileSync(TIMELINE_PATH, `${JSON.stringify(timeline, null, 2)}\n`, "utf8");

  const chronology = buildChronology(dryrun.bills);
  fs.writeFileSync(CHRONOLOGY_PATH, `${JSON.stringify(chronology, null, 2)}\n`, "utf8");

  console.log("KH-0B ingest complete.");
  console.log(JSON.stringify({ added: additions.map((r) => r.billNumber), chronologyYears: chronology.years.length }, null, 2));
}

main();
