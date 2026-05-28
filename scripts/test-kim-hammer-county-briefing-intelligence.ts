import fs from "node:fs";
import path from "node:path";
import {
  computeCountyMessagingGuidance,
  computeCountyOppositionBillPriorities,
  loadCountyBriefingIntelligenceIndex,
  resolveCountyBriefingIntelligence,
  summarizeCountyBriefingForEvidenceCommand,
} from "@/lib/intelligence/countyBriefingIntelligence";
import { resolveCountyGraphBundle } from "@/lib/intelligence/campaignIntelligenceGraph";
import { COUNTY_BRIEFING_SIGNALS } from "@/lib/intelligence/types/countyBriefingIntelligence";
import { resolveNarrativeDoctrineAlignment } from "@/lib/intelligence/campaignStrategicAlignment";
import { computeKimHammerBillCivicIntelligence } from "@/lib/intelligence/kimHammerBillCivicIntelligence";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import { findKimHammerBill } from "@/lib/opposition/kimHammerWorkbench";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_COUNTY_IDS = [
  "statewide",
  "pulaski",
  "washington",
  "benton",
  "sebastian",
  "craighead",
];

const REQUIRED_FILES = [
  "src/lib/intelligence/countyBriefingIntelligence.ts",
  "src/lib/intelligence/types/countyBriefingIntelligence.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCountyBriefingPanel.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/county-briefings/page.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/counties/[countyId]/page.tsx",
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-5 artifact: ${relPath}`);
  }

  const registrySource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerBriefingRegistry.ts"),
    "utf8",
  );
  assert(registrySource.includes('"county-briefings"'), "Briefing registry must include county-briefings module.");

  const debateSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/debate-prep/page.tsx"),
    "utf8",
  );
  assert(debateSource.includes("NSI-5"), "Debate prep must integrate NSI-5 county guidance.");

  const evidenceSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
    ),
    "utf8",
  );
  assert(evidenceSource.includes("county-briefings"), "Evidence Command must link to county briefings.");

  const index = loadCountyBriefingIntelligenceIndex();
  assert(index.countyCount === 6, `Expected 6 NSI-2 counties; got ${index.countyCount}.`);

  for (const countyId of REQUIRED_COUNTY_IDS) {
    const briefing = resolveCountyBriefingIntelligence(countyId);
    assert(briefing, `County briefing must resolve: ${countyId}.`);
    assert(briefing.briefingSignals.length > 0, `${countyId} must emit county briefing signals with WHY.`);
    assert(briefing.recommendedMessagingFrames.length > 0, `${countyId} must resolve messaging guidance.`);
  }

  const pulaski = resolveCountyBriefingIntelligence("pulaski");
  assert(pulaski, "Pulaski briefing required.");
  const pulaskiBills = computeCountyOppositionBillPriorities("pulaski");
  assert(
    pulaskiBills.some((row) => row.billNumber === "SB487"),
    "Pulaski must rank SB487 from NSI-4 bill civic intelligence.",
  );

  const sb487 = findKimHammerBill("SB487");
  assert(sb487, "SB487 must exist.");
  const civic = computeKimHammerBillCivicIntelligence(sb487);
  assert(civic.civicSignalText.length > 0, "Bill civic intelligence must feed county civic impacts.");

  const alignment = resolveNarrativeDoctrineAlignment("kh0b-county-administration-burden");
  assert(alignment, "SDI-1 doctrine alignment must resolve for county narratives.");

  const messaging = computeCountyMessagingGuidance("washington");
  assert(messaging.recommendedMessagingFrames.length > 0, "Washington messaging guidance required.");

  const graphBundle = resolveCountyGraphBundle("pulaski");
  assert(graphBundle.countyEntity?.entityType === "COUNTY", "County graph bundle must resolve county entity.");

  const evidenceSummary = summarizeCountyBriefingForEvidenceCommand();
  assert(evidenceSummary.countyCount === 6, "Evidence Command county summary must track 6 counties.");

  for (const signal of COUNTY_BRIEFING_SIGNALS) {
    assert(typeof signal === "string", "County briefing signal enum must be defined.");
  }

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-5 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  console.log("Kim Hammer county briefing intelligence (NSI-5) checks passed.");
  console.log(
    JSON.stringify(
      {
        countyCount: index.countyCount,
        pulaskiConfidence: pulaski.confidenceBand,
        pulaskiTopBill: pulaskiBills[0]?.billNumber,
        pulaskiSignals: pulaski.briefingSignals.map((row) => row.signal),
        exportReadyClaims: evidenceIndex.metrics.exportReadyClaims,
        routes: [
          "/admin/intelligence/kim-hammer/county-briefings",
          "/admin/intelligence/kim-hammer/counties/pulaski",
        ],
      },
      null,
      2,
    ),
  );
}

main();
