/**
 * County intelligence bridge smoke test (read-only).
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isCountyWorkbenchBridgeAvailable } from "../src/lib/agents/county-intelligence/county-workbench-path";
import {
  listCountyWorkbenchCounties,
  loadCountyKpis,
  loadStatewideCountySummary,
  resetCountyWorkbenchAdapterCache,
} from "../src/lib/agents/county-intelligence/county-workbench-adapter";
import { identifyWeakCounties, buildCountyIntelligenceSummary } from "../src/lib/agents/county-intelligence/county-intelligence-engine";
import { buildPowerOfFiveBriefing, summarizePowerOfFiveForCounty } from "../src/lib/agents/county-intelligence/power-of-five-engine";
import { loadEventCountyContext } from "../src/lib/agents/county-intelligence/county-event-strategy";
import { SPRINT_COUNTY_INTELLIGENCE_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-county-intelligence-tools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));
resetCountyWorkbenchAdapterCache();

function main() {
  const bridge = isCountyWorkbenchBridgeAvailable();
  const counties = listCountyWorkbenchCounties();
  const pulaski = loadCountyKpis("pulaski");
  const weak = identifyWeakCounties(5);
  const statewide = loadStatewideCountySummary();
  const p5 = summarizePowerOfFiveForCounty("pulaski");
  const p5Brief = buildPowerOfFiveBriefing();
  const eventCtx = loadEventCountyContext("Pulaski County");

  console.log("County intelligence test");
  console.log("  bridge:", bridge);
  console.log("  counties:", counties.length);
  console.log("  pulaski readiness:", pulaski?.countyReadinessScore);
  console.log("  weak counties:", weak.length);
  console.log("  statewide top attention:", statewide.topAttention.length);
  console.log("  power of five pulaski goal:", p5?.goal);
  console.log("  event context:", eventCtx ? "yes" : "no");
  console.log("  tools:", SPRINT_COUNTY_INTELLIGENCE_TOOL_CONTRACTS.length);

  const ok =
    bridge &&
    counties.length >= 70 &&
    pulaski != null &&
    weak.length >= 1 &&
    statewide.counties.length >= 70 &&
    p5Brief.statewideGoal === 50_000 &&
    eventCtx != null &&
    SPRINT_COUNTY_INTELLIGENCE_TOOL_CONTRACTS.length === 20;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — countyWorkbench read-only bridge, KPI engine, Power of 5, event context");
}

main();
