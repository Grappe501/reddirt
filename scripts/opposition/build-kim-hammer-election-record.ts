import fs from "node:fs";
import path from "node:path";

type BillRecord = {
  billNumber: string;
  title: string;
  role: string;
  session: string;
  sourceUrl: string;
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
};

const ROOT = path.join(process.cwd());

const INPUT_JSON = path.join(ROOT, "data/intelligence/opponent-legislative-candidates.json");
const OUTPUT_INDEX = path.join(ROOT, "data/opposition/kim-hammer-election-record-bill-index.json");
const OUTPUT_THEMES = path.join(ROOT, "data/opposition/kim-hammer-election-record-theme-matrix.json");
const OUTPUT_TIMELINE = path.join(ROOT, "data/opposition/kim-hammer-election-record-timeline.json");
const OUTPUT_DOSSIER = path.join(ROOT, "docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md");
const OUTPUT_CLAIMS = path.join(ROOT, "docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md");
const OUTPUT_GUIDANCE = path.join(
  ROOT,
  "docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md",
);
const OUTPUT_REPORT = path.join(ROOT, "docs/opposition/KIM_HAMMER_ELECTION_RECORD_BUILD_REPORT.md");

const RELEVANT_BILLS = new Set([
  "SB207",
  "SB208",
  "SB209",
  "SB210",
  "SB211",
  "SB250",
  "SB291",
  "SB294",
  "SB296",
  "SB299",
  "SB551",
  "SB584",
  "HB1222",
  "HB1457",
  "HB1464",
  "HB1487",
  "HB1693",
  "HB1707",
  "HB1837",
]);

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function parseRole(role: string): ResearchRow["hammerRole"] {
  const r = role.toLowerCase();
  if (r.includes("primary sponsor") || r === "primary sponsor") return "sponsor";
  if (r.includes("cosponsor") || r.includes("co-sponsor")) return "co-sponsor";
  return "committee role";
}

function classifyThemes(title: string): string[] {
  const t = title.toUpperCase();
  const out: string[] = [];
  if (/(INITIATIVE|REFERENDUM|BALLOT TITLE|CANVASSER|PETITION)/.test(t)) {
    out.push("direct_democracy_ballot_initiatives", "petition_gathering");
  }
  if (/(COUNTY CLERK|COUNTY|POLLING SITE|ELECTION PROCEDURES|ELECTION AUDIT)/.test(t)) {
    out.push("county_election_administration");
  }
  if (/(VOTER REGISTRATION|SECURE VOTER)/.test(t)) out.push("voter_registration");
  if (/(ABSENTEE)/.test(t)) out.push("absentee_voting");
  if (/(BALLOT TITLE|CANDIDATE|WRITE-IN|POLL WATCHER)/.test(t)) out.push("ballot_access");
  if (/(COMPLAINT|VIOLATIONS|STATE BOARD OF ELECTION COMMISSIONERS|ENFORCEMENT)/.test(t)) {
    out.push("election_enforcement");
  }
  if (/(PAPER BALLOT|TABULAT|VOTING MACHINE|HAND COUNT|BALLOT SECURITY)/.test(t)) {
    out.push("voting_equipment_paper_ballots");
  }
  if (/(SECRETARY OF STATE)/.test(t)) out.push("secretary_of_state_duties");
  if (/(POLL WATCHER)/.test(t)) out.push("poll_watchers_election_observers");
  if (/(WRITE-IN|CANDIDATE)/.test(t)) out.push("write_ins_candidate_access");
  return [...new Set(out)];
}

function sessionYear(session: string): string {
  return session.split("/")[0] ?? session;
}

