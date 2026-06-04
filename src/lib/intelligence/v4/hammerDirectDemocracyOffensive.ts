import "server-only";

import fs from "node:fs";
import path from "node:path";

export type {
  DirectDemocracyBillAnchor,
  HammerDirectDemocracyPacket,
} from "@/lib/intelligence/v4/hammerDirectDemocracyTypes";
import type { HammerDirectDemocracyPacket } from "@/lib/intelligence/v4/hammerDirectDemocracyTypes";

const BILL_INDEX = "data/opposition/kim-hammer-election-record-bill-index.json";

function loadIndexRows(): Array<{
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  title: string;
  hammerRole: string;
  topicCategory: string[];
  directDemocracyImpact?: string;
  sourceLinks?: string[];
}> {
  const abs = path.join(process.cwd(), BILL_INDEX);
  const data = JSON.parse(fs.readFileSync(abs, "utf8")) as { rows: Array<Record<string, unknown>> };
  return data.rows as Array<{
    billNumber: string;
    actNumber: string | null;
    sessionYear: string;
    title: string;
    hammerRole: string;
    topicCategory: string[];
    directDemocracyImpact?: string;
    sourceLinks?: string[];
  }>;
}

function arklegBillUrl(bill: string, session: string) {
  return `https://www.arkleg.state.ar.us/Bills/Detail?id=${bill}&ddBienniumSession=${encodeURIComponent(session)}`;
}

function plainEnglishFromTitle(title: string): string {
  return title.replace(/^TO /i, "").replace(/;\s*AND TO /gi, "; also ").slice(0, 200);
}

const OFFENSIVE_FRAMES: Record<string, { frame: string; trap: string }> = {
  SB207: {
    frame: "Act 218 — another layer on petition and canvassing rules; citizens and counties absorb complexity.",
    trap: "Senator, under Act 218, how many fewer signatures did a lawful petition drive lose in Arkansas last cycle — show the data?",
  },
  SB208: {
    frame: "Act 240 — process tightened again in the same session as other petition bills.",
    trap: "Did you hold a public hearing with petition sponsors before Act 240 passed?",
  },
  SB210: {
    frame: "Act 274 — cumulative 2025 package; not one-off election security.",
    trap: "Name one county that got new state funding the same month Act 274 became law.",
  },
  SB211: {
    frame: "Act 241 — petition gatherers face more exposure; fraud prosecution should target fraud, not volunteers.",
    trap: "How many fraud convictions justified Act 241's burden on lawful circulators?",
  },
  SB291: {
    frame: "Act 279 — election complaints and deadlines shifted; direct democracy fights get slower and costlier.",
    trap: "Who pays legal fees for a citizen committee defending a petition under Act 279?",
  },
  SB584: {
    frame: "Act 768 — local initiative and referendum petitions amended; this is the headline direct-democracy hit of 2025.",
    trap: "Senator, you sponsored Act 768 — what specific problem in Arkansas local petitions did it fix with documented cases?",
  },
  SB551: {
    frame: "Act 764 — local option election canvassing rules; narrows how Arkansans bring issues forward.",
    trap: "Under Act 764, what is the new penalty a volunteer faces for a paperwork mistake?",
  },
  HB1457: {
    frame: "Act 444 — poll watcher changes; clerks become referees without SOS training standards you funded.",
    trap: "Which SOS training module did you fund for precinct judges when Act 444 passed?",
  },
};

export function buildHammerDirectDemocracyPacket(): HammerDirectDemocracyPacket {
  const rows = loadIndexRows();
  const petitionRows = rows.filter(
    (r) =>
      r.hammerRole === "sponsor" &&
      (r.topicCategory.some((t) => t.includes("petition") || t.includes("direct_democracy")) ||
        (r.directDemocracyImpact && r.directDemocracyImpact.length > 20)),
  );

  const priorityOrder = ["SB584", "SB207", "SB208", "SB210", "SB211", "SB291", "SB551", "HB1457"];
  const sorted = [...petitionRows].sort((a, b) => {
    const ai = priorityOrder.indexOf(a.billNumber);
    const bi = priorityOrder.indexOf(b.billNumber);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const bills: DirectDemocracyBillAnchor[] = sorted.map((r) => {
    const custom = OFFENSIVE_FRAMES[r.billNumber];
    const actPdf = r.sourceLinks?.find((l) => l.includes("ACT") && l.includes(".pdf"));
    return {
      billNumber: r.billNumber,
      actNumber: r.actNumber,
      sessionYear: r.sessionYear,
      title: r.title,
      hammerRole: r.hammerRole,
      arklegUrl: arklegBillUrl(r.billNumber, r.sessionYear),
      actPdfUrl: actPdf,
      plainEnglish: plainEnglishFromTitle(r.title),
      kellyOffensiveFrame: custom?.frame ?? r.directDemocracyImpact ?? "Petition/direct democracy impact — verify act text.",
      trapQuestion: custom?.trap ?? "What documented fraud cases required this bill?",
      claimsNote: r.actNumber ? `Cite Act ${r.actNumber} on Arkleg — verify enrolled text before broadcast.` : "Act number missing — verify before stage.",
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    clusterLabel: "2025 petition / direct democracy package (Hammer sponsor)",
    thesis:
      "Senator Hammer did not just tweak election security — he led a session-long squeeze on citizen-led ballot access. Kelly defends both integrity and the referendum process Arkansas voters expect.",
    hammerCornerPaint:
      "Force Hammer to defend Acts 218, 240, 274, 241, 279, 764, 768 as a pattern — or admit he cannot name fraud cases for each. Press: 'You led the charge to restrict direct democracy' (THV11 framing, NEEDS_REVIEW).",
    kellySuperiorityLine:
      "I support prosecuting real fraud. I will not dismantle lawful petition drives and county capacity to run them. As Secretary of State I will publish rules voters and volunteers can read.",
    bills,
    debateSequence: [
      "1. Open with values: integrity + participation together (not Hammer's false choice).",
      "2. Name the pattern: 'In 2025 alone you sponsored multiple petition bills — Acts 218, 240, 274, 241, 768…'",
      "3. One human road story (petition volunteer or clerk).",
      "4. Trap question on fraud data or county funding.",
      "5. Bridge: Kelly SOS pledge — transparency, clerk hotline, lawful access.",
    ],
    packoAllianceNote:
      "When GOP voters cannot vote Democratic, a competent Libertarian choice is less dangerous to direct democracy than Hammer's record — phase this slowly; stay respectful to Dr. Pakko on stage.",
  };
}
