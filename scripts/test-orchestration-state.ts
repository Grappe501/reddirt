/**
 * Live CampaignState orchestration smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { buildOrchestrationStatePayload } from "../src/lib/agents/orchestration/build-orchestration-payload";
import { ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS } from "../src/lib/agents/orchestration/orchestration-tool-contracts";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

async function main() {
  const payload = await buildOrchestrationStatePayload("2026-04");

  console.log("Orchestration state test");
  console.log("  ok:", payload.ok);
  console.log("  operatingMode:", payload.campaignState.operatingMode);
  console.log("  isLive:", payload.campaignState.isLive);
  console.log("  sources:", payload.sourceHealth.length);
  console.log("  ready sources:", payload.sourceHealth.filter((s) => s.status === "ready").length);
  console.log("  blockers:", payload.blockers.length);
  console.log("  topMoves:", payload.topMoves.length);
  console.log("  workflows:", payload.recommendedWorkflows.length);
  console.log("  executiveSummary:", payload.diagnosis.executiveSummary.slice(0, 80));
  console.log("  safety.autoExecutionDisabled:", payload.safety.autoExecutionDisabled);
  console.log("  safety.restrictedActions:", payload.safety.restrictedActions.length);

  console.log("  knowledge entities:", payload.campaignState.knowledge.graphHealth.entityCount);
  console.log("  knowledge lessons:", payload.campaignState.knowledge.graphHealth.lessonCount);

  const hasSourceHealth = payload.sourceHealth.every((s) => ["ready", "degraded", "missing", "error"].includes(s.status));
  const hasSafety =
    payload.safety.humanGateRequired === true &&
    payload.safety.autoExecutionDisabled === true &&
    payload.safety.restrictedActions.length >= ORCHESTRATION_FORBIDDEN_AUTO_ACTIONS.length;
  const hasMoves = payload.topMoves.length >= 1;
  const hasWorkflows = payload.recommendedWorkflows.length >= 1;
  const hasState = payload.campaignState.currentPeriod === "2026-04";
  const massBlocked = payload.campaignState.commsReadiness.massEmailBlocked === true;
  const liveOrDegraded = payload.campaignState.operatingMode === "live" || payload.campaignState.operatingMode === "degraded";
  const hasMeta = payload.meta?.period === "2026-04";

  const hasKnowledge = payload.campaignState.knowledge != null && typeof payload.campaignState.knowledge.graphHealth.entityCount === "number";
  const ok = hasSourceHealth && hasSafety && hasMoves && hasWorkflows && hasState && massBlocked && payload.safety.safetyCheckOk && liveOrDegraded && hasMeta && payload.learningInsights != null && hasKnowledge;

  if (!ok) {
    console.error("FAIL", { hasSourceHealth, hasSafety, hasMoves, hasWorkflows, massBlocked, hasKnowledge });
    process.exit(1);
  }
  console.log("OK — live CampaignState payload built with safety gates");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