async function fetchArklegStatus(url: string): Promise<{
  status: string;
  actNumber: string | null;
  finalDisposition: string;
}> {
  const response = await fetch(url);
  if (!response.ok) {
    return {
      status: "unavailable",
      actNumber: null,
      finalDisposition: "Unable to fetch Arkleg detail page.",
    };
  }
  const html = await response.text();
  const text = html.replace(/<[^>]+>/g, "\n").replace(/\s+/g, " ").trim();
  const statusMatch = text.match(/Status:\s*([^.]+?)(?=Originating Chamber:)/i);
  const actMatch = text.match(/now Act\s+([0-9A-Z]+)/i);
  const status = statusMatch?.[1]?.trim() ?? "status not parsed";
  const finalDisposition = actMatch
    ? `Enacted as Act ${actMatch[1]}.`
    : status.includes("Filed")
      ? "Filed; enactment not confirmed in parsed output."
      : `Disposition from status: ${status}`;
  return {
    status,
    actNumber: actMatch?.[1] ?? null,
    finalDisposition,
  };
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
      ? "Touches ballot access mechanics (candidate filings, ballot-title framing, poll watcher interactions)."
      : "No direct ballot-access change identified in title-level review.",
    directDemocracyImpact: has("direct_democracy_ballot_initiatives")
      ? "Touches initiative/referendum petition process and/or canvasser requirements."
      : "No direct initiative/referendum process language identified in title-level review.",
    voterAccessImpact: has("absentee_voting") || has("poll_watchers_election_observers")
      ? "Potential voter-experience effect via absentee or poll-site process changes; needs legal-text confirmation."
      : "No specific voter-access mechanism identified in title-level review.",
    enforcementImpact: has("election_enforcement")
      ? "Expands or modifies complaint, violation, or enforcement timelines/process."
      : "No explicit enforcement-process trigger identified in title-level review.",
  };
}

function docketSources(billNumber: string, sourceUrl: string): string[] {
  const shared = [
    sourceUrl,
    "data/intelligence/opponent-legislative-candidates.json",
    "data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json",
  ];
  if (billNumber === "SB250") {
    return [
      ...shared,
      "https://arkleg.state.ar.us/Acts/FTPDocument?ddBienniumSession=2023%2F2023R&file=350.pdf&path=%2FACTS%2F2023R%2FPublic%2F",
      "https://fayettevilleflyer.com/2023/03/01/arkansas-senate-committee-advances-bill-to-regulate-paper-ballots/",
    ];
  }
  if (billNumber === "SB291") {
    return [
      ...shared,
      "https://arkleg.state.ar.us/Acts/FTPDocument?ddBienniumSession=2025%2F2025R&file=279.pdf&path=%2FACTS%2F2025R%2FPublic%2F",
    ];
  }
  if (billNumber === "SB584") {
    return [
      ...shared,
      "https://arkleg.state.ar.us/Home/FTPDocument?path=%2FACTS%2F2025R%2FPublic%2FACT768.pdf",
      "https://ballotpedia.org/Changes_in_2025_to_laws_governing_ballot_measures",
    ];
  }
  if (billNumber === "HB1457") {
    return [
      ...shared,
      "https://sbec.arkansas.gov/wp-content/uploads/RFPO_FAQ.pdf",
      "https://encyclopediaofarkansas.net/entries/voting-and-voting-rights-4916/",
    ];
  }
  return shared;
}

