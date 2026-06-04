import fs from "node:fs";
import path from "node:path";
import type { V3BillNarrative } from "@/lib/intelligence/v3/debateIntelligenceV3Types";
import type { BillOperatorPlaybook } from "@/lib/intelligence/v4/debateOperatorPlaybookTypes";
import { getBillOperatorPlaybook } from "@/lib/intelligence/v4/debateBillOperatorPlaybooks";

export type BillIndexRow = {
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  title: string;
  hammerRole?: string;
  plainEnglishSummary?: string;
  keyProvisions?: string[];
  sourceLinks?: string[];
  legislativePackageId?: string | null;
  confidenceLevel?: string;
};

export type EducationTier = {
  level: "novice" | "intermediate" | "expert";
  label: string;
  summary: string;
  steps: string[];
  candidateDo: string[];
  candidateAvoid: string[];
};

export type BillActProofDeep = {
  billNumber: string;
  actNumber: string | null;
  sessionYear: string;
  title: string;
  hammerRole: string;
  narrative: V3BillNarrative;
  playbook: BillOperatorPlaybook;
  arklegBillUrl: string | null;
  arklegActPdfUrl: string | null;
  sourceLinks: string[];
  definitions: Array<{ term: string; definition: string }>;
  educationTiers: EducationTier[];
  stepByStepCoverage: Array<{ phase: string; whatHappens: string; kellyMove: string; backupEvidence: string }>;
  opponentExpectedResponses: Array<{ speaker: "Hammer" | "Packo"; round: number; likelyLine: string; kellyRebuttal: string }>;
  inIntegrity2021: boolean;
  themeLabels: string[];
};

let billIndexCache: BillIndexRow[] | null = null;

function loadBillIndex(): BillIndexRow[] {
  if (billIndexCache) return billIndexCache;
  const abs = path.join(process.cwd(), "data/opposition/kim-hammer-election-record-bill-index.json");
  const raw = JSON.parse(fs.readFileSync(abs, "utf8")) as { rows: BillIndexRow[] };
  billIndexCache = raw.rows;
  return billIndexCache;
}

export function findBillIndexRow(billNumber: string): BillIndexRow | undefined {
  return loadBillIndex().find((r) => r.billNumber.toUpperCase() === billNumber.toUpperCase());
}

export function resolveArklegBillUrl(billNumber: string, row?: BillIndexRow): string | null {
  const indexRow = row ?? findBillIndexRow(billNumber);
  const fromLinks = indexRow?.sourceLinks?.find((u) => u.includes("arkleg.state.ar.us/Bills/Detail"));
  if (fromLinks) return fromLinks;
  if (!indexRow?.sessionYear) return null;
  return `https://www.arkleg.state.ar.us/Bills/Detail?id=${billNumber}&ddBienniumSession=${encodeURIComponent(indexRow.sessionYear)}`;
}

function resolveActPdfUrl(row?: BillIndexRow): string | null {
  return row?.sourceLinks?.find((u) => u.includes("ACT") && u.includes(".pdf")) ?? null;
}

function buildDefinitions(narrative: V3BillNarrative, row?: BillIndexRow): BillActProofDeep["definitions"] {
  return [
    {
      term: "Enrolled act",
      definition:
        "The final version of a bill after both chambers pass it and the governor signs — this is the law voters and clerks must follow. Always cite enrolled text, not the bill title alone.",
    },
    {
      term: "County implementation burden",
      definition:
        "When the legislature changes election rules, county clerks and election boards must train staff, update forms, and absorb costs — often without new state funding.",
    },
    {
      term: "SOS-as-service frame",
      definition:
        "Kelly's contrast: Secretary of State is a partner desk for all 75 counties — publishing rules, funding training, answering the phone — not another unfunded mandate from Little Rock.",
    },
    {
      term: narrative.billNumber,
      definition: row?.plainEnglishSummary ?? narrative.plainEnglishSummary,
    },
    ...(narrative.actNumber
      ? [{ term: `Act ${narrative.actNumber}`, definition: `Enrolled law from ${narrative.billNumber} — verify full text on Arkleg before debate citations.` }]
      : []),
  ];
}

