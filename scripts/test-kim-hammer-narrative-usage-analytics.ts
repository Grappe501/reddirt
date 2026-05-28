import fs from "node:fs";
import path from "node:path";
import { loadKimHammerEvidenceIndex } from "@/lib/opposition/kimHammerEvidenceIndex";
import {
  CAMPAIGN_INTELLIGENCE_SYNCHRONIZATION_PLAN_REL,
  CAMPAIGN_INTELLIGENCE_SYSTEM_MAP_REL,
  computeNarrativeFatigue,
  computeNarrativeFreshness,
  computeNarrativeUsageAnalytics,
  resolveNarrativeDeploymentHistory,
  summarizeNarrativeUsageRisk,
} from "@/lib/opposition/kimHammerNarrativeUsageAnalytics";
import { loadGeographicNarrativeIndex } from "@/lib/opposition/kimHammerGeographicNarrativeState";
import { KIM_HAMMER_NARRATIVE_USAGE_SIGNALS } from "@/lib/opposition/types/kimHammerNarrativeUsageAnalytics";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const REQUIRED_FILES = [
  "src/lib/opposition/kimHammerNarrativeUsageAnalytics.ts",
  "src/lib/opposition/types/kimHammerNarrativeUsageAnalytics.ts",
  "src/app/admin/(board)/intelligence/kim-hammer/KimHammerNarrativeUsageAnalyticsDashboard.tsx",
  "src/app/admin/(board)/intelligence/kim-hammer/narrative-usage-analytics/page.tsx",
  CAMPAIGN_INTELLIGENCE_SYSTEM_MAP_REL,
  CAMPAIGN_INTELLIGENCE_SYNCHRONIZATION_PLAN_REL,
];

function main() {
  for (const relPath of REQUIRED_FILES) {
    assert(fs.existsSync(path.join(process.cwd(), relPath)), `Missing NSI-3 artifact: ${relPath}`);
  }

  const registrySource = fs.readFileSync(
    path.join(process.cwd(), "src/lib/opposition/kimHammerBriefingRegistry.ts"),
    "utf8",
  );
  assert(
    registrySource.includes('"narrative-usage-analytics"'),
    "Briefing registry must include narrative-usage-analytics module.",
  );

  const dashboardSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "src/app/admin/(board)/intelligence/kim-hammer/evidence-command/EvidenceCommandDashboard.tsx",
    ),
    "utf8",
  );
  assert(
    dashboardSource.includes("/narrative-usage-analytics"),
    "Evidence Command must link to narrative usage analytics.",
  );
  assert(
    dashboardSource.includes("Top fatigue warnings"),
    "Evidence Command must surface fatigue warnings.",
  );

  const index = computeNarrativeUsageAnalytics();
  assert(index.narrativeCount >= 8, "NSI-3 must track at least 8 narratives.");
  assert(index.totalDeployments >= 1, "NSI-3 must compose from seeded export history.");

  for (const signal of KIM_HAMMER_NARRATIVE_USAGE_SIGNALS) {
    assert(typeof index.signalCounts[signal] === "number", `Signal count missing for ${signal}.`);
  }

  const integrityDeployment = resolveNarrativeDeploymentHistory("kh0b-2021-integrity-foundation");
  assert(integrityDeployment.deploymentCount >= 1, "Integrity foundation must resolve export deployment via narrative or claim lineage.");

  const debateQuestionsDeployment = resolveNarrativeDeploymentHistory("debate-frame-debate-questions");
  assert(
    debateQuestionsDeployment.deploymentCount >= 1,
    "Debate questions frame must resolve deployment via export claim lineage (pdeb-003).",
  );

  const integrityFreshness = computeNarrativeFreshness("kh0b-2021-integrity-foundation");
  assert(
    integrityFreshness.freshnessScore >= 0 && integrityFreshness.freshnessScore <= 1,
    "Freshness score must be normalized 0-1.",
  );
  assert(integrityFreshness.signal.length > 0, "Freshness must explain WHY.");

  const integrityFatigue = computeNarrativeFatigue("kh0b-2021-integrity-foundation");
  assert(integrityFatigue, "Integrity foundation fatigue record must compute.");
  assert(integrityFatigue.signal.length > 0, "Fatigue signals must explain WHY.");
  assert(
    integrityFatigue.usageSignal === "USAGE_FRAGILE" ||
      integrityFatigue.usageSignal === "USAGE_STALE" ||
      integrityFatigue.usageSignal === "USAGE_RISING",
    `Deployed integrity foundation with citation gaps should show fatigue; got ${integrityFatigue.usageSignal}.`,
  );
  assert(
    integrityFatigue.exportLineageRefs.length >= 1,
    "Export lineage refs must resolve for deployed narratives.",
  );

  const geographic = loadGeographicNarrativeIndex();
  assert(geographic.countyCount === 6, "NSI-3 must integrate NSI-2 county overlays.");

  const countyBurden = computeNarrativeFatigue("kh0b-county-administration-burden");
  assert(countyBurden, "County burden narrative fatigue must compute.");
  if (countyBurden.deploymentCount === 0 && countyBurden.readinessBand !== "STRONG") {
    assert(
      countyBurden.geographicExposureCount >= 1,
      "County burden must reflect geographic overlay exposure.",
    );
  }

  for (const row of index.narratives) {
    assert(row.freshness.freshnessScore >= 0 && row.freshness.freshnessScore <= 1, "Per-narrative freshness normalized.");
    assert(row.signal.length > 0, "Every usage record must expose explanatory signal text.");
  }

  const commandSummary = summarizeNarrativeUsageRisk();
  assert(commandSummary.narrativeCount === index.narrativeCount, "Evidence command summary must match analytics index.");
  assert(
    commandSummary.synchronizationReadinessSummary.mappedSourceCount >= 20,
    "Campaign intelligence source map must document major systems.",
  );
  assert(
    commandSummary.synchronizationReadinessSummary.integratedSourceCount >= 8,
    "At least 8 LIVE integrations must be mapped for sync readiness.",
  );

  const syncDoc = fs.readFileSync(path.join(process.cwd(), CAMPAIGN_INTELLIGENCE_SYNCHRONIZATION_PLAN_REL), "utf8");
  assert(syncDoc.includes("No autonomous publishing"), "Synchronization plan must prohibit autonomous publishing.");
  assert(syncDoc.includes("NSI-4"), "Synchronization plan must document NSI-4 as next step.");

  const evidenceIndex = loadKimHammerEvidenceIndex();
  assert(
    evidenceIndex.metrics.exportReadyClaims === 2,
    `NSI-3 must not mutate export-ready count; expected 2, got ${evidenceIndex.metrics.exportReadyClaims}.`,
  );

  console.log("Kim Hammer narrative usage analytics checks passed.");
  console.log(
    JSON.stringify(
      {
        narrativeCount: index.narrativeCount,
        totalDeployments: index.totalDeployments,
        signalCounts: index.signalCounts,
        integrityFatigueSignal: integrityFatigue.usageSignal,
        debateQuestionsDeployments: debateQuestionsDeployment.deploymentCount,
        syncMappedSources: commandSummary.synchronizationReadinessSummary.mappedSourceCount,
        exportReadyClaims: evidenceIndex.metrics.exportReadyClaims,
        route: "/admin/intelligence/kim-hammer/narrative-usage-analytics",
      },
      null,
      2,
    ),
  );
}

main();