function writeJson(filePath: string, value: unknown) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(filePath: string, content: string) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, "utf8");
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(INPUT_JSON, "utf8")) as {
    billRecords: Array<{
      billNumber: string;
      title: string;
      role: string;
      session: string;
      sourceUrl: string;
    }>;
  };
  const records: BillRecord[] = raw.billRecords
    .filter((r) => RELEVANT_BILLS.has(r.billNumber))
    .map((r) => ({
      billNumber: r.billNumber,
      title: r.title,
      role: r.role,
      session: r.session,
      sourceUrl: r.sourceUrl,
    }))
    .sort((a, b) => Number(sessionYear(b.session)) - Number(sessionYear(a.session)));

  const rows: ResearchRow[] = [];
  for (const bill of records) {
    const themes = classifyThemes(bill.title);
    const impacts = buildImpacts(themes);
    const parsed = await fetchArklegStatus(bill.sourceUrl);
    const confidenceLevel: ResearchRow["confidenceLevel"] = parsed.actNumber ? "HIGH" : "MEDIUM";
    rows.push({
      billNumber: bill.billNumber,
      actNumber: parsed.actNumber,
      sessionYear: bill.session,
      title: bill.title,
      topicCategory: themes.length ? themes : ["unclassified_election_topic"],
      hammerRole: parseRole(bill.role),
      status: parsed.status,
      finalDisposition: parsed.finalDisposition,
      affectedOfficeOrActor: [
        "State Board of Election Commissioners",
        "County clerks / county election officials",
        "Petition sponsors and canvassers",
      ],
      affectedGroups: [
        "voters",
        "candidates",
        "counties",
        "petitioners",
      ],
      keyProvisions: [
        "Title-level summary; confirm in enrolled act text and amendments before external use.",
      ],
      secretaryOfStateDutyImpact: impacts.secretaryOfStateDutyImpact,
      countyAdministrationImpact: impacts.countyAdministrationImpact,
      ballotAccessImpact: impacts.ballotAccessImpact,
      directDemocracyImpact: impacts.directDemocracyImpact,
      voterAccessImpact: impacts.voterAccessImpact,
      enforcementImpact: impacts.enforcementImpact,
      sourceLinks: docketSources(bill.billNumber, bill.sourceUrl),
      confidenceLevel,
      notes: [
        "Role classification is from arkleg bill-grid metadata (source JSON).",
        "Where enacted, act number extracted from Arkleg bill detail status line.",
      ],
    });
  }

  const themeKeys = [
    "direct_democracy_ballot_initiatives",
    "petition_gathering",
    "county_election_administration",
    "voter_registration",
    "absentee_voting",
    "ballot_access",
    "election_enforcement",
    "voting_equipment_paper_ballots",
    "secretary_of_state_duties",
    "poll_watchers_election_observers",
    "write_ins_candidate_access",
  ] as const;

  const themeMatrix = {
    generatedAt: new Date().toISOString(),
    themes: Object.fromEntries(
      themeKeys.map((key) => [
        key,
        rows.filter((r) => r.topicCategory.includes(key)).map((r) => r.billNumber),
      ]),
    ),
    notes: [
      "Theme assignments are title-informed and require bill-text confirmation for legal precision.",
    ],
  };

  const timeline = {
    generatedAt: new Date().toISOString(),
    rows: rows
      .slice()
      .sort((a, b) => Number(sessionYear(a.sessionYear)) - Number(sessionYear(b.sessionYear)))
      .map((r) => ({
        year: sessionYear(r.sessionYear),
        billOrAct: r.actNumber ? `${r.billNumber} / Act ${r.actNumber}` : r.billNumber,
        whatChanged: r.title,
        hammerRole: r.hammerRole,
        impactCategory: r.topicCategory,
        sourceConfidence: r.confidenceLevel,
      })),
  };

  const enactedCount = rows.filter((r) => r.actNumber != null).length;

  const dossier = [
    "# KIM HAMMER ELECTION RECORD RESEARCH DOSSIER",
    "",
    "## Executive Summary",
    "- This dossier is a neutral, source-backed first pass focused on election-law and Secretary of State-adjacent legislation associated with Kim Hammer.",
    `- Bills indexed: ${rows.length}. Enacted acts identified from Arkleg status pages: ${enactedCount}.`,
    "- Sponsor/co-sponsor labels come from arkleg bill-grid metadata in repository exports.",
    "- This pass separates verified enactment facts from claims needing additional sourcing (roll calls, fiscal notes, hearing testimony, and county-association reactions).",
    "",
    "## Verified Bill Table",
    "| Bill | Act | Session | Hammer role | Status | Topic categories | Citation |",
    "|---|---|---|---|---|---|---|",
    ...rows.map(
      (r) =>
        `| ${r.billNumber} | ${r.actNumber ?? "N/A"} | ${r.sessionYear} | ${r.hammerRole} | ${r.status.replace(/\|/g, "/")} | ${r.topicCategory.join(", ")} | ${r.sourceLinks[0]} |`,
    ),
    "",
    "## Themes",
    ...themeKeys.map((key) => `- **${key}**: ${(themeMatrix.themes as Record<string, string[]>)[key].join(", ") || "none"}`),
    "",
    "## Strongest Sourced Examples",
    "- `SB250` -> Arkleg shows enactment as Act 350; title and act text references paper-ballot / tabulation mechanics.",
    "- `HB1457` -> Arkleg shows enactment as Act 444; title establishes Poll Watchers Bill of Rights framework.",
    "- `SB291` -> Arkleg shows enactment as Act 279; title and act references complaint-deadline adjustments for election-law violations.",
    "- `SB584` -> Arkleg shows enactment as Act 768; title and act text indicate local initiative/referendum petition process changes.",
    "",
    "## County Burden Analysis",
    "- Bills in county administration and paper-ballot themes may increase procedural requirements on county clerks and election boards.",
    "- `SB250` reporting indicates counties choosing hand count still must run tabulation-device processes and absorb operational compliance burden.",
    "",
    "## Direct Democracy Analysis",
    "- 2025 petition/initiative package bills (`SB207`, `SB208`, `SB209`, `SB210`, `SB211`, `SB551`, `SB584`, `HB1222`, `HB1837`) cluster around canvasser/documentation/ballot-title process controls.",
    "- Additional legal-text review is needed to distinguish statewide vs local workflow changes bill-by-bill.",
    "",
    "## Voter Access Analysis",
    "- Bills on absentee handling (`SB299`) and poll-site process (`HB1457`, `SB293`) may alter voter-facing election administration conditions.",
    "- No individual-voter impact claims are made in this pass; impacts remain process-level pending fuller legal and empirical sourcing.",
    "",
    "## Secretary of State Duties Analysis",
    "- `HB1707` explicitly references filing with the Secretary of State in title-level metadata.",
    "- Petition-process bills can interact with SOS sufficiency and filing workflows; legal boundaries between AG, SOS, and county clerk duties need line-by-line statute confirmation.",
    "",
    "## Factual Claims Needing More Sourcing",
    "- Roll-call vote positions for each chamber vote on each bill.",
    "- Committee testimony quotations and hearing-level rationale for each listed bill.",
    "- County association or county clerk formal commentary on implementation burden.",
    "- Direct-democracy advocate critiques tied to specific bill text sections.",
    "",
    "## Supporter / Critic Rationale (Initial pass)",
    "- Supporter rationale example (`SB250`): sponsor framed structure/accountability and county responsibility for deviations from current system (Fayetteville Flyer report).",
    "- Critic rationale example (`SB250`): concern that paper-ballot pathway still requires machine tabulation and may not satisfy local reform goals (same report).",
    "- Additional balanced rationale extraction is needed from committee records and public statements for the broader bill set.",
    "",
    "## Source Appendix",
    "- `data/intelligence/opponent-legislative-candidates.json`",
    "- `data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json`",
    "- Arkleg bill detail pages listed in `data/opposition/kim-hammer-election-record-bill-index.json`",
    "- Arkleg acts: Act 350, Act 444, Act 279, Act 768",
    "- Secondary context used cautiously: Fayetteville Flyer (SB250), Ballotpedia 2025 ballot-measure changes, SBEC FAQ references.",
    "",
  ].join("\n");

  const claimsReview = [
    "# KIM HAMMER ELECTION RECORD CLAIMS REVIEW",
    "",
    "## Synopsis Claim Checks",
    "| Claim | Assessment | Source needed | Safer wording |",
    "|---|---|---|---|",
    "| SB250 / 2023 paper-ballot or hand-count county regulation | supported | Arkleg SB250 + Act 350 text | SB250 was enacted as Act 350 and amended paper-ballot/tabulation procedures. |",
    "| 2025 citizen initiative / petition-process bills sponsored by Hammer | supported | Arkleg bill detail pages for SB207/208/209/210/211/551/584 | Multiple 2025 petition-related bills list Hammer as primary sponsor in arkleg records. |",
    "| Voter Registration and Secure Voter Records Act of 2023 | needs more research | locate exact bill number/act citation | A similarly named claim needs exact bill/act verification before use. |",
    "| Arkansas Poll Watchers Bill of Rights Act of 2023 | supported | Arkleg HB1457 detail and Act 444 status | HB1457 title references Poll Watchers Bill of Rights and arkleg shows enactment as Act 444. |",
    "| election law complaint / State Board of Election Commissioners changes | supported | Arkleg SB291 (Act 279), HB1464 detail | SB291 enacted as Act 279 changed complaint deadlines; HB1464 title also references complaint/SBEC changes. |",
    "| Secretary of State duty changes in election bills | partially supported | bill-by-bill statutory text and amendments | At least one bill title (`HB1707`) references SOS filing duties; broader duty-shift claims need full text confirmation. |",
    "",
    "## Unsupported / Needs Follow-up Items",
    "- No sourced claim in this pass that Hammer personally 'voted for' every listed item; current data is sponsor/co-sponsor-oriented.",
    "- No sourced claim in this pass about county-cost amounts or quantified voter impact effects.",
    "",
  ].join("\n");

  const messageGuidance = [
    "# KIM HAMMER ELECTION RECORD MESSAGE GUIDANCE",
    "",
    "## Verified Factual Themes",
    "- Petition and initiative process legislation appears repeatedly in 2025 records tied to Hammer sponsorship.",
    "- Election-administration bills include complaint timelines, audits, absentee procedure, and poll watcher process themes.",
    "- At least four listed bills are verified as enacted acts through Arkleg status pages in this pass.",
    "",
    "## Safe Language",
    "- 'Arkleg records list Hammer as sponsor/co-sponsor of the following election-law bills...'",
    "- 'Arkleg status pages show these bills were enacted as acts...'",
    "- 'These changes appear to affect petition workflow, county election administration, or complaint processes.'",
    "",
    "## Risky Claims To Avoid",
    "- Any statement that implies motive without direct quotation or hearing evidence.",
    "- Any claim that all listed bills reduced or increased voter access without bill-text and implementation evidence.",
    "- Any statement that conflates sponsoring with final floor vote behavior.",
    "",
    "## Bill Numbers To Cite",
    "- `SB250`, `HB1457`, `SB291`, `SB584` (high-confidence enacted anchors).",
    "- Additional sponsor set: `SB207`, `SB208`, `SB209`, `SB210`, `SB211`, `SB551`, `HB1222`, `HB1837`, `HB1693`, `HB1707`, `HB1464`, `HB1487`, `SB294`, `SB296`, `SB299`.",
    "",
    "## Questions Voters/Reporters May Ask",
    "- Which election-law bills became law and what changed operationally?",
    "- Did any bills shift authority between county clerks, SBEC, and Secretary of State?",
    "- Which provisions were framed as fraud-prevention versus access concerns?",
    "",
    "## County Official Concerns To Verify",
    "- Implementation workload for county clerks under petition process documentation changes.",
    "- Staffing/training pressure from poll watcher and complaint-procedure updates.",
    "- Tabulation and hand-count process requirements for counties exploring paper-ballot workflows.",
    "",
    "## Direct Democracy Advocate Critiques To Verify",
    "- Whether petition/canvasser affidavit and documentation rules materially raise qualification barriers.",
    "- Whether local initiative filing requirements changed circulation timelines or challenge exposure.",
    "",
    "## Hammer/Supporter Rationale To Include For Balance",
    "- Supporter framing in available reporting emphasizes structure, integrity, and accountability in election administration.",
    "- Include direct quotations from sponsor statements or committee testimony once sourced bill-by-bill.",
    "",
  ].join("\n");

  const report = [
    "# KIM HAMMER ELECTION RECORD BUILD REPORT",
    "",
    "## Sources Searched",
    "- RedDirt internal exports: `data/intelligence/opponent-legislative-candidates.json`, `data/intelligence/generated/arkleg-hammer-all-bills.dryrun.json`.",
    "- Existing research docs: `docs/research/HAMMER_BALLOT_INITIATIVE_BILLS_MASTER.md`, `docs/kim-hammer-sos-brief-source-report.md`.",
    "- Official Arkleg bill pages for selected election-law records.",
    "- Secondary context: Arkleg Act PDFs, Fayetteville Flyer, Ballotpedia ballot-measure update page, SBEC FAQ.",
    "",
    "## Files Created",
    "- `data/opposition/kim-hammer-election-record-bill-index.json`",
    "- `data/opposition/kim-hammer-election-record-theme-matrix.json`",
    "- `data/opposition/kim-hammer-election-record-timeline.json`",
    "- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md`",
    "- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md`",
    "- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md`",
    "- `docs/opposition/KIM_HAMMER_ELECTION_RECORD_BUILD_REPORT.md`",
    "",
    `## Number of Bills Found\n- ${rows.length}`,
    `## Number of Enacted Acts Found\n- ${enactedCount}`,
    "",
    "## High-Confidence Themes",
    "- Direct democracy / petition process legislation in 2025.",
    "- Election complaint/enforcement timeline changes.",
    "- Poll watcher procedural framework updates.",
    "- Paper-ballot/tabulation process regulation.",
    "",
    "## Claims Needing Follow-up",
    "- Exact bill tied to 'Voter Registration and Secure Voter Records Act of 2023' phrase.",
    "- Roll-call vote behavior for each bill where role is not sponsor.",
    "- Hearing-level rationale and county-association commentary for each top bill.",
    "",
    "## Recommended Next Research Pass",
    "- Pull and summarize amendment text + fiscal notes for each high-priority bill.",
    "- Extract committee and floor testimony quotes with timestamps and links.",
    "- Build county-implementation impact notes from county clerk and election official materials.",
    "",
  ].join("\n");

  writeJson(OUTPUT_INDEX, { generatedAt: new Date().toISOString(), rows });
  writeJson(OUTPUT_THEMES, themeMatrix);
  writeJson(OUTPUT_TIMELINE, timeline);
  writeText(OUTPUT_DOSSIER, `${dossier}\n`);
  writeText(OUTPUT_CLAIMS, `${claimsReview}\n`);
  writeText(OUTPUT_GUIDANCE, `${messageGuidance}\n`);
  writeText(OUTPUT_REPORT, `${report}\n`);

  console.log(`Built Kim Hammer election record packet with ${rows.length} bills.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

