import fs from "node:fs";
import path from "node:path";
import {
  buildAggregateCampaignIntelligenceIndex,
  CAMPAIGN_INTELLIGENCE_READ_ADAPTERS_REL,
  computeCountyOperationalEnvironment,
  loadCampaignIntelligenceReadAdapters,
  summarizeOperationalIntelligenceForEvidenceCommand,
} from "@/lib/intelligence/aggregateCampaignIntelligence";
import { COUNTY_OPERATIONAL_SIGNALS } from "@/lib/intelligence/types/aggregateCampaignIntelligence";
import {
  loadCountyBriefingIntelligenceIndex,
  resolveCountyBriefingIntelligence,
} from "@/lib/intelligence/countyBriefingIntelligence";
import {
  reconcileCountyOverlayWithWorkbench,
  summarizeCountyWorkbenchSynchronization,
} from "@/lib/intelligence/countyWorkbenchSynchronization";
import {
  computeCountyClusterReadiness,
  resolveRegionalNarrativeClusters,
  summarizeRegionalDeploymentConditions,
} from "@/lib/intelligence/regionalStrategicModeling";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  CAMPAIGN_INTELLIGENCE_READ_ADAPTERS_REL,
  "src/lib/intelligence/aggregateCampaignIntelligence.ts",
  "src/lib/intelligence/countyWorkbenchSynchronization.ts",
  "src/lib/intelligence/regionalStrategicModeling.ts",
  "src/lib/intelligence/types/aggregateCampaignIntelligence.ts",
];

const FORBIDDEN_OUTPUT_PATTERNS = [
  /voterId/i,
  /householdId/i,
  /microtarget/i,
  /persuasionScore/i,
  /individual voter/i,
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-6 artifact: ${relPath}`);
  }

  const panelSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/KimHammerCountyBriefingPanel.tsx"),
    "utf8",
  );
  assert(panelSource.includes("NSI-6"), "County briefing panel must render NSI-6 operational sections.");

  const debateSource = fs.readFileSync(
    path.join(process.cwd(), "src/app/admin/(board)/intelligence/kim-hammer/debate-prep/page.tsx"),
    "utf8",
  );
  assert(debateSource.includes("NSI-6"), "Debate prep must integrate NSI-6 regional overlays.");

  const evidenceSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
    ),
    "utf8",
  );
  assert(evidenceSource.includes("Operational environment intelligence"), "Evidence Command must show operational alerts.");

  const adapters = loadCampaignIntelligenceReadAdapters();
  assert(adapters.adapters.length >= 12, `Expected at least 12 read adapters; got ${adapters.adapters.length}.`);
  assert(
    adapters.adapters.every((row) => row.aggregateOnly === true),
    "All adapters must be aggregate-only.",
  );

  const sync = summarizeCountyWorkbenchSynchronization();
  assert(sync.countyCount === 6, "CountyWorkbench sync must cover 6 NSI-2 overlays.");
  assert(sync.records.every((row) => row.identity.countyId), "Each sync record must normalize countyId.");

  const pulaski = resolveCountyBriefingIntelligence("pulaski");
  assert(pulaski?.operationalIntelligence, "Pulaski must include operational environment.");
  assert(
    pulaski.operationalIntelligence.operationalSignals.length > 0,
    "Pulaski must emit operational signals with WHY.",
  );
  assert(
    pulaski.operationalIntelligence.operationalSignals.some((row) => row.signal === "COUNTY_STRUCTURALLY_COMPLEX"),
    "Pulaski expected structurally complex operational signal.",
  );

  const clusters = resolveRegionalNarrativeClusters();
  assert(clusters.length >= 5, "Regional narrative clusters must derive from county groupings.");

  const pulaskiCluster = computeCountyClusterReadiness("pulaski");
  assert(pulaskiCluster.clusterId === "cluster-central-urban", "Pulaski must map to central urban cluster.");

  const index = loadCountyBriefingIntelligenceIndex();
  const aggregate = buildAggregateCampaignIntelligenceIndex(index.counties);
  assert(aggregate.countiesEnriched === 6, "Aggregate intelligence must enrich 6 counties.");

  const operationalSummary = summarizeOperationalIntelligenceForEvidenceCommand(index.counties);
  assert(operationalSummary.adapterCount >= 12, "Operational summary must reference adapter registry.");

  for (const signal of COUNTY_OPERATIONAL_SIGNALS) {
    assert(typeof signal === "string", "Operational signal enum must be defined.");
  }

  const serialized = JSON.stringify(pulaski.operationalIntelligence);
  for (const pattern of FORBIDDEN_OUTPUT_PATTERNS) {
    assert(!pattern.test(serialized), `Operational output must not include voter-level pattern: ${pattern}`);
  }

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-6 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  const engineSource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/intelligence/aggregateCampaignIntelligence.ts"),
    "utf8",
  );
  assert(!engineSource.includes("prisma"), "NSI-6 engine must not introduce Prisma migration paths.");
  assert(!engineSource.includes("autoPublish"), "NSI-6 must not introduce mutation workflows.");

  console.log("Campaign operational intelligence (NSI-6) checks passed.");
  console.log(
    JSON.stringify(
      {
        adapterCount: adapters.adapters.length,
        liveAdapters: adapters.adapters.filter((row) => row.sourceStatus === "LIVE").length,
        pulaskiOperationalSignals: pulaski.operationalIntelligence.operationalSignals.map((row) => row.signal),
        pulaskiStructurallyComplex: pulaski.operationalIntelligence.operationalSignals.find(
          (row) => row.signal === "COUNTY_STRUCTURALLY_COMPLEX",
        )?.text.slice(0, 140),
        clusterCount: clusters.length,
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
