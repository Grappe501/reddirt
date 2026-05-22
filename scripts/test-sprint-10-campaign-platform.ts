/**
 * Sprint 10 — multi-campaign SaaS + campaign intelligence smoke (read-only).
 */
import { loadRedDirtEnv } from "./load-red-dirt-env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCampaignTenancyStore, getTenantContext, DEFAULT_TENANT_ID } from "../src/lib/campaign-tenancy/campaign-tenant-store";
import { buildCampaignStrategicIntelligence } from "../src/lib/agents/campaign-intelligence/strategic-intelligence-engine";
import { buildCampaignLearningLoopIntelligence } from "../src/lib/agents/campaign-intelligence/campaign-learning-loop-engine";
import { buildOperatorIntelligenceV2 } from "../src/lib/agents/campaign-intelligence/operator-intelligence-v2";
import { synthesizeCampaignMemory } from "../src/lib/agents/campaign-intelligence/campaign-memory-synthesizer";
import { SPRINT10_CAMPAIGN_INTELLIGENCE_TOOL_CONTRACTS } from "../src/lib/campaign-events/ai-tools/sprint-10-campaign-intelligence-tools";
import { loadCampaignEventsDashboard } from "../src/lib/campaign-events/load-campaign-events-dashboard";
import { loadGlobalUserObservations } from "../src/lib/agents/user-intelligence/user-observations";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadRedDirtEnv(path.join(__dirname, ".."));

async function main() {
  const store = loadCampaignTenancyStore();
  const kelly = getTenantContext(DEFAULT_TENANT_ID);
  const { snapshot } = await loadCampaignEventsDashboard("2026-03");
  const strategic = buildCampaignStrategicIntelligence({
    snapshot,
    tenant: kelly?.tenant ?? null,
    settings: kelly?.settings ?? null,
    period: "2026-03",
  });
  const learning = buildCampaignLearningLoopIntelligence(null, snapshot);
  const operator = buildOperatorIntelligenceV2({
    observations: loadGlobalUserObservations(),
    pathname: "/admin/ai-command-center",
    period: "2026-03",
    snapshot,
    strategicNarrative: strategic.executiveNarrative,
  });
  const memory = synthesizeCampaignMemory({
    tenantId: DEFAULT_TENANT_ID,
    period: "2026-03",
    observations: [],
    strategic,
    learning,
  });
  const readiness = Math.round(
    strategic.momentumScore * 0.4 + learning.eventSuccessScore * 0.2 + (100 - operator.fatigueScore) * 0.2 + 20,
  );

  console.log("Sprint 10 campaign platform test");
  console.log("  tenants:", store.tenants.length);
  console.log("  kelly:", kelly?.tenant.displayName);
  console.log("  momentum:", strategic.momentumScore);
  console.log("  readiness (smoke):", readiness);
  console.log("  strategicGaps:", strategic.strategicGaps.length);
  console.log("  sprint10Tools:", SPRINT10_CAMPAIGN_INTELLIGENCE_TOOL_CONTRACTS.length);
  console.log("  instinct:", memory.campaignInstinctLine.slice(0, 60) + "…");

  const ok =
    store.tenants.length >= 2 &&
    kelly?.tenant.id === DEFAULT_TENANT_ID &&
    readiness >= 0 &&
    readiness <= 100 &&
    SPRINT10_CAMPAIGN_INTELLIGENCE_TOOL_CONTRACTS.length >= 38 &&
    strategic.executiveNarrative.length > 20;

  if (!ok) {
    console.error("FAIL");
    process.exit(1);
  }
  console.log("OK — tenancy, strategic intelligence, learning/operator/memory smoke");
  console.log("  (full unified context runs on server via /admin/ai-command-center)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
