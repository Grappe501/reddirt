import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { listRoleCopilotIds, getRoleCopilot } from "../src/lib/agents/role-copilots/role-copilot-registry";
import {
  buildCopilotIntelligenceBrief,
  scoreCopilotReadiness,
  isHighRiskAutonomousAction,
} from "../src/lib/agents/role-copilots/copilot-intelligence-engine";
import { buildCopilotTaskPackage } from "../src/lib/agents/role-copilots/copilot-task-package-builder";
import { SPRINT_COPILOT_TOOLING_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-copilot-tooling-tools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

const REQUIRED_ROLES = listRoleCopilotIds();

function main() {
  let ok = true;
  for (const role of REQUIRED_ROLES) {
    if (!getRoleCopilot(role)) {
      console.error("Missing copilot:", role);
      ok = false;
    }
  }

  const brief = buildCopilotIntelligenceBrief({
    role: "campaign_manager",
    skillLevel: "intermediate",
    pathname: "/admin/campaign-events/workbench",
    month: "2026-03",
    osSnapshot: { activeBlockers: ["sync stale"], pendingApprovals: 2 },
  });

  const pkg = buildCopilotTaskPackage("treasurer", "finance", { title: "Review packet" });
  const readiness = scoreCopilotReadiness("intern", "beginner", []);
  const blocked = isHighRiskAutonomousAction("send mass email to voters");
  const tools = SPRINT_COPILOT_TOOLING_TOOL_CONTRACTS;

  console.log("Copilot tooling test");
  console.log("  roles:", REQUIRED_ROLES.length);
  console.log("  brief next:", brief.recommendedNextTask.title);
  console.log("  top3:", brief.topThreeTasks.length);
  console.log("  tools registered:", tools.length);
  console.log("  functional:", tools.filter((t) => t.currentStatus === "functional").length);
  console.log("  readiness:", readiness.dimensions.overall, readiness.label);
  console.log("  blocks high-risk:", blocked);

  if (
    !ok ||
    REQUIRED_ROLES.length !== 15 ||
    !brief.recommendedNextTask.title ||
    brief.topThreeTasks.length < 3 ||
    tools.length < 25 ||
    !blocked ||
    !pkg.safeOnly
  ) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("PASS");
}

main();