function buildEducationTiers(
  narrative: V3BillNarrative,
  playbook: BillOperatorPlaybook,
  row?: BillIndexRow,
): EducationTier[] {
  const actRef = narrative.actNumber ? `Act ${narrative.actNumber}` : narrative.billNumber;
  return [
    {
      level: "novice",
      label: "Novice — first read",
      summary: `Learn what ${narrative.billNumber} changed in plain English before you say the bill number on stage.`,
      steps: [
        `Read the one-sentence summary: ${narrative.plainEnglishSummary}`,
        `Know Kelly's frame: ${narrative.debateFrames.kellyFrame}`,
        `Know what Hammer will say: ${narrative.debateFrames.hammerFrame}`,
        `Memorize one safe opening: ${playbook.debateUse.openingLine}`,
      ],
      candidateDo: [
        "Open Arkleg link and skim enrolled act sections (staff marks highlights)",
        "Practice 30-second answer without looking at notes",
        "Run line through claims gate before any public use",
      ],
      candidateAvoid: playbook.debateUse.doNotSay,
    },
    {
      level: "intermediate",
      label: "Intermediate — debate ready",
      summary: `Connect ${actRef} to county impact and Kelly's SOS service plan.`,
      steps: playbook.steps.map((s) => `${s.dimension}: ${s.detail}`),
      candidateDo: [
        `Use act anchor: ${playbook.debateUse.actAnchor}`,
        `Bridge: ${playbook.debateUse.kellyBridge}`,
        `If he counters: ${playbook.debateUse.rebuttalIfHeCounters}`,
        ...(playbook.trapSetup
          ? [`Set trap: ask "${playbook.trapSetup.moderatorOrKellySetupQuestion}"`]
          : []),
      ],
      candidateAvoid: [
        "Quoting penalties or criminal provisions without enrolled-act verification",
        "Personal attacks on Hammer's motives",
        narrative.strategicBriefing.whenNotToUse,
      ],
    },
    {
      level: "expert",
      label: "Expert — staff + cross-exam",
      summary: "Full record context: theme matrix, 2021 package continuity, supporter/counter balance, and second/third response rounds.",
      steps: [
        ...narrative.counterArguments.map((c) => `Counter: ${c}`),
        ...narrative.supporterArguments.map((s) => `Supporter view (acknowledge): ${s}`),
        `Strategic when-to-use: ${narrative.strategicBriefing.whenToUse}`,
        `Debate impact: ${narrative.strategicBriefing.debateImpact}`,
        ...(row?.keyProvisions?.map((p) => `Key provision: ${p}`) ?? []),
      ],
      candidateDo: [
        "Hold two backup county examples (verify before stage)",
        "Quote one enrolled section if claims gate clears",
        "Pivot to theme matrix row if moderator broadens question",
      ],
      candidateAvoid: [
        "Inventing funding figures not in act text",
        "Claiming fraud without sourced conviction data",
        "Using this bill when strategic briefing says when-not-to-use applies",
      ],
    },
  ];
}

function buildStepByStepCoverage(
  narrative: V3BillNarrative,
  playbook: BillOperatorPlaybook,
  arklegUrl: string | null,
): BillActProofDeep["stepByStepCoverage"] {
  return [
    {
      phase: "1 · Research (T-48h)",
      whatHappens: "Staff verifies enrolled act text on Arkleg; marks county-impact sections.",
      kellyMove: "Read plain-English summary once; do not memorize penalties until verified.",
      backupEvidence: arklegUrl ?? "Arkleg bill detail — session year required",
    },
    {
      phase: "2 · Prep (T-24h)",
      whatHappens: "Rehearse 30s and 60s answers; staff plays Hammer counter.",
      kellyMove: playbook.debateUse.openingLine,
      backupEvidence: playbook.debateUse.actAnchor,
    },
    {
      phase: "3 · Debate — if bill named",
      whatHappens: "Hammer cites bill number fast; moderator may ask county impact.",
      kellyMove: `${narrative.debateFrames.kellyFrame} Bridge: ${playbook.debateUse.kellyBridge}`,
      backupEvidence: narrative.debateFrames.countyFrame,
    },
    {
      phase: "4 · Debate — if Hammer counters",
      whatHappens: "He claims integrity or clerk partnership without funding detail.",
      kellyMove: playbook.debateUse.rebuttalIfHeCounters,
      backupEvidence: playbook.trapSetup?.kellyPivotWhenHeBites ?? "Ask for implementation funding line",
    },
    {
      phase: "5 · Second response round",
      whatHappens: "He doubles down on bill list or pivots to 2020.",
      kellyMove: "One sentence agree + one fresh county line + SOS service close.",
      backupEvidence: playbook.kellyDifference,
    },
    {
      phase: "6 · Third response / spin room",
      whatHappens: "Press asks for specifics; trap may replay on social.",
      kellyMove: "Repeat act number + county burden only — no new claims.",
      backupEvidence: "Claims ledger entry required before social thread",
    },
  ];
}

