/**
 * County Intelligence V2 — copilot application smoke test (read-only).
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCountyActionPackage } from "../src/lib/agents/county-intelligence/county-action-package-builder";
import {
  applyCountyIntelToCopilot,
  buildFieldManagerDailyCountyPlan,
  buildCandidateCountyBriefing,
} from "../src/lib/agents/county-intelligence/county-copilot-applications";
import { DASHBOARD_COMPONENT_REGISTRY } from "../src/lib/agents/dashboard-builder/dashboard-component-registry";
import { listTrainingModules } from "../src/lib/agents/training/training-module-registry";
import { SPRINT_COUNTY_INTELLIGENCE_V2_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-county-intelligence-v2-tools";
import { resetCountyWorkbenchAdapterCache } from "../src/lib/agents/county-intelligence/county-workbench-adapter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

const COUNTY_BLOCKS = [
  "county_priority_list",
  "county_action_package",
  "county_power_of_five_gaps",
  "county_registration_progress",
  "county_volunteer_gap",
  "county_event_recommendation",
  "county_comms_prompt",
  "candidate_county_briefing",
  "intern_county_tasks",
  "field_manager_county_plan",
] as const;

const COUNTY_TRAINING_IDS = [
  "tr-county-read-dashboard-v2",
  "tr-county-kpi-v2",
  "tr-county-po5-interpret-v2",
  "tr-county-event-plan-v2",
  "tr-brief-kelly-county-v2",
  "tr-county-volunteer-gaps-v2",
  "tr-hotwash-county-memory-v2",
  "tr-county-comms-intel-v2",
  "tr-intern-county-data-v2",
  "tr-field-prioritize-counties-v2",
];

function main() {
  const pulaski = buildCountyActionPackage("pulaski", "county_recovery");
  const fieldPlan = buildFieldManagerDailyCountyPlan();
  const candidate = buildCandidateCountyBriefing("pulaski");
  const fieldCopilot = applyCountyIntelToCopilot("field_manager");
  const modules = listTrainingModules();
  const registryIds = new Set(DASHBOARD_COMPONENT_REGISTRY.map((b) => b.id));
  const trainingOk = COUNTY_TRAINING_IDS.every((id) => modules.some((m) => m.id === id));
  const blocksOk = COUNTY_BLOCKS.every((id) => registryIds.has(id));

  console.log("County copilots V2 test");
  console.log("  pulaski package:", pulaski?.countyName ?? "missing");
  console.log("  field plan tasks:", fieldPlan.dailyFieldTasks.length);
  console.log("  candidate briefing:", candidate?.county.countyName ?? "missing");
  console.log("  field copilot packages:", fieldCopilot.recommendedPackages.length);
  console.log("  v2 tools:", SPRINT_COUNTY_INTELLIGENCE_V2_TOOL_CONTRACTS.length);
  console.log("  training modules:", trainingOk ? "ok" : "FAIL");
  console.log("  dashboard blocks:", blocksOk ? "ok" : "FAIL");

  const ok =
    pulaski != null &&
    pulaski.fieldTaskList.length >= 1 &&
    fieldPlan.topWeakCounties.length >= 1 &&
    candidate != null &&
    fieldCopilot.dailyPlan != null &&
    SPRINT_COUNTY_INTELLIGENCE_V2_TOOL_CONTRACTS.length === 15 &&
    trainingOk &&
    blocksOk;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — Pulaski package, field plan, candidate brief, modules, blocks (read-only)");
}

main();
