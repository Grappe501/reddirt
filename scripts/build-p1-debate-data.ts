/**
 * P1 debate data pass — scaffold KH-0B narratives for bills missing from legislative-narratives.json.
 * Title-level + index metadata only; strategic fields INTERPRETATION / NEEDS_REVIEW until act-text pass.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

type BillIndexRow = {
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  title: string;
  topicCategory: string[];
  hammerRole: string;
  plainEnglishSummary?: string;
  keyProvisions?: string[];
  countyAdministrationImpact?: string;
  ballotAccessImpact?: string;
  directDemocracyImpact?: string;
  voterAccessImpact?: string;
  enforcementImpact?: string;
  legislativePackageId?: string | null;
  sourceLinks?: string[];
};

type NarrativeBill = {
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  hammerRole: string;
  legislativePackageId: string | null;
  title: string;
  plainEnglishSummary: string;
  billNarrative: string;
  countyImpactNarrative: string;
  operationalBurdenNarrative: string;
  debateFrames: { kellyFrame: string; hammerFrame: string; countyFrame: string };
  counterArguments: string[];
  supporterArguments: string[];
  evidenceTier: {
    billExistence: string;
    actEnrollment: string;
    strategicMessaging: string;
  };
  publicationRisk: string;
  strategicBriefing: {
    howToMessage: string;
    debateImpact: string;
    whenToUse: string;
    whenNotToUse: string;
    oppositionSetup: string;
    kellyMessageHelp: string;
    campaignAlignment: string;
  };
  sourceLinks: string[];
  governanceNotes: string[];
};

function roleLabel(hammerRole: string): string {
  const r = hammerRole.toLowerCase();
  if (r.includes("sponsor") && !r.includes("co")) return "primary sponsor";
  if (r.includes("co")) return "co-sponsor";
  return hammerRole;
}

function publicationRisk(topics: string[]): string {
  if (topics.some((t) => t.includes("enforcement") || t.includes("fraud"))) return "HIGH";
  if (topics.some((t) => t.includes("petition") || t.includes("direct_democracy"))) return "HIGH";
  return "MEDIUM";
}

function kellyFrame(topics: string[]): string {
  if (topics.includes("county_election_administration")) {
    return "SOS should train and support counties — not pile unfunded election-law duties on clerks.";
  }
  if (topics.some((t) => t.includes("petition") || t.includes("direct_democracy"))) {
    return "Protect process integrity and lawful citizen access to the ballot.";
  }
  if (topics.includes("transparency_public_records")) {
    return "Transparency builds trust; exemptions should be narrow and justified.";
  }
  return "Election rules should be clear, fair, and workable for voters and counties.";
}

function hammerFrame(topics: string[]): string {
  if (topics.includes("county_election_administration")) {
    return "Stronger statewide standards and accountability for election administration.";
  }
  if (topics.some((t) => t.includes("petition") || t.includes("direct_democracy"))) {
    return "Tighter petition and ballot processes prevent fraud and chaos.";
  }
  return "Integrity reforms keep Arkansas elections secure and trusted.";
}

function countyFrame(topics: string[]): string {
  return "Give clerks implementation guidance, training dollars, and lead time before new mandates.";
}

function buildNarrative(row: BillIndexRow): NarrativeBill {
  const topics = row.topicCategory ?? [];
  const act = row.actNumber ?? null;
  const summary =
    row.plainEnglishSummary ??
    row.keyProvisions?.[0] ??
    "Title-level summary — confirm enrolled act text before external debate use.";
  const arkleg =
    row.sourceLinks?.find((u) => u.includes("arkleg.state.ar.us")) ??
    `https://www.arkleg.state.ar.us/Bills/Detail?id=${row.billNumber}&ddBienniumSession=${encodeURIComponent(row.sessionYear)}`;

  const actEnrollment = act ? "VERIFIED_FACT" : "NEEDS_REVIEW";

  return {
    billNumber: row.billNumber,
    actNumber: act,
    sessionYear: row.sessionYear,
    hammerRole: roleLabel(row.hammerRole),
    legislativePackageId: row.legislativePackageId ?? null,
    title: row.title,
    plainEnglishSummary: summary,
    billNarrative: `P1 scaffold: ${row.billNumber} extends Hammer's election-law record in ${topics.join(", ") || "general election law"} — interpretive until enrolled-act verification.`,
    countyImpactNarrative:
      row.countyAdministrationImpact?.includes("Likely") || row.countyAdministrationImpact?.includes("county")
        ? row.countyAdministrationImpact
        : "County clerks and election boards likely absorb new procedures; confirm county-duty language in enrolled act.",
    operationalBurdenNarrative:
      "Training, documentation, and uneven implementation risk across 75 counties without SOS support funding.",
    debateFrames: {
      kellyFrame: kellyFrame(topics),
      hammerFrame: hammerFrame(topics),
      countyFrame: countyFrame(topics),
    },
    counterArguments: [
      "Unfunded mandates strain county election workers.",
      "Title-level claims need enrolled-act confirmation before debate citations.",
    ],
    supporterArguments: [
      "Supporters cite integrity, uniformity, or enforcement goals in bill title and record.",
    ],
    evidenceTier: {
      billExistence: "VERIFIED_FACT",
      actEnrollment,
      strategicMessaging: "INTERPRETATION",
    },
    publicationRisk: publicationRisk(topics),
    strategicBriefing: {
      howToMessage: "Name act if verified, then county impact, then SOS-as-service bridge — no motive claims.",
      debateImpact: "Use when moderator or opponent names this bill; pair with theme matrix row.",
      whenToUse: `When ${row.billNumber} is cited on stage or in county/petition threads.`,
      whenNotToUse: "Before enrolled-act text pass for specific penalty or procedure claims.",
      oppositionSetup: "Hammer cites bill number and integrity framing.",
      kellyMessageHelp: "Acknowledge security goal; contrast implementation burden and county partnership.",
      campaignAlignment: "Trust, counties, participation — per debate prep pillars.",
    },
    sourceLinks: [arkleg, ...(row.sourceLinks?.filter((u) => !u.includes("dryrun")) ?? []).slice(0, 2)],
    governanceNotes: [
      "P1 auto-scaffold from bill index 2026-06-03; strategic messaging INTERPRETATION until human act-text review.",
      act ? `Act ${act} listed in KH-0 index — verify enrollment on Arkleg before debate.` : "Act number NEEDS_REVIEW in index.",
    ],
  };
}

function main() {
  const indexPath = path.join(ROOT, "data/opposition/kim-hammer-election-record-bill-index.json");
  const narPath = path.join(ROOT, "data/opposition/kim-hammer-election-record-legislative-narratives.json");
  const index = JSON.parse(fs.readFileSync(indexPath, "utf8")) as { rows: BillIndexRow[] };
  const nar = JSON.parse(fs.readFileSync(narPath, "utf8")) as {
    billCount: number;
    bills: NarrativeBill[];
    generatedAt: string;
  };

  const existing = new Set(nar.bills.map((b) => b.billNumber));
  const missing = index.rows.filter((r) => !existing.has(r.billNumber));
  if (missing.length === 0) {
    console.log("No missing narratives — skip");
    return;
  }

  const added = missing.map(buildNarrative);
  nar.bills = [...nar.bills, ...added].sort((a, b) => a.billNumber.localeCompare(b.billNumber));
  nar.billCount = nar.bills.length;
  nar.generatedAt = new Date().toISOString();

  fs.writeFileSync(narPath, `${JSON.stringify(nar, null, 2)}\n`, "utf8");
  console.log(`P1 narratives: added ${added.length}, total ${nar.billCount}`);
  console.log("  added:", added.map((b) => b.billNumber).join(", "));
}

main();
