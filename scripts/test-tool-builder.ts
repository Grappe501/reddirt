import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import {
  loadToolBuildQueue,
  createToolBuildTicket,
  detectToolGapsFromObservations,
  convertWorkflowProblemToToolSpec,
  scoreToolBuildPriority,
} from "../src/lib/agents/tool-builder/tool-builder-queue";
import { SPRINT_KELLY_INTELLIGENCE_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-kelly-intelligence-tools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
loadRedDirtEnv(root);

function main() {
  const queue = loadToolBuildQueue(root);
  const spec = convertWorkflowProblemToToolSpec("volunteer slots empty", "volunteer_management");
  const score = scoreToolBuildPriority({
    riskLevel: "low",
    expectedImpact: "high",
    workflowAffected: "volunteer",
  });
  const gaps = detectToolGapsFromObservations(root);
  const functional = SPRINT_KELLY_INTELLIGENCE_TOOL_CONTRACTS.filter((t) => t.currentStatus === "functional").length;

  const ok = queue.length >= 3 && spec.proposedToolName && score > 50 && functional >= 20;
  console.log("Queue:", queue.length, "gaps:", gaps.length, "functional tools:", functional);
  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("PASS");
}

main();
