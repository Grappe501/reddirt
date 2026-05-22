import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRedDirtEnv } from "./load-red-dirt-env";
import { buildDashboardBlueprint } from "../src/lib/agents/dashboard-builder/dashboard-blueprint-builder";
import { getCopilotDashboardModules } from "../src/lib/agents/role-copilots/role-copilot-dashboard-map";
import { getRoleAllowedModules } from "../src/lib/agents/progression/unlock-engine";
import { getLockedDashboardModules } from "../src/lib/agents/training/training-unlock-engine";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const bp = buildDashboardBlueprint({
    roleLabel: "campaign_manager",
    taskDescription: "March ops",
    detailLevel: "simple",
    month: "2026-03",
  });
  const modules = getCopilotDashboardModules("campaign_manager", 1);
  const allowed = getRoleAllowedModules("treasurer", 1);
  const locked = getLockedDashboardModules(modules, []);
  const ok = bp.blocks.length >= 2 && modules.length >= 2 && allowed.length >= 2;
  console.log("Blueprint blocks:", bp.blocks.length, "modules:", modules.length, "locked:", locked.length);
  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("PASS");
}

main();
