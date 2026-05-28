import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { steveStrategyDoctrineReader } from "../src/lib/strategy-brain/steveStrategyDoctrineReader";
import { arkansasGrassrootsPrinciplesReader } from "../src/lib/strategy-brain/arkansasGrassrootsPrinciples";
import { rockefellerGrassrootsCaseStudyReader } from "../src/lib/strategy-brain/rockefellerCaseStudyReader";
import { relationalOrganizingPlaybookReader } from "../src/lib/strategy-brain/relationalOrganizingPlaybook";
import { gotvBackwardCalendarPlanner } from "../src/lib/strategy-brain/gotvBackwardCalendarModel";
import { pollWatcherCoveragePlanner } from "../src/lib/strategy-brain/pollWatcherCoverageModel";
import { eventVisibilityOpportunityReader } from "../src/lib/strategy-brain/eventVisibilityPlaybook";
import { strategyDoctrineReadinessAudit } from "../src/lib/strategy-brain/strategyDoctrineReadinessAudit";
import { COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION } from "../src/lib/agents/orchestration/county-intelligence-copilot-registry";
import { CAMPAIGN_BRAIN_OPERATING_MODEL } from "../src/lib/agents/orchestration/campaign-brain-operating-model-registry";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const doctrine = steveStrategyDoctrineReader();
  const principles = arkansasGrassrootsPrinciplesReader();
  const rockefeller = rockefellerGrassrootsCaseStudyReader();
  const relational = relationalOrganizingPlaybookReader();
  const gotv = gotvBackwardCalendarPlanner();
  const pollWatcher = pollWatcherCoveragePlanner();
  const visibility = eventVisibilityOpportunityReader();
  const readiness = strategyDoctrineReadinessAudit();

  const doctrineArtifactsLoad =
    doctrine.pillars.length > 0 &&
    principles.principles.length > 0 &&
    relational.playbook.operationalPatterns.length > 0 &&
    visibility.eventTypes.length > 0;
  const rockefellerSourceConfidenceFields = rockefeller.caseStudy.campaignYears.every(
    (row) => row.sourceConfidence && row.directlySourced.length > 0,
  );
  const gotvBackwardModelLoads = gotv.timeline.length >= 4;
  const pollWatcherCoverageModelLoads =
    pollWatcher.requiredFields.length >= 10 &&
    String(pollWatcher.countyCoverageTemplate.coverageStatus).length > 0;
  const toolsRegistered =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.toolGroups.strategyDoctrineLayer.length === 10;
  const missingDataRemainsSurfaced =
    readiness.needsReview.length > 0 &&
    rockefeller.caseStudy.campaignYears.some((row) => row.needsMoreResearch.length > 0);
  const noTargetingContactAutomation =
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("target individual voters") &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.cannot.includes("generate contact lists") &&
    COUNTY_INTELLIGENCE_COPILOT_ORCHESTRATION.executionPolicy.automationEnabled === false;
  const orchestrationRuntimeStillBuilds =
    CAMPAIGN_BRAIN_OPERATING_MODEL.phase === "5A" &&
    CAMPAIGN_BRAIN_OPERATING_MODEL.strategyDoctrineLayer.mode === "READ_ONLY_STRATEGY_DOCTRINE_INTAKE";

  console.log("Phase 5A strategy doctrine intake checks");
  console.log("  doctrine artifacts load:", doctrineArtifactsLoad);
  console.log("  Rockefeller source-confidence fields:", rockefellerSourceConfidenceFields);
  console.log("  GOTV backward model loads:", gotvBackwardModelLoads);
  console.log("  poll watcher coverage model loads:", pollWatcherCoverageModelLoads);
  console.log("  all strategy doctrine tools registered:", toolsRegistered);
  console.log("  missing data remains MISSING/NEEDS_REVIEW:", missingDataRemainsSurfaced);
  console.log("  no targeting/contact-list/automation permissions:", noTargetingContactAutomation);
  console.log("  orchestration runtime still builds:", orchestrationRuntimeStillBuilds);

  const ok =
    doctrineArtifactsLoad &&
    rockefellerSourceConfidenceFields &&
    gotvBackwardModelLoads &&
    pollWatcherCoverageModelLoads &&
    toolsRegistered &&
    missingDataRemainsSurfaced &&
    noTargetingContactAutomation &&
    orchestrationRuntimeStillBuilds;

  if (!ok) process.exit(1);
  console.log("OK — Phase 5A strategy doctrine intake checks passed");
}

main();

