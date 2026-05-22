/**
 * Single-campaign hardening + dashboard builder smoke.
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDashboardBlueprint } from "../src/lib/agents/dashboard-builder/dashboard-blueprint-builder";
import { DASHBOARD_COMPONENT_REGISTRY } from "../src/lib/agents/dashboard-builder/dashboard-component-registry";
import { recommendUserRolePlacement } from "../src/lib/agents/onboarding/user-role-placement-agent";
import { scorePresentationReadiness } from "../src/lib/agents/onboarding/presentation-readiness-scorer";
import { isKellySingleCampaignMode, KELLY_SOS_TENANT_ID } from "../src/lib/campaign-tenancy/single-campaign-mode";
import { SPRINT_SINGLE_CAMPAIGN_HARDENING_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-single-campaign-hardening-tools";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

function main() {
  const bp = buildDashboardBlueprint({
    roleLabel: "treasurer",
    taskDescription: "April reimbursement",
    freeformRequest: "Build me a treasurer dashboard for April reimbursement.",
    month: "2026-04",
  });
  const placement = recommendUserRolePlacement({
    who: "Volunteer",
    helpingWith: "mileage and receipts",
    experience: "some",
  });
  const presentation = scorePresentationReadiness(null);

  console.log("Single-campaign hardening test");
  console.log("  kellyMode:", isKellySingleCampaignMode(KELLY_SOS_TENANT_ID));
  console.log("  registryBlocks:", DASHBOARD_COMPONENT_REGISTRY.length);
  console.log("  blueprintBlocks:", bp.blocks.length);
  console.log("  blueprintSafe:", bp.doNotTouchAreas.length >= 3);
  console.log("  placementRole:", placement.role);
  console.log("  presentation:", presentation.score, presentation.label);
  console.log("  hardeningTools:", SPRINT_SINGLE_CAMPAIGN_HARDENING_TOOL_CONTRACTS.length);

  const ok =
    bp.blocks.length >= 3 &&
    bp.campaign === "kelly-sos" &&
    placement.firstTasks.length === 3 &&
    SPRINT_SINGLE_CAMPAIGN_HARDENING_TOOL_CONTRACTS.length === 16 &&
    presentation.score >= 70;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — dashboard builder, placement, Kelly single-campaign mode");
}

main();