function buildOpponentResponses(
  narrative: V3BillNarrative,
  playbook: BillOperatorPlaybook,
): BillActProofDeep["opponentExpectedResponses"] {
  const rows: BillActProofDeep["opponentExpectedResponses"] = [
    {
      speaker: "Hammer",
      round: 1,
      likelyLine: narrative.debateFrames.hammerFrame,
      kellyRebuttal: playbook.debateUse.openingLine,
    },
    {
      speaker: "Hammer",
      round: 2,
      likelyLine: playbook.debateUse.rebuttalIfHeCounters.includes("Acknowledge")
        ? "I funded clerks / this was bipartisan / check my record."
        : playbook.debateUse.rebuttalIfHeCounters,
      kellyRebuttal: playbook.debateUse.rebuttalIfHeCounters,
    },
    {
      speaker: "Hammer",
      round: 3,
      likelyLine: playbook.trapSetup?.baitLineYouWantFromOpponent ?? `I'm proud of ${narrative.billNumber}.`,
      kellyRebuttal: playbook.trapSetup?.kellyPivotWhenHeBites ?? playbook.kellyDifference,
    },
    {
      speaker: "Packo",
      round: 1,
      likelyLine: "Both major parties keep tightening ballot access — we need real reform.",
      kellyRebuttal:
        "Dr. Pakko raises fair reform questions — my job is administering elections in all 75 counties every day, not writing another rule without implementation support.",
    },
    {
      speaker: "Packo",
      round: 2,
      likelyLine: "Kelly was an activist on petitions — can she be neutral?",
      kellyRebuttal:
        "I believe in lawful participation and transparent rules — SOS serves every voter and every lawful petition drive equally.",
    },
  ];
  return rows;
}

export function buildBillActProofDeep(
  narrative: V3BillNarrative,
  opts?: { inIntegrity2021?: boolean; themeLabels?: string[] },
): BillActProofDeep {
  const row = findBillIndexRow(narrative.billNumber);
  const playbook = getBillOperatorPlaybook(narrative.billNumber, narrative, opts);
  const arklegBillUrl = resolveArklegBillUrl(narrative.billNumber, row);
  const sourceLinks = [
    ...(row?.sourceLinks?.filter((u) => u.startsWith("http")) ?? []),
    ...(arklegBillUrl && !row?.sourceLinks?.includes(arklegBillUrl) ? [arklegBillUrl] : []),
  ];

  return {
    billNumber: narrative.billNumber,
    actNumber: narrative.actNumber ?? row?.actNumber ?? null,
    sessionYear: row?.sessionYear ?? "verify session on bill index",
    title: row?.title ?? narrative.title,
    hammerRole: row?.hammerRole ?? "sponsor or co-sponsor — verify on Arkleg",
    narrative,
    playbook,
    arklegBillUrl,
    arklegActPdfUrl: resolveActPdfUrl(row),
    sourceLinks: [...new Set(sourceLinks)],
    definitions: buildDefinitions(narrative, row),
    educationTiers: buildEducationTiers(narrative, playbook, row),
    stepByStepCoverage: buildStepByStepCoverage(narrative, playbook, arklegBillUrl),
    opponentExpectedResponses: buildOpponentResponses(narrative, playbook),
    inIntegrity2021: opts?.inIntegrity2021 ?? false,
    themeLabels: opts?.themeLabels ?? [],
  };
}

export function listAllBillNumbersFromIndex(): string[] {
  return loadBillIndex().map((r) => r.billNumber);
}
