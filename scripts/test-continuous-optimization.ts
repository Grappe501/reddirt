/**
 * Continuous Optimization — Phase 4C smoke test.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { loadCampaignOrchestrationSignals } from "../src/lib/agents/orchestration/load-campaign-orchestration-signals";
import { runOrchestrationReasoning } from "../src/lib/agents/orchestration/orchestration-reasoning-engine";
import { buildAgentToolingState } from "../src/lib/agents/orchestration/tooling/agent-tooling-state";
import { buildCrossDomainOrchestrationState } from "../src/lib/agents/orchestration/cross-domain/cross-domain-orchestration-state";
import { buildContinuousOptimizationState } from "../src/lib/agents/orchestration/optimization/continuous-optimization-state";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

async function main() {
  const period = "2026-04";
  const role = "campaign_manager";
  const { state, sourceHealth } = await loadCampaignOrchestrationSignals(period, { pathname: "/admin/orchestration", role });
  const diagnosis = runOrchestrationReasoning(state);
  const agentTooling = buildAgentToolingState({ state, sourceHealth, diagnosis, role, period });
  const crossDomainOrchestration = buildCrossDomainOrchestrationState({ state, sourceHealth, agentTooling, role, period });
  const optimization = buildContinuousOptimizationState({ state, sourceHealth, agentTooling, crossDomainOrchestration });

  console.log("Continuous optimization test (Phase 4C)");
  console.log("  signals:", optimization.signals.length);
  console.log("  weak domains:", optimization.weakDomainCount);
  console.log("  stale feedback:", optimization.staleFeedbackCount);
  console.log("  tool gaps:", optimization.toolGapCount);
  console.log("  dependency warnings:", optimization.dependencyWarningCount);
  console.log("  next:", optimization.recommendedNextImprovement?.title ?? "none");

  const ok =
    optimization.safety.readOnly &&
    optimization.safety.autoExecutionDisabled &&
    optimization.safety.humanGateRequired &&
    optimization.signals.every((s) => s.expectedCampaignStateImprovement.length > 20) &&
    optimization.summary.length > 10;

  if (!ok) {
    console.error("FAIL", { optimization });
    process.exit(1);
  }

  console.log("OK — continuous optimization state, signals, and safety");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
