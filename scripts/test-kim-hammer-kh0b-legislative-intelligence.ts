import fs from "node:fs";
import path from "node:path";
import { loadKimHammerWorkbench } from "@/lib/opposition/kimHammerWorkbench";
import {
  FOUNDATION_REL,
  NARRATIVES_REL,
  COUNTY_BURDEN_REL,
  CHRONOLOGY_REL,
  findKimHammerBillNarrative,
  loadKimHammerIntegrityFoundation2021,
  loadKimHammerLegislativeChronology,
  loadKimHammerLegislativeNarratives,
} from "@/lib/opposition/kimHammerLegislativeNarratives";
import { loadKimHammerBriefingHub } from "@/lib/opposition/kimHammerModuleBriefings";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const FOUNDATION_BILLS = ["SB486", "SB487", "SB488", "SB582", "SB643", "SB644"];
const MISSING_2023 = ["SB254", "SB258", "SB272", "SB273", "SB292"];

function main() {
  for (const rel of [NARRATIVES_REL, FOUNDATION_REL, COUNTY_BURDEN_REL, CHRONOLOGY_REL]) {
    assert(fs.existsSync(path.join(process.cwd(), rel)), `Missing KH-0B artifact: ${rel}`);
  }

  const election = loadKimHammerWorkbench();
  assert(
    election.totalBills >= 28,
    `Bill index should include KH-0B additions (>=28); got ${election.totalBills}.`,
  );

  for (const billNumber of [...FOUNDATION_BILLS, ...MISSING_2023]) {
    const row = election.bills.find((bill) => bill.billNumber === billNumber);
    assert(row, `Bill index must include ${billNumber}.`);
    assert(row!.plainEnglishSummary, `${billNumber} must have plainEnglishSummary.`);
    if (FOUNDATION_BILLS.includes(billNumber)) {
      assert(
        row!.legislativePackageId === "kh0b-2021-integrity-foundation",
        `${billNumber} must link to 2021 foundation package.`,
      );
    }
  }

  const narratives = loadKimHammerLegislativeNarratives();
  assert(narratives.bills.length === 11, `Narratives file must include 11 bills; got ${narratives.bills.length}.`);
  assert(
    narratives.governanceRule.includes("INTERPRETATION"),
    "Narratives governance rule must flag INTERPRETATION discipline.",
  );

  for (const billNumber of FOUNDATION_BILLS) {
    const narrative = findKimHammerBillNarrative(billNumber);
    assert(narrative, `Narrative intelligence required for ${billNumber}.`);
    assert(narrative!.plainEnglishSummary.length > 20, `${billNumber} plainEnglishSummary too short.`);
    assert(
      narrative!.strategicBriefing.howToMessage.length > 0,
      `${billNumber} must include strategic howToMessage.`,
    );
    assert(narrative!.debateFrames.length > 0, `${billNumber} must include debate frames.`);
  }

  const foundation = loadKimHammerIntegrityFoundation2021();
  assert(foundation.billNumbers.length === 6, "2021 foundation package must list 6 bills.");
  assert(foundation.narrativeArc.length >= 5, "Foundation package must include narrative arc.");
  assert(
    foundation.strategicBriefing.debateImpact.length > 0,
    "Foundation package must include strategic debate impact.",
  );

  const chronology = loadKimHammerLegislativeChronology();
  assert(chronology.years.length >= 3, "Chronology must include multiple session years.");
  assert(
    chronology.years.some((year) => year.year === "2021"),
    "Chronology must include 2021 foundation year.",
  );

  const hub = loadKimHammerBriefingHub();
  for (const moduleId of [
    "integrity-foundation-2021",
    "county-administration-burden",
    "legislative-chronology",
  ]) {
    const briefing = hub.moduleBriefings[moduleId];
    assert(briefing, `Briefing hub must include module ${moduleId}.`);
    assert(
      briefing!.strategicBriefing?.howToMessage?.length,
      `${moduleId} briefing must include strategic messaging sections.`,
    );
  }

  const shellSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/KimHammerBriefingPageShell.tsx"),
    "utf8",
  );
  assert(
    shellSource.includes("KimHammerStrategicBriefingPanel"),
    "Briefing shell must render strategic messaging panel.",
  );

  const timeline = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data/opposition/kim-hammer-election-record-timeline.json"), "utf8"),
  ) as { rows: Array<{ year: string; billOrAct: string }> };
  assert(
    timeline.rows.some((row) => row.billOrAct.startsWith("SB486")),
    "Timeline must include 2021 foundation bill SB486.",
  );

  console.log("Kim Hammer KH-0B legislative intelligence checks passed.");
  console.log(
    JSON.stringify(
      {
        totalBills: election.totalBills,
        narrativeBillCount: narratives.bills.length,
        foundationBills: foundation.billNumbers,
        chronologyYears: chronology.years.map((y) => y.year),
        arcHeadline: chronology.arcHeadline,
      },
      null,
      2,
    ),
  );
}

main();
