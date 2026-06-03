/**
 * Sprint 9 — Dashboard + navigation OS smoke (read-only).
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCampaignOsNavGroups,
  resolveActiveCampaignOsNavHref,
} from "../src/lib/dashboard-orchestration/campaign-os-nav-config";
import { buildWorkflowRouterV1 } from "../src/lib/dashboard-orchestration/workflow-router-v1";
import { buildAdaptiveDashboardPlan } from "../src/lib/dashboard-orchestration/adaptive-dashboard-orchestrator";
import { generateWorkflowGuidanceCards } from "../src/lib/dashboard-orchestration/workflow-guidance-generator";
import { buildExecutiveSummary } from "../src/lib/dashboard-orchestration/executive-summary-builder";
import { routePaletteQuery } from "../src/lib/dashboard-orchestration/palette-query-router";
import { analyzeOperatorCognitiveLoad } from "../src/lib/dashboard-orchestration/operator-cognitive-load-analyzer";
import { loadCampaignEventsDashboard } from "../src/lib/campaign-events/load-campaign-events-dashboard";
import { SPRINT9_DASHBOARD_NAV_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-dashboard-nav-9-tools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const period = "2026-03";
  const { snapshot } = await loadCampaignEventsDashboard(period);
  const groups = buildCampaignOsNavGroups(period);
  const intel = groups.find((g) => g.id === "intelligence");
  if (!intel) throw new Error("intelligence nav group missing");
  const counties = groups.find((g) => g.id === "counties");
  if (!counties) throw new Error("counties nav group missing");
  if (resolveActiveCampaignOsNavHref("/admin/county-intelligence", counties.links) !== "/admin/county-intelligence") {
    throw new Error("county-intelligence should activate Counties tab");
  }
  if (resolveActiveCampaignOsNavHref("/admin/intelligence/kim-hammer/debate-prep", intel.links) !== "/admin/intelligence/kim-hammer/debate-prep") {
    throw new Error("debate-prep should not leave Opposition research active");
  }
  if (intel.links.length < 13) {
    throw new Error("intelligence nav should list full debate-week surfaces (13)");
  }
  const routes = buildWorkflowRouterV1({
    pathname: "/admin/campaign-manager-dashboard",
    period,
    snapshot,
  });
  const guidance = generateWorkflowGuidanceCards({
    period,
    pathname: "/admin/campaign-events/reimbursement",
    snapshot,
  });
  const summary = buildExecutiveSummary({
    surface: "reimbursement",
    period,
    pathname: "/admin/campaign-events/reimbursement",
    snapshot,
  });
  const palette = routePaletteQuery("Close March reimbursement", period, snapshot);
  const adaptive = buildAdaptiveDashboardPlan({
    role: "campaign_manager",
    period,
    pathname: "/admin/campaign-manager-dashboard",
    snapshot,
  });
  const load = analyzeOperatorCognitiveLoad([], 8, 2);

  console.log("Sprint 9 dashboard navigation OS test");
  console.log("  navGroups:", groups.length);
  console.log("  navLinks:", groups.reduce((n, g) => n + g.links.length, 0));
  console.log("  workflowRoutes:", routes.length);
  console.log("  guidanceCards:", guidance.length);
  console.log("  executiveHeadline:", summary.headline);
  console.log("  paletteMatched:", palette?.matched);
  console.log("  paletteBlockers:", palette?.blockers.length ?? 0);
  console.log("  adaptiveTopActions:", adaptive.topActions.length);
  console.log("  sprint9Tools:", SPRINT9_DASHBOARD_NAV_TOOL_CONTRACTS.length);
  console.log("  cognitiveLoadScore:", load.score);

  const ok =
    groups.length >= 10 &&
    routes.length >= 1 &&
    summary.headline.length > 5 &&
    palette?.matched === true &&
    SPRINT9_DASHBOARD_NAV_TOOL_CONTRACTS.length === 20 &&
    adaptive.cardPriorities.length >= 5;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — nav, router, guidance, executive summary, palette routing");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
